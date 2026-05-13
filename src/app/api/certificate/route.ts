// ABOUTME: Issues a course-completion certificate when the student has met all gating criteria.
// ABOUTME: Eligibility: 60+ hours studied AND at least one mock attempt with score >= 70%.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATE_LAW_HOURS_REQUIRED = 60;
const PASSING_MOCK_PCT = 70;

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const [user, timeAgg, mocks] = await Promise.all([
    db.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, firstName: true, lastName: true, createdAt: true, passedExamAt: true },
    }),
    db.timeEvent.aggregate({ where: { userId: session.id }, _sum: { seconds: true } }),
    db.quizAttempt.findMany({
      where: { userId: session.id, kind: 'mock' },
      orderBy: { completedAt: 'asc' },
      select: { id: true, scorePct: true, completedAt: true, context: true },
    }),
  ]);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const totalSeconds = timeAgg._sum.seconds ?? 0;
  const hoursStudied = totalSeconds / 3600;
  const hoursOk = hoursStudied >= STATE_LAW_HOURS_REQUIRED;

  const firstPass = mocks.find(m => m.scorePct >= PASSING_MOCK_PCT);
  const mockOk = !!firstPass;

  const eligible = hoursOk && mockOk;

  // Use the first passing mock's completion timestamp as the certificate
  // issuance date — that's when the student first cleared the bar. If they
  // retake later, the cert keeps its original date (deterministic).
  const completedAt = firstPass?.completedAt ?? null;

  // Verification code: derived deterministically from userId + completedAt
  // so the cert always shows the same code for the same student, and an
  // admin can verify by looking up the userId via this code.
  let verificationCode: string | null = null;
  if (eligible && completedAt) {
    const seed = `${user.id}::${completedAt.toISOString()}`;
    let h = 5381;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) + h) + seed.charCodeAt(i);
      h |= 0;
    }
    verificationCode = `RFA-${Math.abs(h).toString(36).toUpperCase().slice(0, 9)}`;
  }

  return NextResponse.json({
    eligible,
    user: { id: user.id, name: user.name, firstName: user.firstName, lastName: user.lastName, enrolledAt: user.createdAt.toISOString() },
    progress: {
      hoursStudied: Math.round(hoursStudied * 10) / 10,
      hoursRequired: STATE_LAW_HOURS_REQUIRED,
      hoursRemaining: Math.max(0, +(STATE_LAW_HOURS_REQUIRED - hoursStudied).toFixed(1)),
      hoursOk,
    },
    mockExam: {
      attempts: mocks.length,
      bestScorePct: mocks.reduce((m, x) => Math.max(m, x.scorePct), 0),
      mockOk,
      passingThreshold: PASSING_MOCK_PCT,
    },
    completedAt: completedAt?.toISOString() ?? null,
    verificationCode,
  });
}
