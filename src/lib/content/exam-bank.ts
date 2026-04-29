// Practice exam bank — original questions modeled on the PSI Hawaii blueprint.
// Used for the Mock Exam timer and per-chapter quizzes.

import { NATIONAL_CONTENT } from './national';
import { STATE_CONTENT } from './state';
import type { PracticeQ } from './national';

export interface ExamItem extends PracticeQ {
  chapterSlug: string;
  portion: 'national' | 'state';
}

export const EXAM_BANK: ExamItem[] = [
  ...NATIONAL_CONTENT.flatMap(c => c.practice.map(q => ({ ...q, chapterSlug: c.slug, portion: 'national' as const }))),
  ...STATE_CONTENT.flatMap(c => c.practice.map(q => ({ ...q, chapterSlug: c.slug, portion: 'state' as const }))),
];

/**
 * Sample a mock exam: 80 national + 50 state, weighted toward chapters with
 * more exam items per the PSI blueprint. Falls back to repeats if pool too small.
 */
export function sampleMockExam(seed?: number): ExamItem[] {
  const national = EXAM_BANK.filter(q => q.portion === 'national');
  const state = EXAM_BANK.filter(q => q.portion === 'state');
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((seed != null ? pseudo(seed + i) : Math.random()) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pickN = <T>(arr: T[], n: number): T[] => {
    const out = [...shuffle(arr)];
    while (out.length < n) out.push(...shuffle(arr));
    return out.slice(0, n);
  };
  return [...pickN(national, 80), ...pickN(state, 50)];
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
