import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, verifyPassword, setSessionCookie, touchLastSeen } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Naive in-memory rate limit: 5 attempts per IP per 15 min.
// Replace with Redis for multi-instance deployments.
const ATTEMPTS = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function ipKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const rec = ATTEMPTS.get(key);
  if (!rec) { ATTEMPTS.set(key, { count: 1, firstAt: now }); return false; }
  if (now - rec.firstAt > WINDOW_MS) { ATTEMPTS.set(key, { count: 1, firstAt: now }); return false; }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }

  const key = ipKey(req);
  if (rateLimited(key)) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many login attempts. Try again in 15 minutes.' },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  if (!email || !password) return NextResponse.json({ error: 'invalid_credentials' }, { status: 400 });

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Same response shape as bad password — prevents user enumeration
    return NextResponse.json({ error: 'invalid_credentials', message: 'Email or password is incorrect.' }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'invalid_credentials', message: 'Email or password is incorrect.' }, { status: 401 });
  }

  await setSessionCookie(user.id, user.email);
  await touchLastSeen(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, tier: user.tier },
  });
}
