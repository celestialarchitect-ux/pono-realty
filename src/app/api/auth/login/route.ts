import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, verifyPassword, setSessionCookie, touchLastSeen } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Failure-aware rate limit. Two independent counters:
//
//   • email:<email>  → 10 failed attempts in 15 min triggers per-email lockout.
//                      Resets on a successful login.
//   • ip:<ip>        → 50 failed attempts in 15 min triggers per-IP lockout.
//                      Catches brute force that rotates emails.
//
// Why two counters: an IP-only limit at 5 locked out an entire household
// (couple sharing one router, family on the same network) the moment one
// person mistyped. An email-only limit lets a brute-forcer iterate
// passwords forever against a single account. We need both.
//
// Successful logins clear the per-email counter so a student who finally
// remembers their password doesn't stay locked out for 15 minutes.
//
// In-memory state — fine for the current single-instance deploy. Move to
// Redis when we add a second container.

const EMAIL_ATTEMPTS = new Map<string, { count: number; firstAt: number }>();
const IP_ATTEMPTS    = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_EMAIL_FAILS = 10;
const MAX_IP_FAILS    = 50;

function ipKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

// Returns true iff this key is currently locked out.
function isLocked(map: Map<string, { count: number; firstAt: number }>, key: string, max: number): boolean {
  const rec = map.get(key);
  if (!rec) return false;
  if (Date.now() - rec.firstAt > WINDOW_MS) {
    map.delete(key);
    return false;
  }
  return rec.count >= max;
}

// Records one failed attempt against the key. Caller decides afterward
// whether the result was a lockout (via isLocked).
function recordFailure(map: Map<string, { count: number; firstAt: number }>, key: string): void {
  const now = Date.now();
  const rec = map.get(key);
  if (!rec || now - rec.firstAt > WINDOW_MS) {
    map.set(key, { count: 1, firstAt: now });
  } else {
    rec.count += 1;
  }
}

// Periodically prune stale entries so the maps don't grow without bound.
// Triggered on the first request per minute — cheap.
let lastPrune = 0;
function maybePrune(): void {
  const now = Date.now();
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [k, v] of EMAIL_ATTEMPTS) if (now - v.firstAt > WINDOW_MS) EMAIL_ATTEMPTS.delete(k);
  for (const [k, v] of IP_ATTEMPTS)    if (now - v.firstAt > WINDOW_MS) IP_ATTEMPTS.delete(k);
}

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }

  maybePrune();

  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  if (!email || !password) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 400 });
  }

  const ip = ipKey(req);
  const emailKey = `email:${email}`;
  const ipKeyStr = `ip:${ip}`;

  // IP-wide brute-force gate (very high bar — only triggers on actual abuse).
  if (isLocked(IP_ATTEMPTS, ipKeyStr, MAX_IP_FAILS)) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many failed sign-in attempts from this network. Try again in 15 minutes.' },
      { status: 429 },
    );
  }
  // Per-email gate (forgiving — kicks in after 10 wrong passwords on the SAME email).
  if (isLocked(EMAIL_ATTEMPTS, emailKey, MAX_EMAIL_FAILS)) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many failed sign-in attempts on this account. Try again in 15 minutes, or use the password-reset link.' },
      { status: 429 },
    );
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Same response shape as bad password — prevents user enumeration.
    recordFailure(IP_ATTEMPTS, ipKeyStr);
    recordFailure(EMAIL_ATTEMPTS, emailKey);
    return NextResponse.json({ error: 'invalid_credentials', message: 'Email or password is incorrect.' }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    recordFailure(IP_ATTEMPTS, ipKeyStr);
    recordFailure(EMAIL_ATTEMPTS, emailKey);
    return NextResponse.json({ error: 'invalid_credentials', message: 'Email or password is incorrect.' }, { status: 401 });
  }

  // Success — clear the per-email counter so a student who finally
  // remembered their password isn't locked out by their earlier typos.
  // We keep the IP counter as-is (a successful login on one account
  // doesn't excuse brute force across many accounts).
  EMAIL_ATTEMPTS.delete(emailKey);

  await setSessionCookie(user.id, user.email);
  await touchLastSeen(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, tier: user.tier },
  });
}
