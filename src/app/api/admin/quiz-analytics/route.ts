// ABOUTME: Aggregates QuizAttempt + QuizAnswer for the admin /admin/quizzes dossier.
// ABOUTME: Returns per-chapter pass/fail rates + per-question right/wrong %, sorted by struggle.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';
import { CURRICULUM } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { autoQuestionId } from '@/lib/content/question-variants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface QuestionRow {
  questionId: string;
  concept: string;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  attempts: number;
  correctCount: number;
  wrongPct: number;        // 0..100 — higher = trickier
  variantsAvailable: number;
}

interface ChapterRow {
  slug: string;
  number: number;
  title: string;
  portion: 'national' | 'state';
  attempts: number;        // # of QuizAttempt rows
  uniqueStudents: number;
  averageScorePct: number; // avg of scorePct across attempts
  passRatePct: number;     // % of attempts where scorePct >= 70
  questions: QuestionRow[];
}

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin && !hasRole(session, 'instructor')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Build a {questionId → concept, chapter} lookup so the API can return
  // human-friendly labels even if a question was renamed or chapter moved.
  const conceptByQuestionId = new Map<string, { concept: string; chapterSlug: string; chapterNumber: number; chapterTitle: string; variantsAvailable: number }>();
  for (const chapter of [...NATIONAL_CONTENT, ...STATE_CONTENT]) {
    const meta = CURRICULUM.find(c => c.slug === chapter.slug);
    if (!meta) continue;
    chapter.practice.forEach((p, i) => {
      conceptByQuestionId.set(autoQuestionId(chapter.slug, i), {
        concept: p.q.length > 80 ? p.q.slice(0, 79) + '…' : p.q,
        chapterSlug: chapter.slug,
        chapterNumber: meta.number,
        chapterTitle: meta.title,
        // For now every question has 1 variant in the bank, plus any from
        // the variant pool — keep the count simple here.
        variantsAvailable: 1,
      });
    });
  }

  // Pull all chapter-quiz attempts + answers in one go. For an academy
  // with a few thousand attempts this stays under 10ms; if we ever scale
  // we can paginate by context.
  const [attempts, answers] = await Promise.all([
    db.quizAttempt.findMany({
      where: { kind: 'chapter' },
      select: { id: true, context: true, scorePct: true, userId: true },
    }),
    db.quizAnswer.findMany({
      select: { questionId: true, correct: true, attemptId: true },
    }),
  ]);

  // Per-chapter aggregation
  const chapterAttemptIds = new Map<string, string[]>();      // slug → [attemptId]
  const chapterUserIds    = new Map<string, Set<string>>();    // slug → set of userIds
  const chapterScoreSum   = new Map<string, number>();         // slug → sum of scorePct
  const chapterPassCount  = new Map<string, number>();         // slug → # passing attempts

  for (const a of attempts) {
    const arr = chapterAttemptIds.get(a.context) ?? [];
    arr.push(a.id);
    chapterAttemptIds.set(a.context, arr);

    const set = chapterUserIds.get(a.context) ?? new Set<string>();
    set.add(a.userId);
    chapterUserIds.set(a.context, set);

    chapterScoreSum.set(a.context, (chapterScoreSum.get(a.context) ?? 0) + a.scorePct);
    if (a.scorePct >= 70) chapterPassCount.set(a.context, (chapterPassCount.get(a.context) ?? 0) + 1);
  }

  // Per-question aggregation (across all variants of the same questionId)
  const questionStats = new Map<string, { attempts: number; correct: number }>();
  for (const ans of answers) {
    const s = questionStats.get(ans.questionId) ?? { attempts: 0, correct: 0 };
    s.attempts++;
    if (ans.correct) s.correct++;
    questionStats.set(ans.questionId, s);
  }

  // Build the per-chapter rows.
  const chapterRows: ChapterRow[] = CURRICULUM.map(meta => {
    const slug = meta.slug;
    const attemptCount = chapterAttemptIds.get(slug)?.length ?? 0;
    const studentCount = chapterUserIds.get(slug)?.size ?? 0;
    const avg = attemptCount > 0 ? Math.round((chapterScoreSum.get(slug) ?? 0) / attemptCount) : 0;
    const passRate = attemptCount > 0 ? Math.round(((chapterPassCount.get(slug) ?? 0) / attemptCount) * 100) : 0;

    // Build question rows for this chapter.
    const questions: QuestionRow[] = [];
    for (const [qid, info] of conceptByQuestionId.entries()) {
      if (info.chapterSlug !== slug) continue;
      const s = questionStats.get(qid) ?? { attempts: 0, correct: 0 };
      const wrongPct = s.attempts > 0 ? Math.round(((s.attempts - s.correct) / s.attempts) * 100) : 0;
      questions.push({
        questionId: qid,
        concept: info.concept,
        chapterSlug: slug,
        chapterNumber: meta.number,
        chapterTitle: meta.title,
        attempts: s.attempts,
        correctCount: s.correct,
        wrongPct,
        variantsAvailable: info.variantsAvailable,
      });
    }
    // Sort within chapter: trickiest first (highest wrong %), then by attempt count.
    questions.sort((a, b) => (b.wrongPct - a.wrongPct) || (b.attempts - a.attempts));

    return {
      slug,
      number: meta.number,
      title: meta.title,
      portion: meta.portion,
      attempts: attemptCount,
      uniqueStudents: studentCount,
      averageScorePct: avg,
      passRatePct: passRate,
      questions,
    };
  });

  // Hot spots: top 10 trickiest questions across the WHOLE academy
  // (where attempts >= 3 to filter out noise from a single bad answer).
  const allQuestions = chapterRows.flatMap(c => c.questions);
  const hotSpots = allQuestions
    .filter(q => q.attempts >= 3)
    .sort((a, b) => b.wrongPct - a.wrongPct)
    .slice(0, 10);

  // Site-wide totals
  const totalAttempts = attempts.length;
  const uniqueStudents = new Set(attempts.map(a => a.userId)).size;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + a.scorePct, 0) / totalAttempts)
    : 0;

  return NextResponse.json({
    totals: {
      totalAttempts,
      uniqueStudents,
      averageScorePct: avgScore,
      totalQuestions: conceptByQuestionId.size,
    },
    hotSpots,
    chapters: chapterRows,
  });
}
