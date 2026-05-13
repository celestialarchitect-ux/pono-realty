// ABOUTME: Study plan API — GET current plan + computed class-schedule, POST to set/update goal.
// ABOUTME: Each day's schedule is a rich activities[] array — chapter reading, quizzes, flashcards, mocks, math.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { buildDailyLessonPlan, type DailyPlan } from '@/lib/lesson-plan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATE_LAW_HOURS_REQUIRED = 60;
const STATE_LAW_SECONDS_REQUIRED = STATE_LAW_HOURS_REQUIRED * 60 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;

function fmtDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Day status — derived from past/present and whether the student hit their
// planned minutes. The UI uses this to color-code calendar cells.
type DayStatus = 'past_done' | 'past_short' | 'today' | 'future' | 'rest';

interface ScheduleDay extends DailyPlan {
  actualMinutes: number;
  status: DayStatus;
}

// Build the full schedule. The lesson plan + per-day activity list comes
// from buildDailyLessonPlan; we just attach the status field and actual
// minutes pulled from TimeEvent aggregation.
function buildSchedule(
  goalDate: Date,
  includeWeekends: boolean,
  overrides: Record<string, number>,
  studiedSecondsTotal: number,
  studiedSecondsByDay: Record<string, number>,
  studiedSecondsByPath: Record<string, number>,
): ScheduleDay[] {
  const now = new Date();
  const todayStr = fmtDay(now);

  // Full day list (today → goal, inclusive)
  const days: string[] = [];
  const startMs = now.getTime();
  const endMs = goalDate.getTime();
  for (let t = startMs; t <= endMs + DAY_MS / 2; t += DAY_MS) {
    days.push(fmtDay(new Date(t)));
  }

  // Which days are scheduleable (today+future, not weekend if excluded,
  // not explicitly zeroed)
  const scheduleable = days.filter(d => {
    if (overrides[d] === 0) return false;
    if (!includeWeekends) {
      const dow = new Date(d + 'T12:00:00Z').getUTCDay();
      if (dow === 0 || dow === 6) return false;
    }
    return true;
  });

  // Target minutes per study day = remaining seconds / count
  const remainingSeconds = Math.max(0, STATE_LAW_SECONDS_REQUIRED - studiedSecondsTotal);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  const perDayMinutes = scheduleable.length > 0
    ? Math.ceil(remainingMinutes / scheduleable.length)
    : 0;

  // Convert seconds-by-path to minutes-by-path for the lesson generator
  const byPathMinutes: Record<string, number> = {};
  for (const [path, sec] of Object.entries(studiedSecondsByPath)) {
    byPathMinutes[path] = Math.floor(sec / 60);
  }

  // Build the rich lesson plan only for scheduleable days. Rest days get
  // an empty activities array.
  const lessonPlans = buildDailyLessonPlan(scheduleable, perDayMinutes, byPathMinutes);
  const lessonByDate = new Map(lessonPlans.map(lp => [lp.date, lp]));

  return days.map<ScheduleDay>(d => {
    const actualSeconds = studiedSecondsByDay[d] ?? 0;
    const actualMinutes = Math.floor(actualSeconds / 60);
    const lesson = lessonByDate.get(d);

    let status: DayStatus;
    const dow = new Date(d + 'T12:00:00Z').getUTCDay();
    const isWeekend = dow === 0 || dow === 6;
    const isRestDay = (!includeWeekends && isWeekend) || overrides[d] === 0;

    if (isRestDay) {
      status = 'rest';
    } else if (d < todayStr) {
      status = actualMinutes > 0 ? 'past_done' : 'past_short';
    } else if (d === todayStr) {
      status = 'today';
    } else {
      status = 'future';
    }

    return {
      date: d,
      totalMinutes: lesson?.totalMinutes ?? 0,
      activities: lesson?.activities ?? [],
      startsChapter: lesson?.startsChapter ?? null,
      isReviewWeek: lesson?.isReviewWeek ?? false,
      actualMinutes,
      status,
    };
  });
}

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const plan = await db.studyPlan.findUnique({ where: { userId: session.id } });

  // Aggregate study time: by day + by path (for chapter completion tracking)
  const events = await db.timeEvent.findMany({
    where: { userId: session.id },
    select: { seconds: true, createdAt: true, path: true },
  });
  const totalSeconds = events.reduce((s, e) => s + e.seconds, 0);
  const byDay: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  for (const e of events) {
    const dayKey = fmtDay(e.createdAt);
    byDay[dayKey] = (byDay[dayKey] ?? 0) + e.seconds;
    byPath[e.path] = (byPath[e.path] ?? 0) + e.seconds;
  }

  const hoursRemaining = Math.max(0, STATE_LAW_HOURS_REQUIRED - totalSeconds / 3600);

  if (!plan) {
    return NextResponse.json({
      plan: null,
      hoursStudied: +(totalSeconds / 3600).toFixed(2),
      hoursRemaining: +hoursRemaining.toFixed(2),
      hoursRequired: STATE_LAW_HOURS_REQUIRED,
      schedule: [],
    });
  }

  let overrides: Record<string, number> = {};
  try {
    const parsed = JSON.parse(plan.overridesJson);
    if (parsed && typeof parsed === 'object') overrides = parsed;
  } catch { /* leave empty */ }

  const schedule = buildSchedule(
    plan.goalDate,
    plan.includeWeekends,
    overrides,
    totalSeconds,
    byDay,
    byPath,
  );

  // On-pace: cumulative planned minutes (today and earlier) vs actual studied.
  const today = fmtDay(new Date());
  const cumulativePlannedThroughToday = schedule
    .filter(s => s.date <= today && s.status !== 'rest')
    .reduce((sum, s) => sum + s.totalMinutes, 0);
  const studiedMinutesTotal = Math.floor(totalSeconds / 60);
  const onPaceRatio = cumulativePlannedThroughToday > 0
    ? studiedMinutesTotal / cumulativePlannedThroughToday
    : 1;

  return NextResponse.json({
    plan: {
      id: plan.id,
      goalDate: plan.goalDate.toISOString(),
      includeWeekends: plan.includeWeekends,
      startHour: plan.startHour,
      overrides,
    },
    hoursStudied: +(totalSeconds / 3600).toFixed(2),
    hoursRemaining: +hoursRemaining.toFixed(2),
    hoursRequired: STATE_LAW_HOURS_REQUIRED,
    onPaceRatio: +onPaceRatio.toFixed(2),
    schedule,
  });
}

