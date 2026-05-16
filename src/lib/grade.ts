// ABOUTME: Composite student grade — quiz performance + final exam + consistency + commitment.
// ABOUTME: Algorithm intentionally not advertised to students. Locked until they hit the unlock threshold.

import { type QuizAttempt, type TimeEvent } from '@prisma/client';

// Threshold of total study hours before we have enough data to show a
// grade. Below this the profile shows "your grade is calculating".
export const GRADE_UNLOCK_HOURS = 5;

// Weights (must sum to 100). Hidden by design — exposed in code only.
// Quiz performance is the heaviest because it's the most reliable signal.
const W_QUIZ        = 40; // BEST-of attempt per chapter, not latest
const W_FINAL_EXAM  = 30; // best mock-full attempt (or any mock if no full yet)
const W_CONSISTENCY = 20; // % of recent days with non-trivial study
const W_COMMITMENT  = 10; // hours/week pace toward goal

// Total study hours Hawaii requires before sitting for the PSI exam.
// The commitment component grades the student's pace AGAINST what they
// still need at their declared goal date — so adjusting the goal also
// adjusts the bar (loosening or tightening it as appropriate).
const REQUIRED_HOURS = 60;

// "Failing signal" threshold — when a student's BEST recorded quiz or mock
// score is below this, we'll allow the letter grade to dip below C-. With
// no failure signal anywhere, we never grade lower than C- because the
// student hasn't yet had an opportunity to prove they're below that.
const FAIL_SIGNAL_PCT = 60;

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
//
// Grading philosophy (post-update 2026-05-14):
//   • Retake-friendly. Best score per chapter / mock wins — earlier
//     attempts can't drag the grade down once you've improved.
//   • Benefit of the doubt. With NO quiz attempts and NO mock attempts,
//     we don't fabricate a low baseline — those components drop out and
//     their weight shifts to commitment+consistency.
//   • No F without evidence. The letter grade floors at C- unless there's
//     an actual failed-quiz or failed-mock signal (best score < 60%).
//   • Goal-aware commitment. Pushing your study-plan goal out lowers the
//     required weekly pace, lifting the commitment component.
export function computeGrade(input: {
  quizAttempts: Pick<QuizAttempt, 'scorePct' | 'kind' | 'context' | 'completedAt'>[];
  timeEvents:   Pick<TimeEvent,   'seconds' | 'createdAt'>[];
  previousScore?: number | null;
  now?: Date;
  // Admin accounts bypass the 5-hour unlock threshold so instructors can
  // QA the grade UI / formula on their own account without padding hours.
  isAdmin?: boolean;
  // Goal date from the student's StudyPlan. Used to compute the required
  // hours/week pace; when goal moves out, the commitment bar drops and
  // a fixed weekly cadence scores better. Null = no plan set, in which
  // case we fall back to a default "comfortable" pace of 7 hrs/week.
  goalDate?: Date | null;
}): GradeResult {
  const now = input.now ?? new Date();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const totalSeconds = input.timeEvents.reduce((s, e) => s + e.seconds, 0);
  const hoursStudied = totalSeconds / 3600;

  if (hoursStudied < GRADE_UNLOCK_HOURS && !input.isAdmin) {
    return {
      unlocked: false,
      hoursStudied: Math.round(hoursStudied * 10) / 10,
      hoursToUnlock: Math.max(0, Math.round((GRADE_UNLOCK_HOURS - hoursStudied) * 10) / 10),
      letter: null,
      trend: null,
      numericPrivate: null,
    };
  }

  // QUIZ COMPONENT — BEST score per chapter. Retaking a quiz can only
  // ever HELP your grade; a worse retake never pulls it down. When no
  // chapter quiz has been attempted yet, the component drops out of the
  // weighted average entirely (its weight reallocates to the other
  // components) rather than imposing a punitive baseline.
  const chapterAttempts = input.quizAttempts.filter(a => a.kind === 'chapter');
  const bestPerChapter = new Map<string, number>();
  for (const a of chapterAttempts) {
    const cur = bestPerChapter.get(a.context) ?? -1;
    if (a.scorePct > cur) bestPerChapter.set(a.context, a.scorePct);
  }
  const hasQuizData = bestPerChapter.size > 0;
  const quizAvg = hasQuizData
    ? Array.from(bestPerChapter.values()).reduce((s, v) => s + v, 0) / bestPerChapter.size
    : 0;
  // Track the worst best-of so we know whether to allow grades below C-.
  const worstBestQuiz = hasQuizData
    ? Math.min(...Array.from(bestPerChapter.values()))
    : 100;

  // FINAL EXAM COMPONENT — best mock score across all attempts. Same
  // retake-friendly rule. If no mocks taken yet, drops out.
  const mockAttempts = input.quizAttempts.filter(a => a.kind === 'mock');
  const hasMockData = mockAttempts.length > 0;
  const bestMock = hasMockData
    ? Math.max(...mockAttempts.map(a => a.scorePct))
    : 0;

  // CONSISTENCY COMPONENT — last 14 days, % of days with >= 15 minutes of
  // study. Floor at 50% so an early student with only a few days of
  // history doesn't get crushed before the system has enough data to
  // grade them on consistency.
  const fourteenDaysAgo = now.getTime() - 14 * DAY_MS;
  const dailySeconds = new Map<string, number>();
  for (const e of input.timeEvents) {
    if (e.createdAt.getTime() < fourteenDaysAgo) continue;
    const key = e.createdAt.toISOString().slice(0, 10);
    dailySeconds.set(key, (dailySeconds.get(key) ?? 0) + e.seconds);
  }
  const studyDays = Array.from(dailySeconds.values()).filter(s => s >= 15 * 60).length;
  const rawConsistency = Math.min(100, (studyDays / 14) * 100);
  // Generous floor — show up for 7 of 14 days and you're at 100; show up
  // never and you still get a 50 floor so it doesn't crater the grade.
  const consistencyPct = Math.max(50, rawConsistency * 2);

  // COMMITMENT COMPONENT — hours/week pace, graded against the student's
  // OWN goal date when they've set a StudyPlan.
  const sevenDaysAgo = now.getTime() - 7 * DAY_MS;
  const weekSeconds = input.timeEvents
    .filter(e => e.createdAt.getTime() >= sevenDaysAgo)
    .reduce((s, e) => s + e.seconds, 0);
  const weekHours = weekSeconds / 3600;

  let requiredHoursPerWeek: number;
  if (input.goalDate && hoursStudied < REQUIRED_HOURS) {
    const msUntilGoal = input.goalDate.getTime() - now.getTime();
    const daysUntil = Math.max(1, msUntilGoal / DAY_MS);
    const weeksUntil = daysUntil / 7;
    const remainingHours = Math.max(0, REQUIRED_HOURS - hoursStudied);
    requiredHoursPerWeek = Math.max(2, remainingHours / weeksUntil);
  } else if (hoursStudied >= REQUIRED_HOURS) {
    requiredHoursPerWeek = Math.max(1, weekHours);
  } else {
    requiredHoursPerWeek = 7;
  }
  const commitmentPct = Math.min(100, (weekHours / requiredHoursPerWeek) * 100);

  // ── Weighted composite, but only over components with actual data ──
  // If no quiz / no mock yet, those components drop out and the remaining
  // weights renormalize. Result: a brand-new student isn't crushed by a
  // fabricated 60-baseline they never had a chance to dispute.
  const components: Array<{ score: number; weight: number }> = [];
  if (hasQuizData) components.push({ score: quizAvg, weight: W_QUIZ });
  if (hasMockData) components.push({ score: bestMock, weight: W_FINAL_EXAM });
  components.push({ score: consistencyPct, weight: W_CONSISTENCY });
  components.push({ score: commitmentPct, weight: W_COMMITMENT });

  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const weightedSum = components.reduce((s, c) => s + c.score * c.weight, 0);
  let composite = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // FLOOR: no F-tier grades without an actual failure signal. If the
  // student's worst best-of-quiz is still ≥60% (and best mock is ≥60% or
  // they haven't taken one), don't let the letter drop below C-. They
  // haven't been given a chance to fail; we shouldn't say they did.
  const hasFailSignal =
    (hasQuizData && worstBestQuiz < FAIL_SIGNAL_PCT) ||
    (hasMockData && bestMock < FAIL_SIGNAL_PCT);
  if (!hasFailSignal) {
    composite = Math.max(composite, 70); // C- floor
  }

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
