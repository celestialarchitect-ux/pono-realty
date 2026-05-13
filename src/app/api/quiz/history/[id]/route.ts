// ABOUTME: Returns one quiz attempt's full answer detail — every question + variant the student saw + their answer.
// ABOUTME: Resolves question text from variant-pool by (questionId, variantIndex) so the student can review what they missed.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { wrapAsVariantQuestions, mergeVariantPool } from '@/lib/content/question-variants';
import { VARIANT_POOL } from '@/lib/content/variant-pool';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const attempt = await db.quizAttempt.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      kind: true,
      context: true,
      totalQuestions: true,
      correctCount: true,
      scorePct: true,
      completedAt: true,
      answers: {
        select: { questionId: true, variantIndex: true, selectedIndex: true, correctIndex: true, correct: true, createdAt: true },
      },
    },
  });

  if (!attempt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (attempt.userId !== session.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  // Resolve every (questionId, variantIndex) to the actual question text so
  // the student sees what they were asked, not just an internal ID. The
  // legacy question banks contribute variant 0; the variant pool contributes
  // 1..N. We rebuild the same lookup the quiz page uses at attempt time.
  const allChapters = [...NATIONAL_CONTENT, ...STATE_CONTENT];
  const lookup = new Map<string, { q: string; options: string[]; correctIndex: number; explain: string }>();
  for (const ch of allChapters) {
    const base = wrapAsVariantQuestions(ch.practice, ch.slug);
    const expanded = mergeVariantPool(base, VARIANT_POOL);
    for (const vq of expanded) {
      vq.variants.forEach((v, vi) => {
        lookup.set(`${vq.id}#${vi}`, {
          q: v.q,
          options: v.options as unknown as string[],
          correctIndex: v.correctIndex,
          explain: v.explain,
        });
      });
    }
  }

  const answers = attempt.answers
    .sort((a, b) => +a.createdAt - +b.createdAt)
    .map(a => {
      const key = `${a.questionId}#${a.variantIndex}`;
      const resolved = lookup.get(key);
      return {
        questionId: a.questionId,
        variantIndex: a.variantIndex,
        selectedIndex: a.selectedIndex,
        correctIndex: a.correctIndex,
        correct: a.correct,
        // If the variant has since been removed (rare — only if we delete pool entries),
        // we still surface the indices so the analytics don't break.
        q: resolved?.q ?? '(question text unavailable for this variant)',
        options: resolved?.options ?? [],
        explain: resolved?.explain ?? '',
      };
    });

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      kind: attempt.kind,
      context: attempt.context,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      scorePct: attempt.scorePct,
      completedAt: attempt.completedAt.toISOString(),
      passed: attempt.scorePct >= 70,
    },
    answers,
  });
}
