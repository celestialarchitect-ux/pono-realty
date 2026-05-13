// ABOUTME: Returns the current student's recent quiz attempts (last 50) for the profile history card.
// ABOUTME: Lightweight — just attempt metadata; per-question detail is at /api/quiz/history/[id].

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { CURRICULUM } from '@/lib/curriculum';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const attempts = await db.quizAttempt.findMany({
    where: { userId: session.id },
    orderBy: { completedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      kind: true,
      context: true,
      totalQuestions: true,
      correctCount: true,
      scorePct: true,
      completedAt: true,
    },
  });

  const chapterTitleBySlug = new Map(CURRICULUM.map(c => [c.slug, { number: c.number, title: c.title, portion: c.portion }]));

  return NextResponse.json({
    attempts: attempts.map(a => {
      const meta = chapterTitleBySlug.get(a.context);
      return {
        id: a.id,
        kind: a.kind,
        context: a.context,
        contextLabel: meta
          ? `Ch. ${meta.number} · ${meta.title}`
          : a.context === 'mock-national' ? 'Mock exam · National portion'
          : a.context === 'mock-state'    ? 'Mock exam · State portion'
          : a.context === 'mock-full'     ? 'Full mock exam'
          : a.context,
        portion: meta?.portion ?? null,
        totalQuestions: a.totalQuestions,
        correctCount: a.correctCount,
        scorePct: a.scorePct,
        completedAt: a.completedAt.toISOString(),
        passed: a.scorePct >= 70,
      };
    }),
  });
}
