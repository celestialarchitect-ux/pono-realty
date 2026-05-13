// ABOUTME: Composite student grade — quiz performance + final exam + consistency + commitment.
// ABOUTME: Algorithm intentionally not advertised to students. Locked until they hit the unlock threshold.

import { type QuizAttempt, type TimeEvent } from '@prisma/client';

// Threshold of total study hours before we have enough data to show a
// grade. Below this the profile shows "your grade is calculating".
export const GRADE_UNLOCK_HOURS = 5;

// Weights (must sum to 100). Hidden by design — exposed in code only.
// Quiz performance is the heaviest because it's the most reliable signal.
const W_QUIZ        = 40; // average of recent quiz scores
const W_FINAL_EXAM  = 30; // most recent mock-full attempt
const W_CONSISTENCY = 20; // % of recent days with non-trivial study
const W_COMMITMENT  = 10; // hours/week pace toward goal

export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
export type GradeTrend = 'rising' | 'steady' | 'falling';

export interface GradeResult {
  unlocked: boolean;
  hoursStudied: number;
  hoursToUnlock: number;
  letter: LetterGrade | null;
  trend: GradeTrend | null;
  // Score 0..100 — kept private from the UI but useful for debugging /
  // admin views. We don't render it to the student.
  numericPrivate: number | null;
}

function letter(score: number): LetterGrade {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
}

// Compute a composite grade from the four data sources. All inputs are
// server-side primitives — no UI dependencies — so this function can be
// re-used by API routes, scripts, and tests.
export function computeGrade(input: {
  quizAttempts: Pick<QuizAttempt, 'scorePct' | 'kind' | 'context' | 'completedAt'>[];
  timeEvents:   Pick<TimeEvent,   'seconds' | 'createdAt'>[];
  // Optional: a pre-computed previous score for trend calculation.
  previousScore?: number | null;
  now?: Date;
}): GradeResult {
  const now = input.now ?? new Date();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const totalSeconds = input.timeEvents.reduce((s, e) => s + e.seconds, 0);
  const hoursStudied = totalSeconds / 3600;

  if (hoursStudied < GRADE_UNLOCK_HOURS) {
    return {
      unlocked: false,
      hoursStudied: Math.round(hoursStudied * 10) / 10,
      hoursToUnlock: Math.max(0, Math.round((GRADE_UNLOCK_HOURS - hoursStudied) * 10) / 10),
      letter: null,
      trend: null,
      numericPrivate: null,
    };
  }

  // QUIZ COMPONENT — average of the most recent attempt per chapter
  // (so retaking a quiz REPLACES the old score, mirroring "best of recent").
  const chapterAttempts = input.quizAttempts.filter(a => a.kind === 'chapter');
  const latestPerChapter = new Map<string, number>();
  // Iterate in date order so the LATEST overrides earlier.
  const sortedChapterAttempts = [...chapterAttempts].sort((a, b) => +a.completedAt - +b.completedAt);
  for (const a of sortedChapterAttempts) latestPerChapter.set(a.context, a.scorePct);
  const quizAvg = latestPerChapter.size > 0
    ? Array.from(latestPerChapter.values()).reduce((s, v) => s + v, 0) / latestPerChapter.size
    : 60; // baseline before any quiz is taken — gives a C-minus floor

  // FINAL EXAM COMPONENT — most recent 'mock-full' or fallback to highest mock attempt.
  const mockAttempts = input.quizAttempts.filter(a => a.kind === 'mock').sort((a, b) => +b.completedAt - +a.completedAt);
  const finalExam = mockAttempts.length > 0
    ? mockAttempts[0].scorePct
    : null;
  const examScore = finalExam ?? Math.max(50, quizAvg - 10); // proxy if no mock yet

  // CONSISTENCY COMPONENT — last 14 days, % of days with >= 15 minutes of study.
  // Encourages showing up most days, not just cramming.
  const fourteenDaysAgo = now.getTime() - 14 * DAY_MS;
  const dailySeconds = new Map<string, number>();
  for (const e of input.timeEvents) {
    if (e.createdAt.getTime() < fourteenDaysAgo) continue;
    const key = e.createdAt.toISOString().slice(0, 10);
    dailySeconds.set(key, (dailySeconds.get(key) ?? 0) + e.seconds);
  }
  const studyDays = Array.from(dailySeconds.values()).filter(s => s >= 15 * 60).length;
  // Out of the 14-day window. Cap at 14 (an extra study day doesn't help; consistency is the signal).
  const consistencyPct = Math.min(100, (studyDays / 14) * 100);

  // COMMITMENT COMPONENT — hours/week pace.
  // 7+ hrs/week = on a 2-month finish pace = 100. 0 hrs/week = 0.
  // Caps at 100 so a binge week doesn't game the score.
  const sevenDaysAgo = now.getTime() - 7 * DAY_MS;
  const weekSeconds = input.timeEvents
    .filter(e => e.createdAt.getTime() >= sevenDaysAgo)
    .reduce((s, e) => s + e.seconds, 0);
  const weekHours = weekSeconds / 3600;
  const commitmentPct = Math.min(100, (weekHours / 7) * 100);

  // Weighted composite
  const composite = (
    (quizAvg        * W_QUIZ        ) +
    (examScore      * W_FINAL_EXAM  ) +
    (consistencyPct * W_CONSISTENCY ) +
    (commitmentPct  * W_COMMITMENT  )
  ) / 100;

  // Trend = compare to previous numericPrivate if provided.
  let trend: GradeTrend = 'steady';
  if (typeof input.previousScore === 'number') {
    if (composite > input.previousScore + 1.5) trend = 'rising';
    else if (composite < input.previousScore - 1.5) trend = 'falling';
  }

  return {
    unlocked: true,
    hoursStudied: Math.round(hoursStudied * 10) / 10,
    hoursToUnlock: 0,
    letter: letter(Math.round(composite)),
    trend,
    numericPrivate: Math.round(composite * 10) / 10,
  };
}