// Set / update / clear the plan.
export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { goalDate?: string | null; includeWeekends?: boolean; startHour?: number; overrides?: Record<string, number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  if (body.goalDate === null) {
    await db.studyPlan.deleteMany({ where: { userId: session.id } });
    return NextResponse.json({ ok: true, deleted: true });
  }

  if (typeof body.goalDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.goalDate)) {
    return NextResponse.json({ error: 'invalid_goal_date' }, { status: 400 });
  }

  const goalDate = new Date(body.goalDate + 'T23:59:59Z');
  if (Number.isNaN(goalDate.getTime())) {
    return NextResponse.json({ error: 'invalid_goal_date' }, { status: 400 });
  }
  const now = new Date();
  if (goalDate.getTime() < now.getTime() - DAY_MS) {
    return NextResponse.json({ error: 'goal_date_in_past' }, { status: 400 });
  }
  if (goalDate.getTime() > now.getTime() + 365 * DAY_MS) {
    return NextResponse.json({ error: 'goal_date_too_far' }, { status: 400 });
  }

  const includeWeekends = typeof body.includeWeekends === 'boolean' ? body.includeWeekends : true;
  // Clamp to 0..23 in case of bad input; default 9 (9am).
  const startHour = typeof body.startHour === 'number' && Number.isFinite(body.startHour)
    ? Math.max(0, Math.min(23, Math.floor(body.startHour)))
    : 9;
  const overrides = body.overrides && typeof body.overrides === 'object' ? body.overrides : {};
  const overridesJson = JSON.stringify(overrides);

  const plan = await db.studyPlan.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      goalDate,
      includeWeekends,
      startHour,
      overridesJson,
    },
    update: { goalDate, includeWeekends, startHour, overridesJson },
  });

  return NextResponse.json({
    ok: true,
    plan: {
      id: plan.id,
      goalDate: plan.goalDate.toISOString(),
      includeWeekends: plan.includeWeekends,
      startHour: plan.startHour,
      overrides,
    },
  });
}
