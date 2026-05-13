// Practice exam bank — original questions modeled on the PSI Hawaii blueprint.
// Used for the Mock Exam timer and per-chapter quizzes.

import { NATIONAL_CONTENT } from './national';
import { STATE_CONTENT } from './state';
import type { PracticeQ } from './national';
import { TOUGH_BANK } from './exam-tough';

export interface ExamItem extends PracticeQ {
  chapterSlug: string;
  portion: 'national' | 'state';
  difficulty?: 'standard' | 'hard' | 'gnarly';
  // Stable index of this question within its source chapter's `practice`
  // array. Needed so we can derive the canonical questionId (used by
  // QuizAttempt analytics + QuizHistory drill-down). Items sourced from
  // TOUGH_BANK don't have a chapter index — the practice page falls back
  // to a text-hash ID for those.
  chapterIndex?: number;
}

export type ExamDifficulty = 'standard' | 'hard' | 'gnarly';

export const EXAM_BANK: ExamItem[] = [
  ...NATIONAL_CONTENT.flatMap(c => c.practice.map((q, i) => ({
    ...q, chapterSlug: c.slug, portion: 'national' as const, difficulty: 'standard' as const, chapterIndex: i,
  }))),
  ...STATE_CONTENT.flatMap(c => c.practice.map((q, i) => ({
    ...q, chapterSlug: c.slug, portion: 'state' as const, difficulty: 'standard' as const, chapterIndex: i,
  }))),
];

const TOUGH_AS_EXAM: ExamItem[] = TOUGH_BANK.map(q => ({
  q: q.q,
  options: q.options,
  correctIndex: q.correctIndex,
  explain: q.explain,
  chapterSlug: q.chapterSlug,
  portion: q.portion,
  difficulty: q.difficulty,
  chapterIndex: -1,
}));

/**
 * Sample a mock exam: 80 national + 50 state, weighted toward chapters with
 * more exam items per the PSI blueprint. Composition shifts by difficulty:
 *   - standard: 100% standard pool
 *   - hard:     ~65% standard + ~35% hard items injected
 *   - gnarly:   ~40% standard + remaining filled with hard + gnarly items
 */
export function sampleMockExam(seed?: number, difficulty: ExamDifficulty = 'standard'): ExamItem[] {
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((seed != null ? pseudo(seed + i) : Math.random()) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pickN = <T>(arr: T[], n: number): T[] => {
    if (arr.length === 0) return [];
    const out = [...shuffle(arr)];
    while (out.length < n) out.push(...shuffle(arr));
    return out.slice(0, n);
  };

  const stdNational = EXAM_BANK.filter(q => q.portion === 'national');
  const stdState    = EXAM_BANK.filter(q => q.portion === 'state');
  const hardNational   = TOUGH_AS_EXAM.filter(q => q.portion === 'national' && q.difficulty === 'hard');
  const hardState      = TOUGH_AS_EXAM.filter(q => q.portion === 'state'    && q.difficulty === 'hard');
  const gnarlyNational = TOUGH_AS_EXAM.filter(q => q.portion === 'national' && q.difficulty === 'gnarly');
  const gnarlyState    = TOUGH_AS_EXAM.filter(q => q.portion === 'state'    && q.difficulty === 'gnarly');

  let national: ExamItem[] = [];
  let state: ExamItem[] = [];

  if (difficulty === 'standard') {
    national = pickN(stdNational, EXAM_NATIONAL);
    state    = pickN(stdState,    EXAM_STATE);
  } else if (difficulty === 'hard') {
    const hardCountN = Math.min(hardNational.length, Math.round(EXAM_NATIONAL * 0.35));
    const hardCountS = Math.min(hardState.length,    Math.round(EXAM_STATE * 0.35));
    national = shuffle([...pickN(hardNational, hardCountN), ...pickN(stdNational, EXAM_NATIONAL - hardCountN)]);
    state    = shuffle([...pickN(hardState,    hardCountS), ...pickN(stdState,    EXAM_STATE    - hardCountS)]);
  } else {
    // gnarly — heavier mix of hard + gnarly items, lighter standard backfill
    const toughN = [...gnarlyNational, ...hardNational];
    const toughS = [...gnarlyState,    ...hardState];
    const toughCountN = Math.min(toughN.length, Math.round(EXAM_NATIONAL * 0.55));
    const toughCountS = Math.min(toughS.length, Math.round(EXAM_STATE * 0.55));
    national = shuffle([...pickN(toughN, toughCountN), ...pickN(stdNational, EXAM_NATIONAL - toughCountN)]);
    state    = shuffle([...pickN(toughS, toughCountS), ...pickN(stdState,    EXAM_STATE    - toughCountS)]);
  }

  return [...national, ...state];
}

function pseudo(n: number): number {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

export const EXAM_TOTAL = 130;
export const EXAM_NATIONAL = 80;
export const EXAM_STATE = 50;
export const EXAM_PASSING_PCT = 70;
export const EXAM_TIME_MINUTES = 240;

export const DIFFICULTY_META: Record<ExamDifficulty, { name: string; tagline: string; description: string }> = {
  standard: {
    name: 'Standard',
    tagline: 'Calibrated to the PSI baseline.',
    description: 'Same question style and difficulty distribution as the real Hawaii Salesperson Exam. The questions are clear, direct, and rewarded by knowing the material.',
  },
  hard: {
    name: 'Hard',
    tagline: 'Harder phrasing, tighter distractors.',
    description: 'A meaningful portion of the exam is replaced with harder items: longer scenarios, two-correct-but-one-best answers, and the trickier financing / agency edge cases.',
  },
  gnarly: {
    name: 'Gnarly',
    tagline: 'How the Hawaii exam earns its reputation.',
    description: 'The Hawaii PSI exam is notorious for tricky phrasing — double negatives, embedded red herrings, and gotchas on HRS 467 / 514B / HARPTA / Land Court. This tier leans heavily into that style. If you can pass Gnarly, the real exam will feel calm.',
  },
};
