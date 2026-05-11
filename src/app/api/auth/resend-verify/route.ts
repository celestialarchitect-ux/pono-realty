import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { createEmailToken } from '@/lib/tokens';
import { sendMail, verifyEmailTemplate } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.SITE_URL || 'https://ralphfoulger.com';

// Re-issues a fresh 24-hour verify token + email for the currently signed-in
// user. Rate-limited softly by relying on createEmailToken's "invalidate prior
// un-used tokens" behavior — at most one verify token is live per user.
export async function POST() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const issued = await createEmailToken(user.id, 'verify');
  if (!issued) return NextResponse.json({ error: 'token_failed' }, { status: 500 });
  const link = `${SITE}/api/auth/verify?token=${issued.token}`;
  const tpl = verifyEmailTemplate({ name: user.name, link });
  await sendMail({ to: user.email, ...tpl, category: 'verify', userId: user.id });

  return NextResponse.json({ ok: true });
}
