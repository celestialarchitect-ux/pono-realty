// ABOUTME: Daily lesson-plan generator. Builds class-schedule-style daily plans from a goal date.
// ABOUTME: Distributes the 20-chapter curriculum + flashcards + math + quizzes + mocks across study days.

import { CURRICULUM, type ChapterMeta } from './curriculum';

// Total minutes the curriculum READING covers (chapter content only, no
// flashcards / math / quizzes / mocks). Sums to ~17 hours.
export const CURRICULUM_TOTAL_MINUTES = CURRICULUM.reduce((s, c) => s + c.estimatedMinutes, 0);

// Hawaii requires 60 documented study hours. Subtract chapter reading and
// the remainder is the "support work" minutes — flashcards, drills, quizzes,
// mocks, review. ~43 hours at standard pacing.
export const STATE_LAW_TOTAL_MINUTES = 60 * 60;

export type ActivityType =
  | 'chapter'      // read/listen to a specific chapter
  | 'flashcards'   // smart flashcards (spaced repetition)
  | 'math'         // math drills
  | 'quiz'         // end-of-chapter quiz
  | 'mock'         // mock exam practice
  | 'glossary'     // glossary review (light)
  | 'review';      // dedicated review (final week)

export interface Activity {
  type: ActivityType;
  title: string;          // human-readable label
  subtitle?: string;      // e.g., "national portion · 22 key terms"
  minutes: number;        // minutes allocated to this block
  href?: string;          // deep link into the academy
  chapterSlug?: string;   // present for type='chapter' and type='quiz'
  chapterNumber?: number;
}

export interface DailyPlan {
  date: string;            // YYYY-MM-DD
  totalMinutes: number;    // sum of all activity minutes
  activities: Activity[];
  // True when this day spans a chapter boundary (used for calendar chips)
  startsChapter: ChapterMeta | null;
  // True for the final 20% of the timeline — review/mock-heavy
  isReviewWeek: boolean;
}

