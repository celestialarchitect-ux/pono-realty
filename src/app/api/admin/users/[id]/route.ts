import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';
import { computeGrade } from '@/lib/grade';
import { CURRICULUM } from '@/lib/curriculum';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_ROLES = new Set(['admin', 'support', 'instructor', 'finance', 'content']);
const VALID_TIERS = new Set(['free', 'standard', 'plus', 'solo']);

// GET = full admin dossier on a single student. Admins + instructor-role
// staff can read; others 403.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin && !hasRole(session, 'instructor')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, firstName: true, lastName: true, name: true, phone: true,
      tier: true, isAdmin: true, roles: true, accessExpiresAt: true, emailVerifiedAt: true,
      stripeCustomerId: true, passedExamAt: true, createdAt: true, lastSeenAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const [quizAttempts, timeEvents, payments, plan] = await Promise.all([
    db.quizAttempt.findMany({
      where: { userId: id },
      orderBy: { completedAt: 'desc' },
      select: { id: true, kind: true, context: true, scorePct: true, correctCount: true, totalQuestions: true, completedAt: true },
      take: 100,
    }),
    db.timeEvent.findMany({
      where: { userId: id },
      select: { seconds: true, bucket: true, createdAt: true },
    }),
    db.payment.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, stripeSessionId: true, amountCents: true, currency: true, tier: true, status: true, createdAt: true },
    }),
    db.studyPlan.findUnique({
      where: { userId: id },
      select: { goalDate: true, includeWeekends: true, startHour: true, createdAt: true, updatedAt: true },
    }),
  ]);

  const grade = computeGrade({ quizAttempts, timeEvents });

  const totalSeconds = timeEvents.reduce((s, e) => s + e.seconds, 0);
  const sevenDaysAgo = Date.now() - 7 * 86400_000;
  const fourteenDaysAgo = Date.now() - 14 * 86400_000;
  const weekSeconds = timeEvents.filter(e => e.createdAt.getTime() >= sevenDaysAgo).reduce((s, e) => s + e.seconds, 0);
  const byBucket: Record<string, number> = {};
  for (const e of timeEvents) byBucket[e.bucket] = (byBucket[e.bucket] ?? 0) + e.seconds;
  const dailySec: Record<string, number> = {};
  for (const e of timeEvents) {
    if (e.createdAt.getTime() < fourteenDaysAgo) continue;
    const k = e.createdAt.toISOString().slice(0, 10);
    dailySec[k] = (dailySec[k] ?? 0) + e.seconds;
  }
  const consistencyDays = Object.values(dailySec).filter(s => s >= 900).length;

  const chapterScores = new Map<string, { scorePct: number; completedAt: Date }>();
  for (const a of [...quizAttempts].reverse()) {
    if (a.kind === 'chapter') chapterScores.set(a.context, { scorePct: a.scorePct, completedAt: a.completedAt });
  }
  const chapterRows = CURRICULUM.map(c => ({
    slug: c.slug, number: c.number, title: c.title, portion: c.portion,
    score: chapterScores.get(c.slug)?.scorePct ?? null,
    completedAt: chapterScores.get(c.slug)?.completedAt?.toISOString() ?? null,
  }));

  const lastMock = quizAttempts.find(a => a.kind === 'mock');
  const totalRevenueCents = payments.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amountCents, 0);

  return NextResponse.json({
    user: {
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      name: user.name, phone: user.phone, tier: user.tier, isAdmin: user.isAdmin,
      roles: user.roles,
      accessExpiresAt: user.accessExpiresAt?.toISOString() ?? null,
      emailVerified: !!user.emailVerifiedAt,
      stripeCustomerId: user.stripeCustomerId,
      passedExamAt: user.passedExamAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      lastSeenAt: user.lastSeenAt.toISOString(),
    },
    grade: {
      unlocked: grade.unlocked, letter: grade.letter, trend: grade.trend,
      hoursStudied: grade.hoursStudied, hoursToUnlock: grade.hoursToUnlock,
      numericPrivate: grade.numericPrivate,
    },
    studyTime: { totalSeconds, weekSeconds, consistencyDays, byBucket },
    quizAttempts: quizAttempts.map(a => ({
      id: a.id, kind: a.kind, context: a.context, scorePct: a.scorePct,
      correctCount: a.correctCount, totalQuestions: a.totalQuestions,
      completedAt: a.completedAt.toISOString(),
    })),
    chapterScores: chapterRows,
    lastMockScore: lastMock?.scorePct ?? null,
    payments: payments.map(p => ({
      id: p.id, stripeSessionId: p.stripeSessionId,
      amountUsd: Math.round(p.amountCents / 100),
      currency: p.currency, tier: p.tier, status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
    totalRevenueUsd: Math.round(totalRevenueCents / 100),
    plan: plan ? {
      goalDate: plan.goalDate.toISOString(),
      includeWeekends: plan.includeWeekends, startHour: plan.startHour,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    } : null,
  });
}

// PATCH = admin updates a user. Only full admins (isAdmin=true) can touch
// roles + isAdmin so granular role-holders can't escalate themselves.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasRole(session, 'admin')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  let body: { isAdmin?: boolean; roles?: string[]; tier?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  // Refuse to demote yourself from admin so you can't accidentally lock out
  // the only admin account.
  if (id === session.id && body.isAdmin === false) {
    return NextResponse.json({ error: 'cannot_demote_self', message: "You can't remove your own admin flag." }, { status: 400 });
  }

  const data: { isAdmin?: boolean; roles?: string[]; tier?: string } = {};
  if (typeof body.isAdmin === 'boolean') data.isAdmin = body.isAdmin;
  if (Array.isArray(body.roles)) {
    const clean = body.roles.filter(r => typeof r === 'string' && VALID_ROLES.has(r));
    data.roles = Array.from(new Set(clean));
  }
  if (typeof body.tier === 'string' && VALID_TIERS.has(body.tier)) {
    data.tier = body.tier;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  try {
    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, isAdmin: true, roles: true, tier: true },
    });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
