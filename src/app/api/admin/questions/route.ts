// ABOUTME: Full question + variant database for admin. Returns every question across all chapters + TOUGH_BANK.
// ABOUTME: Each question carries every variant (full wording, options, correct index, explanation) + attempt stats.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';
import { CURRICULUM } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { TOUGH_BANK } from '@/lib/content/exam-tough';
import { wrapAsVariantQuestions, mergeVariantPool } from '@/lib/content/question-variants';
import { VARIANT_POOL } from '@/lib/content/variant-pool';
import { TOUGH_VARIANT_POOL } from '@/lib/content/tough-variant-pool';
import { getAllOverrides, applyOverrideToVariant } from '@/lib/content/effective-variants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface VariantOut {
  index: number;
  q: string;
  options: string[];
  correctIndex: number;
  explain: string;
  // Per-variant attempt stats. Useful for spotting which specific variant
  // is the trickiest (vs. the concept overall).
  attempts: number;
  correctCount: number;
  // Override metadata — present iff an admin has edited this variant.
  override?: {
    editorName: string | null;
    reason: string | null;
    updatedAt: string;
  } | null;
}

interface QuestionOut {
  id: string;
  concept: string;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  portion: 'national' | 'state';
  variants: VariantOut[];
  // Rollup across all variants of this question.
  totalAttempts: number;
  totalCorrect: number;
  wrongPct: number;
}

interface ChapterGroup {
  slug: string;
  number: number;
  title: string;
  portion: 'national' | 'state';
  questionCount: number;
  variantCount: number;
  attempts: number;                  // # QuizAnswer rows for this chapter
  attemptCount: number;              // # QuizAttempt rows (one per quiz run)
  uniqueStudents: number;            // distinct user ids who ran a quiz here
  averageScorePct: number;           // avg of QuizAttempt.scorePct (0..100)
  passRatePct: number;               // % of attempts where scorePct >= 70
  averageWrongPct: number;           // avg wrong% across answers (legacy)
  questions: QuestionOut[];
}

interface ToughGroup {
  slug: 'tough-bank';
  title: string;
  questionCount: number;
  variantCount: number;
  attempts: number;
  averageWrongPct: number;
  questions: QuestionOut[];
}

