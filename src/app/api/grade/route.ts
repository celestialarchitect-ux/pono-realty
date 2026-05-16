// ABOUTME: Returns the current student's composite grade for the profile card.
// ABOUTME: Numeric score + weights are hidden from response by design.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { computeGrade } from '@/lib/grade';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const [quizAttempts, timeEvents, plan] = await Promise.all([
    db.quizAttempt.findMany({
      where: { userId: session.id },
      select: { scorePct: true, kind: true, context: true, completedAt: true },
      orderBy: { completedAt: 'desc' },
    }),
    db.timeEvent.findMany({
      where: { userId: session.id },
      select: { seconds: true, createdAt: true },
    }),
    // The student's goal date drives the commitment-component bar — when
    // they push the goal out, the required weekly pace drops and the
    // commitment grade rises accordingly.
    db.studyPlan.findUnique({
      where: { userId: session.id },
      select: { goalDate: true },
    }),
  ]);

  const result = computeGrade({
    quizAttempts,
    timeEvents,
    isAdmin: session.isAdmin,
    goalDate: plan?.goalDate ?? null,
  });

  // Strip the numeric private score before returning to the client. We
  // intentionally don't tell students "you got an 84.3" — they get the
  // letter only. The exact formula and weights stay server-side.
  return NextResponse.json({
    unlocked: result.unlocked,
    hoursStudied: result.hoursStudied,
    hoursToUnlock: result.hoursToUnlock,
    letter: result.letter,
    trend: result.trend,
  });
}
