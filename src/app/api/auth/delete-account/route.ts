// ABOUTME: Authenticated self-serve account deletion. Requires password re-entry.
// ABOUTME: Cascades all owned rows (study time, plan, quizzes, payments, messages, tickets).

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'rfs_session';

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { password?: string; confirm?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  // Two-factor confirmation: must re-enter password AND type 'delete' to
  // confirm. Anyone with momentary access to a logged-in session shouldn't
  // be able to nuke the account with a single click.
  if (body.confirm !== 'delete') {
    return NextResponse.json({ error: 'confirm_required', message: "Type 'delete' to confirm." }, { status: 400 });
  }
  if (!body.password || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'password_required', message: 'Re-enter your password to delete the account.' }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, passwordHash: true, isAdmin: true },
  });
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Refuse to delete the last admin so we don't get locked out of /admin.
  if (user.isAdmin) {
    const adminCount = await db.user.count({ where: { isAdmin: true } });
    if (adminCount <= 1) {
      return NextResponse.json({
        error: 'last_admin',
        message: 'You are the only admin. Promote another user before deleting this account.',
      }, { status: 409 });
    }
  }

  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }

  // Cascade cleanup. TimeEvent / EmailToken / StudyPlan / QuizAttempt
  // (with QuizAnswer via attempt) all cascade automatically on User
  // delete per the Prisma schema. Payment / Message / SupportTicket
  // reference userId as a scalar and DON'T cascade — clean them first.
  //
  // Payment records are deleted in this build. Tax / refund history
  // remains available in the Stripe dashboard as the source of truth.
  await db.payment.deleteMany({ where: { userId: user.id } });
  await db.message.deleteMany({ where: { userId: user.id } });
  await db.supportTicket.deleteMany({ where: { userId: user.id } });

  // Finally, delete the user. Cascade rules wipe TimeEvent, EmailToken,
  // StudyPlan, QuizAttempt → QuizAnswer in one transaction.
  await db.user.delete({ where: { id: user.id } });

  // Clear the session cookie so the browser doesn't keep the dead token.
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ ok: true, deleted: user.id });
}