interface HotSpot {
  questionId: string;
  concept: string;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  attempts: number;
  wrongPct: number;
}

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin && !hasRole(session, 'instructor')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Pull answers + chapter + mock attempts in parallel. Answers feed
  // per-question wrong% rollups; chapter attempts feed per-chapter pass
  // rate / avg score; mock attempts feed the 3-difficulty mock dossier.
  const [answers, attempts, mockAttempts, mockAnswers] = await Promise.all([
    db.quizAnswer.findMany({
      select: { questionId: true, variantIndex: true, correct: true },
    }),
    db.quizAttempt.findMany({
      where: { kind: 'chapter' },
      select: { id: true, context: true, scorePct: true, userId: true },
    }),
    db.quizAttempt.findMany({
      where: { kind: 'mock' },
      select: { id: true, context: true, scorePct: true, correctCount: true, totalQuestions: true, completedAt: true, userId: true },
      orderBy: { completedAt: 'desc' },
    }),
    db.quizAnswer.findMany({
      where: { attempt: { kind: 'mock' } },
      select: { attemptId: true, questionId: true, correct: true },
    }),
  ]);

  // Per-chapter (by `context` = slug) attempt aggregations.
  const chapterAttemptIds  = new Map<string, string[]>();      // slug → [attemptId]
  const chapterUserIds     = new Map<string, Set<string>>();    // slug → distinct user set
  const chapterScoreSum    = new Map<string, number>();         // slug → Σ scorePct
  const chapterPassCount   = new Map<string, number>();         // slug → # passing
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

  // Pull admin overrides keyed by (questionId#variantIndex).
  const overrideMap = await getAllOverrides(db);
  // Also pull the raw rows so we can apply them to the variant content.
  const overrideRows = await db.questionVariantOverride.findMany({
    select: { questionId: true, variantIndex: true, q: true, optionsJson: true, correctIndex: true, explain: true },
  });
  const overrideContentMap = new Map<string, typeof overrideRows[number]>();
  for (const o of overrideRows) overrideContentMap.set(`${o.questionId}#${o.variantIndex}`, o);

  // Build a (qid + '#' + variantIndex) → {attempts, correct} lookup, and
  // a qid → rollup lookup in parallel.
  const variantStats = new Map<string, { attempts: number; correct: number }>();
  const questionStats = new Map<string, { attempts: number; correct: number }>();
  for (const a of answers) {
    const vkey = `${a.questionId}#${a.variantIndex}`;
    const vs = variantStats.get(vkey) ?? { attempts: 0, correct: 0 };
    vs.attempts++; if (a.correct) vs.correct++;
    variantStats.set(vkey, vs);

    const qs = questionStats.get(a.questionId) ?? { attempts: 0, correct: 0 };
    qs.attempts++; if (a.correct) qs.correct++;
    questionStats.set(a.questionId, qs);
  }

  // ── Chapter groups ────────────────────────────────────────────────
  const chapterGroups: ChapterGroup[] = CURRICULUM.map(meta => {
    const content = [...NATIONAL_CONTENT, ...STATE_CONTENT].find(c => c.slug === meta.slug);
    const aIds = chapterAttemptIds.get(meta.slug) ?? [];
    const aCount = aIds.length;
    const uStudents = chapterUserIds.get(meta.slug)?.size ?? 0;
    const avgScore = aCount > 0 ? Math.round((chapterScoreSum.get(meta.slug) ?? 0) / aCount) : 0;
    const passRate = aCount > 0 ? Math.round(((chapterPassCount.get(meta.slug) ?? 0) / aCount) * 100) : 0;
    if (!content) {
      return {
        slug: meta.slug, number: meta.number, title: meta.title, portion: meta.portion,
        questionCount: 0, variantCount: 0, attempts: 0,
        attemptCount: aCount, uniqueStudents: uStudents, averageScorePct: avgScore, passRatePct: passRate,
        averageWrongPct: 0, questions: [],
      };
    }
    const base = wrapAsVariantQuestions(content.practice, meta.slug);
    const expanded = mergeVariantPool(base, VARIANT_POOL);
    const questions: QuestionOut[] = expanded.map(vq => {
      const rollup = questionStats.get(vq.id) ?? { attempts: 0, correct: 0 };
      const wrongPct = rollup.attempts > 0
        ? Math.round(((rollup.attempts - rollup.correct) / rollup.attempts) * 100)
        : 0;
      return {
        id: vq.id,
        concept: vq.concept ?? (vq.variants[0]?.q.slice(0, 80) ?? vq.id),
        chapterSlug: meta.slug,
        chapterNumber: meta.number,
        chapterTitle: meta.title,
        portion: meta.portion,
        variants: vq.variants.map((v, i) => {
          const vs = variantStats.get(`${vq.id}#${i}`) ?? { attempts: 0, correct: 0 };
          const ovKey = `${vq.id}#${i}`;
          const ovContent = overrideContentMap.get(ovKey);
          const effective = applyOverrideToVariant(v, ovContent);
          const ovMeta = overrideMap.get(ovKey);
          return {
            index: i,
            q: effective.q,
            options: effective.options as unknown as string[],
            correctIndex: effective.correctIndex,
            explain: effective.explain,
            attempts: vs.attempts,
            correctCount: vs.correct,
            override: ovMeta ? {
              editorName: ovMeta.editorName,
              reason: ovMeta.reason,
              updatedAt: ovMeta.updatedAt,
            } : null,
          };
        }),
        totalAttempts: rollup.attempts,
        totalCorrect: rollup.correct,
        wrongPct,
      };
    });
    // Aggregate chapter-level stats
    const totalAttempts = questions.reduce((s, q) => s + q.totalAttempts, 0);
    const chapterWrongPct = totalAttempts > 0
      ? Math.round(questions.reduce((s, q) => s + (q.totalAttempts - q.totalCorrect), 0) / totalAttempts * 100)
      : 0;
    const variantCount = questions.reduce((s, q) => s + q.variants.length, 0);
    return {
      slug: meta.slug,
      number: meta.number,
      title: meta.title,
      portion: meta.portion,
      questionCount: questions.length,
      variantCount,
      attempts: totalAttempts,
      attemptCount: aCount,
      uniqueStudents: uStudents,
      averageScorePct: avgScore,
      passRatePct: passRate,
      averageWrongPct: chapterWrongPct,
      questions,
    };
  });

  // ── Tough bank (mock-exam-only Hard/Gnarly items) ─────────────────
  // These don't live in a chapter — they're sampled directly into mocks
  // when the difficulty tier is Hard or Gnarly. They have synthetic
  // 'tough-{hash}' IDs computed by the practice page from question text.
  const toughHash = (s: string): string => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) + s.charCodeAt(i);
      h |= 0;
    }
    return `tough-${Math.abs(h).toString(36).slice(0, 7)}`;
  };
  const toughQuestions: QuestionOut[] = TOUGH_BANK.map(t => {
    const id = toughHash(t.q);
    const rollup = questionStats.get(id) ?? { attempts: 0, correct: 0 };
    const wrongPct = rollup.attempts > 0
      ? Math.round(((rollup.attempts - rollup.correct) / rollup.attempts) * 100)
      : 0;
    // Original (index 0) + any generated variants from TOUGH_VARIANT_POOL.
    const generated = TOUGH_VARIANT_POOL[id] ?? [];
    const allVariants = [
      { q: t.q, options: t.options as unknown as string[], correctIndex: t.correctIndex, explain: t.explain },
      ...generated.map(v => ({
        q: v.q,
        options: v.options as unknown as string[],
        correctIndex: v.correctIndex,
        explain: v.explain,
      })),
    ];
    return {
      id,
      concept: t.q.length > 80 ? t.q.slice(0, 79) + '…' : t.q,
      chapterSlug: t.chapterSlug,
      chapterNumber: 0,
      chapterTitle: `${t.portion === 'state' ? 'Hawaii' : 'National'} · ${t.difficulty}`,
      portion: t.portion,
      variants: allVariants.map((v, i) => {
        const vs = variantStats.get(`${id}#${i}`) ?? { attempts: 0, correct: 0 };
        const ovKey = `${id}#${i}`;
        const ovContent = overrideContentMap.get(ovKey);
        const effective = applyOverrideToVariant(v, ovContent);
        const ovMeta = overrideMap.get(ovKey);
        return {
          index: i,
          q: effective.q,
          options: effective.options as unknown as string[],
          correctIndex: effective.correctIndex,
          explain: effective.explain,
          attempts: vs.attempts,
          correctCount: vs.correct,
          override: ovMeta ? { editorName: ovMeta.editorName, reason: ovMeta.reason, updatedAt: ovMeta.updatedAt } : null,
        };
      }),
      totalAttempts: rollup.attempts,
      totalCorrect: rollup.correct,
      wrongPct,
    };
  });
  const toughTotal = toughQuestions.reduce((s, q) => s + q.totalAttempts, 0);
  const toughWrongPct = toughTotal > 0
    ? Math.round(toughQuestions.reduce((s, q) => s + (q.totalAttempts - q.totalCorrect), 0) / toughTotal * 100)
    : 0;
  const toughGroup: ToughGroup = {
    slug: 'tough-bank',
    title: 'Tough Bank (Hard/Gnarly mock-only)',
    questionCount: toughQuestions.length,
    variantCount: toughQuestions.length,
    attempts: toughTotal,
    averageWrongPct: toughWrongPct,
    questions: toughQuestions,
  };

  // Site-wide totals for the header KPIs
  const totalQuestions = chapterGroups.reduce((s, g) => s + g.questionCount, 0) + toughGroup.questionCount;
  const totalVariants  = chapterGroups.reduce((s, g) => s + g.variantCount, 0) + toughGroup.variantCount;
  const totalAttempts  = answers.length;
  // QuizAttempt-level totals (one row per quiz run) — drives the
  // "Quiz attempts" / "Unique students" / "Avg score" / "Pass rate" cards.
  const quizRunCount    = attempts.length;
  const uniqueStudents  = new Set(attempts.map(a => a.userId)).size;
  const averageScorePct = quizRunCount > 0 ? Math.round(attempts.reduce((s, a) => s + a.scorePct, 0) / quizRunCount) : 0;
  const passRatePct     = quizRunCount > 0
    ? Math.round((attempts.filter(a => a.scorePct >= 70).length / quizRunCount) * 100)
    : 0;

  // Hot spots: top 10 trickiest questions across the whole bank, gated by
  // attempts >= 3 to filter out single-bad-answer noise.
  const allQuestionsFlat = [
    ...chapterGroups.flatMap(g => g.questions),
    ...toughGroup.questions,
  ];
  const hotSpots: HotSpot[] = allQuestionsFlat
    .filter(q => q.totalAttempts >= 3)
    .map(q => ({
      questionId: q.id,
      concept: q.concept,
      chapterSlug: q.chapterSlug,
      chapterNumber: q.chapterNumber,
      chapterTitle: q.chapterTitle,
      attempts: q.totalAttempts,
      wrongPct: q.wrongPct,
    }))
    .sort((a, b) => b.wrongPct - a.wrongPct || b.attempts - a.attempts)
    .slice(0, 10);

  // ── Mock exam dossier (3 difficulty tiers) ─────────────────────────
  // The practice page records mock attempts with context = 'mock-standard'
  // | 'mock-hard' | 'mock-gnarly'. Group + aggregate per difficulty.
  const MOCK_DIFFICULTIES = ['standard', 'hard', 'gnarly'] as const;
  type MockDifficulty = typeof MOCK_DIFFICULTIES[number];
  interface MockStat {
    difficulty: MockDifficulty;
    attempts: number;          // # mock attempts
    uniqueStudents: number;
    averageScorePct: number;
    passRatePct: number;       // attempts with scorePct >= 75 (PSI pass bar)
    lastAttemptAt: string | null;
    // Cross-attempt question difficulty across mocks at this tier.
    trickiestQuestions: Array<{
      questionId: string;
      concept: string;
      attempts: number;
      wrongPct: number;
    }>;
  }
  // Build a quick map of questionId → concept text for resolving question
  // ids in the mock dossier (includes both chapter questions and tough bank).
  const conceptByQid = new Map<string, string>();
  for (const g of chapterGroups) {
    for (const q of g.questions) conceptByQid.set(q.id, q.concept);
  }
  for (const q of toughGroup.questions) conceptByQid.set(q.id, q.concept);

  const mockStats: MockStat[] = MOCK_DIFFICULTIES.map(d => {
    const ctx = `mock-${d}`;
    const tierAttempts = mockAttempts.filter(a => a.context === ctx);
    const tierAttemptIds = new Set(tierAttempts.map(a => a.id));
    const tierAnswers = mockAnswers.filter(a => tierAttemptIds.has(a.attemptId));

    const aCount = tierAttempts.length;
    const uniq = new Set(tierAttempts.map(a => a.userId)).size;
    const avg = aCount > 0 ? Math.round(tierAttempts.reduce((s, a) => s + a.scorePct, 0) / aCount) : 0;
    // PSI passes at 75% national + 70% state — we aggregate the overall
    // run scorePct against 75 as a conservative bar for the analytics view.
    const pass = aCount > 0 ? Math.round((tierAttempts.filter(a => a.scorePct >= 75).length / aCount) * 100) : 0;
    const last = tierAttempts[0]?.completedAt.toISOString() ?? null;

    const perQ = new Map<string, { attempts: number; correct: number }>();
    for (const ans of tierAnswers) {
      const e = perQ.get(ans.questionId) ?? { attempts: 0, correct: 0 };
      e.attempts++; if (ans.correct) e.correct++;
      perQ.set(ans.questionId, e);
    }
    const trickiest = [...perQ.entries()]
      .filter(([, s]) => s.attempts >= 2)
      .map(([qid, s]) => ({
        questionId: qid,
        concept: conceptByQid.get(qid) ?? qid,
        attempts: s.attempts,
        wrongPct: Math.round(((s.attempts - s.correct) / s.attempts) * 100),
      }))
      .sort((a, b) => b.wrongPct - a.wrongPct || b.attempts - a.attempts)
      .slice(0, 8);

    return {
      difficulty: d,
      attempts: aCount,
      uniqueStudents: uniq,
      averageScorePct: avg,
      passRatePct: pass,
      lastAttemptAt: last,
      trickiestQuestions: trickiest,
    };
  });

  return NextResponse.json({
    totals: {
      totalQuestions, totalVariants, totalAttempts,
      quizRunCount, uniqueStudents, averageScorePct, passRatePct,
    },
    chapters: chapterGroups,
    toughBank: toughGroup,
    hotSpots,
    mockExams: mockStats,
  });
}
