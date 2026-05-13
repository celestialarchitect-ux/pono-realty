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
  attempts: number;
  averageWrongPct: number;
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

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin && !hasRole(session, 'instructor')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Pull all answer rows in one shot. With <100k attempts this is fine in
  // memory; we group below by (questionId, variantIndex).
  const answers = await db.quizAnswer.findMany({
    select: { questionId: true, variantIndex: true, correct: true },
  });

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
    if (!content) {
      return {
        slug: meta.slug, number: meta.number, title: meta.title, portion: meta.portion,
        questionCount: 0, variantCount: 0, attempts: 0, averageWrongPct: 0, questions: [],
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
          return {
            index: i,
            q: v.q,
            options: v.options as unknown as string[],
            correctIndex: v.correctIndex,
            explain: v.explain,
            attempts: vs.attempts,
            correctCount: vs.correct,
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
    const vs = variantStats.get(`${id}#0`) ?? { attempts: 0, correct: 0 };
    return {
      id,
      concept: t.q.length > 80 ? t.q.slice(0, 79) + '…' : t.q,
      chapterSlug: t.chapterSlug,
      chapterNumber: 0,
      chapterTitle: `${t.portion === 'state' ? 'Hawaii' : 'National'} · ${t.difficulty}`,
      portion: t.portion,
      variants: [{
        index: 0,
        q: t.q,
        options: t.options as unknown as string[],
        correctIndex: t.correctIndex,
        explain: t.explain,
        attempts: vs.attempts,
        correctCount: vs.correct,
      }],
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

  return NextResponse.json({
    totals: { totalQuestions, totalVariants, totalAttempts },
    chapters: chapterGroups,
    toughBank: toughGroup,
  });
}
