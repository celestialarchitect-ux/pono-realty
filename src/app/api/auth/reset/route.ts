import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, hashPassword, setSessionCookie } from '@/lib/auth';
import { consumeEmailToken } from '@/lib/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }
  let body: { token?: string; password?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const token = (body.token ?? '').trim();
  const password = body.password ?? '';
  if (!token) return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  if (password.length < 10) return NextResponse.json({ error: 'weak_password', message: 'Password must be at least 10 characters.' }, { status: 400 });

  const consumed = await consumeEmailToken(token, 'reset');
  if (!consumed) return NextResponse.json({ error: 'invalid_or_expired_token', message: 'This reset link has expired or already been used. Request a new one.' }, { status: 400 });

  const passwordHash = await hashPassword(password);
  const user = await db.user.update({
    where: { id: consumed.userId },
    data: { passwordHash },
    select: { id: true, email: true, name: true, isAdmin: true, tier: true },
  });
  // Auto-login after successful reset
  await setSessionCookie(user.id, user.email);
  return NextResponse.json({ user });
}