// Compute a deterministic daily lesson plan for an entire schedule.
//
// Inputs:
//   scheduleableDates — array of YYYY-MM-DD that are study days (caller
//                       already filtered out rest days / overrides=0)
//   perDayMinutes     — target minutes per day (caller computes this from
//                       remaining work / scheduleable day count)
//   hoursAlreadyStudied — used to skip chapters the user has already
//                         clearly invested in (read from TimeEvent.byPath)
//   byChapterPathMinutes — minutes studied per /course/{slug} path
//
// Returns one DailyPlan per scheduleable date.
//
// Algorithm:
//   1. Compute per-chapter "remaining minutes" = chapter.estimatedMinutes minus
//      what the student already read. Chapters already complete are skipped.
//   2. Distribute remaining chapter minutes across the FIRST 70% of dates,
//      respecting chapter order, weighted by chapter size. A single day
//      can contain multiple short chapters or a partial long chapter.
//   3. The last 30% of dates is "review" — mock exams, comprehensive review,
//      flashcard sprints.
//   4. Every day gets a 15-min flashcard block (spaced repetition is the
//      single biggest retention boost) + a small glossary tail.
//   5. Math drill days are inserted every 3 days starting from the first
//      day that includes Chapter 10 (Real Estate Calculations) onward.
//   6. End-of-chapter quizzes are scheduled on the same day a chapter
//      completes, in addition to that day's normal flashcard block.
//   7. The final day always reserves a 60-minute "full mock exam" block.
//
// All allocations are clamped so a single day never exceeds 1.5 × perDayMinutes
// (a hard cap protects against a tiny window producing 8-hour days).
export function buildDailyLessonPlan(
  scheduleableDates: string[],
  perDayMinutes: number,
  byChapterPathMinutes: Record<string, number>,
): DailyPlan[] {
  const n = scheduleableDates.length;
  if (n === 0) return [];

  // Cap per-day to keep plans sane even on aggressive 2-week schedules.
  // 6 hours = the upper end of "full-time studying" most adults can sustain.
  const dayCap = Math.min(360, Math.max(perDayMinutes, Math.ceil(perDayMinutes * 1.5)));

  // Mark review window — last 30% of the schedule (min 2 days, max 14).
  const reviewWindowSize = Math.max(2, Math.min(14, Math.floor(n * 0.30)));
  const reviewStartIdx = Math.max(0, n - reviewWindowSize);

  // Compute chapter remaining minutes
  const chapterPlan = CURRICULUM.map(c => {
    const studied = byChapterPathMinutes[`/course/${c.slug}`] ?? 0;
    const remaining = Math.max(0, c.estimatedMinutes - studied);
    return { chapter: c, remaining };
  });

  // Distribute chapter minutes across content days (the first n - reviewWindowSize).
  // Walk chapters in order; for each day, fill until budget is hit or no chapter left.
  const days: DailyPlan[] = scheduleableDates.map((date, idx) => ({
    date,
    totalMinutes: 0,
    activities: [],
    startsChapter: null,
    isReviewWeek: idx >= reviewStartIdx,
  }));

  const contentDays = days.slice(0, reviewStartIdx);

  let chapterIdx = 0;
  let chapterRemaining = chapterPlan[chapterIdx]?.remaining ?? 0;
  // Reading budget per content day. Don't let any single day spend more
  // than 70% on a single chapter read — leave headroom for flashcards/etc.
  const readingBudgetPerDay = Math.min(
    Math.floor(perDayMinutes * 0.7),
    Math.ceil(CURRICULUM_TOTAL_MINUTES / Math.max(1, contentDays.length)) + 5,
  );

  for (const day of contentDays) {
    let budget = readingBudgetPerDay;
    let firstChapterOfDay: ChapterMeta | null = null;

    while (budget > 0 && chapterIdx < chapterPlan.length) {
      const cp = chapterPlan[chapterIdx];
      if (cp.remaining === 0) {
        // skip already-complete chapters
        chapterIdx++;
        chapterRemaining = chapterPlan[chapterIdx]?.remaining ?? 0;
        continue;
      }
      const take = Math.min(budget, cp.remaining);
      day.activities.push({
        type: 'chapter',
        title: `Chapter ${cp.chapter.number}: ${cp.chapter.title}`,
        subtitle: `${cp.chapter.portion === 'state' ? 'Hawaii state portion' : 'National portion'} · ${cp.chapter.examItems} exam items · ${cp.chapter.keyTerms} key terms`,
        minutes: take,
        href: `/course/${cp.chapter.slug}`,
        chapterSlug: cp.chapter.slug,
        chapterNumber: cp.chapter.number,
      });
      if (!firstChapterOfDay) firstChapterOfDay = cp.chapter;
      cp.remaining -= take;
      budget -= take;
      chapterRemaining = cp.remaining;

      // If a chapter completes on this day, schedule its quiz on the same
      // day (15 min).
      if (cp.remaining === 0) {
        day.activities.push({
          type: 'quiz',
          title: `Chapter ${cp.chapter.number} quiz`,
          subtitle: `End-of-chapter check · ${cp.chapter.examItems} questions`,
          minutes: 15,
          href: `/quizzes/${cp.chapter.slug}`,
          chapterSlug: cp.chapter.slug,
          chapterNumber: cp.chapter.number,
        });
        chapterIdx++;
        chapterRemaining = chapterPlan[chapterIdx]?.remaining ?? 0;
      }
    }

    day.startsChapter = firstChapterOfDay;
  }

  // REVIEW window — fill with mocks + comprehensive flashcards.
  // Last day gets the big full mock; earlier review days alternate between
  // category mocks and key-term flashcards.
  const reviewDays = days.slice(reviewStartIdx);
  reviewDays.forEach((day, i) => {
    const isLastDay = i === reviewDays.length - 1;
    if (isLastDay) {
      day.activities.push({
        type: 'mock',
        title: 'Full 130-question mock exam (timed)',
        subtitle: 'Hardest difficulty · simulates real PSI conditions',
        minutes: 90,
        href: '/practice?difficulty=hard&full=true',
      });
      day.activities.push({
        type: 'review',
        title: 'Final review of weak topics',
        subtitle: 'Focus on chapters with sub-70% quiz scores',
        minutes: 45,
        href: '/profile',
      });
    } else if (i % 2 === 0) {
      day.activities.push({
        type: 'mock',
        title: 'Mock exam — Hawaii state portion',
        subtitle: '50 questions · medium difficulty',
        minutes: 45,
        href: '/practice?portion=state',
      });
      day.activities.push({
        type: 'review',
        title: 'Review state-portion weak chapters',
        subtitle: 'Hawaii license law, contracts, escrow',
        minutes: 30,
        href: '/course',
      });
    } else {
      day.activities.push({
        type: 'mock',
        title: 'Mock exam — national portion',
        subtitle: '80 questions · medium difficulty',
        minutes: 60,
        href: '/practice?portion=national',
      });
      day.activities.push({
        type: 'review',
        title: 'Review math + agency duties',
        subtitle: 'Highest-weight national topics',
        minutes: 25,
        href: '/course',
      });
    }
  });

  // SUPPORT BLOCKS — added to every day in order: flashcards, math (cadence),
  // glossary tail. Math drills start once we've covered Chapter 10 or after
  // ~30% of the timeline, whichever comes first.
  const calcChapterIdx = CURRICULUM.findIndex(c => c.slug === 'real-estate-calculations');
  const calcReachedDayIdx = (() => {
    for (let i = 0; i < days.length; i++) {
      const hasCalc = days[i].activities.some(a => a.chapterNumber === calcChapterIdx + 1);
      if (hasCalc) return i;
    }
    return Math.floor(n * 0.3);
  })();

  days.forEach((day, idx) => {
    // FLASHCARDS — every study day, 15 min on content days, 25 min in review.
    day.activities.push({
      type: 'flashcards',
      title: 'Smart flashcards',
      subtitle: day.isReviewWeek ? 'Comprehensive recall · all chapters' : 'Today\'s chapter + spaced repetition',
      minutes: day.isReviewWeek ? 25 : 15,
      href: '/flashcards',
    });

    // MATH — every 3rd day starting from when Calculations is covered.
    if (idx >= calcReachedDayIdx && (idx - calcReachedDayIdx) % 3 === 0) {
      day.activities.push({
        type: 'math',
        title: 'Math drill set',
        subtitle: 'Prorations, commissions, LTV, area · 10 problems',
        minutes: 15,
        href: '/math',
      });
    }

    // GLOSSARY — 5 min light review on non-review days that don't already
    // have 4+ activities. Keeps key terms fresh without overstuffing.
    if (!day.isReviewWeek && day.activities.length < 4) {
      day.activities.push({
        type: 'glossary',
        title: 'Glossary review',
        subtitle: 'Cycle through new terms from today',
        minutes: 5,
        href: '/glossary',
      });
    }
  });

  // Recompute totalMinutes + apply the day cap. If a day exceeds the cap,
  // trim from the lowest-priority blocks first (glossary → math → flashcards
  // → review/mock → quizzes → chapter). In practice this almost never trips
  // because we sized blocks deliberately.
  const priorityOrder: ActivityType[] = ['glossary', 'math', 'flashcards', 'review', 'mock', 'quiz', 'chapter'];
  days.forEach(day => {
    let total = day.activities.reduce((s, a) => s + a.minutes, 0);
    if (total > dayCap) {
      // Walk in priority order, shrinking until we hit the cap.
      for (const t of priorityOrder) {
        if (total <= dayCap) break;
        for (const a of day.activities) {
          if (a.type !== t) continue;
          const shrinkBy = Math.min(a.minutes - 5, total - dayCap);
          if (shrinkBy > 0) {
            a.minutes -= shrinkBy;
            total -= shrinkBy;
          }
          if (total <= dayCap) break;
        }
      }
    }
    day.totalMinutes = total;
  });

  return days;
}

// Pretty time-block builder — assigns start times so the UI can render
// each activity as a class block ("9:00 AM — Chapter 3"). Caller can pass
// a custom firstStudyHour, default 9am.
export function withClassTimes(
  activities: Activity[],
  firstStudyHour: number = 9,
): Array<Activity & { startTime: string; endTime: string }> {
  let cursor = firstStudyHour * 60; // minutes since midnight
  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hh}:${m.toString().padStart(2, '0')} ${period}`;
  };
  return activities.map(a => {
    const start = cursor;
    const end = cursor + a.minutes;
    cursor = end + 5; // 5-min break between blocks
    return { ...a, startTime: fmt(start), endTime: fmt(end) };
  });
}
