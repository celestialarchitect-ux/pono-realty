import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, hashPassword, setSessionCookie, isBootstrapAdminEmail } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.json(
      { error: 'auth_unavailable', message: 'Account system not yet provisioned. Email support@ralphfoulger.com.' },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string; name?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  const name = (body.name ?? '').trim();

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  if (password.length < 10) return NextResponse.json({ error: 'weak_password', message: 'Password must be at least 10 characters.' }, { status: 400 });
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: 'invalid_name' }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'email_taken' }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      name,
      isAdmin: isBootstrapAdminEmail(email),
    },
    select: { id: true, email: true, name: true, isAdmin: true, tier: true },
  });

  await setSessionCookie(user.id, user.email);
  return NextResponse.json({ user });
}
