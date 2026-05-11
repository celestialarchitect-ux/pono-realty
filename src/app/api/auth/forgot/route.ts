import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured } from '@/lib/auth';
import { createEmailToken } from '@/lib/tokens';
import { sendMail, resetPasswordTemplate } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.SITE_URL || 'https://ralphfoulger.com';

// Per-IP rate limit on this endpoint to slow enumeration probes.
const ATTEMPTS = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
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

  if (rateLimited(ipKey(req))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: { email?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const email = (body.email ?? '').trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });

  // ALWAYS return success — prevents email enumeration. The work below is
  // best-effort and silently no-ops if the email is not registered.
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    try {
      const issued = await createEmailToken(user.id, 'reset');
      if (issued) {
        const link = `${SITE}/reset-password?token=${issued.token}`;
        const tpl = resetPasswordTemplate({ name: user.name, link });
        await sendMail({ to: user.email, ...tpl, category: 'reset', userId: user.id });
      }
    } catch (err) {
      console.warn('forgot: dispatch failed', err);
    }
  }
  return NextResponse.json({ ok: true });
}
