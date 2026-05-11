import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, hashPassword, setSessionCookie, isBootstrapAdminEmail } from '@/lib/auth';
import { createEmailToken } from '@/lib/tokens';
import { sendMail, verifyEmailTemplate } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE = process.env.SITE_URL || 'https://ralphfoulger.com';

// Loose phone validation — strips formatting, requires 7-15 digits. We don't
// enforce a specific country code so Hawaii residents can use 808-xxx-xxxx
// without prefixing +1.
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, '');
  const justDigits = digits.replace(/^\+/, '');
  if (justDigits.length < 7 || justDigits.length > 15) return null;
  return digits;
}

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.json(
      { error: 'auth_unavailable', message: 'Account system not yet provisioned. Email support@ralphfoulger.com.' },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string; firstName?: string; lastName?: string; phone?: string; name?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  const firstName = (body.firstName ?? '').trim();
  const lastName = (body.lastName ?? '').trim();
  const rawPhone = (body.phone ?? '').trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (password.length < 10) {
    return NextResponse.json({ error: 'weak_password', message: 'Password must be at least 10 characters.' }, { status: 400 });
  }
  if (firstName.length < 1 || firstName.length > 60) {
    return NextResponse.json({ error: 'invalid_first_name', message: 'First name is required.' }, { status: 400 });
  }
  if (lastName.length < 1 || lastName.length > 60) {
    return NextResponse.json({ error: 'invalid_last_name', message: 'Last name is required.' }, { status: 400 });
  }

  let phone: string | null = null;
  if (rawPhone.length > 0) {
    phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json({ error: 'invalid_phone', message: 'Phone number looks invalid. Leave blank or use a real number.' }, { status: 400 });
    }
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'email_taken' }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const name = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim();
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      name,
      isAdmin: isBootstrapAdminEmail(email),
    },
    select: { id: true, email: true, name: true, firstName: true, lastName: true, isAdmin: true, tier: true },
  });

  await setSessionCookie(user.id, user.email);

  // Best-effort verify email; non-fatal if it fails.
  try {
    const issued = await createEmailToken(user.id, 'verify');
    if (issued) {
      const link = `${SITE}/api/auth/verify?token=${issued.token}`;
      const tpl = verifyEmailTemplate({ name: user.firstName, link });
      await sendMail({ to: user.email, ...tpl, category: 'verify', userId: user.id });
    }
  } catch (err) {
    console.warn('signup: verify-email dispatch failed', err);
  }

  return NextResponse.json({ user });
}
