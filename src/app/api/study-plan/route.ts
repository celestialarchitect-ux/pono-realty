// ABOUTME: Study plan API — GET current plan + computed schedule, POST to set/update goal.
// ABOUTME: Schedule is computed dynamically from (60 - studied)/daysUntilGoal so it always reflects reality.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATE_LAW_HOURS_REQUIRED = 60;
const STATE_LAW_SECONDS_REQUIRED = STATE_LAW_HOURS_REQUIRED * 60 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;

// Format date as YYYY-MM-DD in UTC (matches TimeEvent createdAt grouping)
function fmtDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Generate the per-day schedule from the plan + current study state.
// Returns an array of { date, plannedMinutes, actualMinutes, status } for
// every day from today until goalDate (inclusive). status is:
//   'past_done'      — past date with enough actual minutes logged
//   'past_short'     — past date that didn't hit its planned minutes
//   'today'          — today (treated as in-progress)
//   'future'         — future date
//   'rest'           — explicitly 0 minutes scheduled (weekend skip or override)
function buildSchedule(
  goalDate: Date,
  includeWeekends: boolean,
  overrides: Record<string, number>,
  studiedSecondsTotal: number,
  studiedSecondsByDay: Record<string, number>,
): Array<{
  date: string;
  plannedMinutes: number;
  actualMinutes: number;
  status: 'past_done' | 'past_short' | 'today' | 'future' | 'rest';
}> {
  const now = new Date();
  const todayStr = fmtDay(now);
  const goalStr = fmtDay(goalDate);

  // Build day list from today (or from earliest TimeEvent if user already
  // started before setting a plan) through goalDate.
  const startMs = Math.min(now.getTime(), goalDate.getTime());
  const endMs = Math.max(now.getTime(), goalDate.getTime());
  const days: string[] = [];
  for (let t = startMs; t <= endMs + DAY_MS / 2; t += DAY_MS) {
    days.push(fmtDay(new Date(t)));
  }

  // Total remaining minutes to schedule across remaining study days.
  const remainingSeconds = Math.max(0, STATE_LAW_SECONDS_REQUIRED - studiedSecondsTotal);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  // Eligible scheduling days = today + future, minus weekends if excluded,
  // minus any with an override of 0.
  const scheduleableDays = days.filter(d => {
    if (d < todayStr) return false;
    if (overrides[d] === 0) return false;
    if (!includeWeekends) {
      const dow = new Date(d + 'T12:00:00Z').getUTCDay();
      if (dow === 0 || dow === 6) return false;
    }
    return true;
  });

  // Sum of override minutes for scheduleable days
  const overrideMinutesTotal = scheduleableDays
    .filter(d => typeof overrides[d] === 'number' && overrides[d] > 0)
    .reduce((s, d) => s + overrides[d], 0);

  const nonOverrideDayCount = scheduleableDays
    .filter(d => !(typeof overrides[d] === 'number' && overrides[d] > 0))
    .length;

  // Distribute the rest evenly across non-override days.
  const evenMinutes = nonOverrideDayCount > 0
    ? Math.ceil(Math.max(0, remainingMinutes - overrideMinutesTotal) / nonOverrideDayCount)
    : 0;

  return days.map(d => {
    const actualSeconds = studiedSecondsByDay[d] ?? 0;
    const actualMinutes = Math.floor(actualSeconds / 60);

    let plannedMinutes = 0;
    let status: 'past_done' | 'past_short' | 'today' | 'future' | 'rest' = 'future';

    if (d < todayStr) {
      // Past day: planned was whatever the schedule said back then, but
      // we don't store snapshots — show actual vs the simple "was a rest
      // day?" check.
      const dow = new Date(d + 'T12:00:00Z').getUTCDay();
      const wasRest = !includeWeekends && (dow === 0 || dow === 6);
      plannedMinutes = 0; // we don't reconstruct past targets
      status = wasRest ? 'rest' : (actualSeconds > 0 ? 'past_done' : 'past_short');
    } else if (d === todayStr) {
      const dow = new Date(d + 'T12:00:00Z').getUTCDay();
      const isWeekend = dow === 0 || dow === 6;
      if (!includeWeekends && isWeekend) {
        plannedMinutes = 0;
        status = 'rest';
      } else if (typeof overrides[d] === 'number') {
        plannedMinutes = overrides[d];
        status = overrides[d] === 0 ? 'rest' : 'today';
      } else {
        plannedMinutes = evenMinutes;
        status = 'today';
      }
    } else {
      const dow = new Date(d + 'T12:00:00Z').getUTCDay();
      const isWeekend = dow === 0 || dow === 6;
      if (!includeWeekends && isWeekend) {
        plannedMinutes = 0;
        status = 'rest';
      } else if (typeof overrides[d] === 'number') {
        plannedMinutes = overrides[d];
        status = overrides[d] === 0 ? 'rest' : 'future';
      } else {
        plannedMinutes = evenMinutes;
        status = 'future';
      }
    }

    return { date: d, plannedMinutes, actualMinutes, status };
  });
}

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const plan = await db.studyPlan.findUnique({ where: { userId: session.id } });

  // Aggregate study time by day (UTC) and total
  const events = await db.timeEvent.findMany({
    where: { userId: session.id },
    select: { seconds: true, createdAt: true },
  });
  const totalSeconds = events.reduce((s, e) => s + e.seconds, 0);
  const byDay: Record<string, number> = {};
  for (const e of events) {
    const key = fmtDay(e.createdAt);
    byDay[key] = (byDay[key] ?? 0) + e.seconds;
  }

  const hoursRemaining = Math.max(0, STATE_LAW_HOURS_REQUIRED - totalSeconds / 3600);

  if (!plan) {
    // No plan yet — return enough state for the UI to render the "set a goal date" form.
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

  const schedule = buildSchedule(plan.goalDate, plan.includeWeekends, overrides, totalSeconds, byDay);

  // On-pace = (hoursStudied / hoursThroughToday) where hoursThroughToday is
  // what the plan said you should have done by now.
  const today = fmtDay(new Date());
  const cumulativePlannedThroughToday = schedule
    .filter(s => s.date <= today)
    .reduce((sum, s) => sum + s.plannedMinutes, 0);
  // Add the hours the user had ALREADY studied before today — that count
  // toward the cumulative actual.
  const studiedMinutesTotal = Math.floor(totalSeconds / 60);
  const studiedThroughToday = studiedMinutesTotal;
  const onPaceRatio = cumulativePlannedThroughToday > 0
    ? studiedThroughToday / cumulativePlannedThroughToday
    : 1;

  return NextResponse.json({
    plan: {
      id: plan.id,
      goalDate: plan.goalDate.toISOString(),
      includeWeekends: plan.includeWeekends,
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
//   POST { goalDate: 'YYYY-MM-DD' | null, includeWeekends?: bool, overrides?: Record<string, number> }
//   - goalDate null → delete plan
//   - goalDate string → upsert
export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { goalDate?: string | null; includeWeekends?: boolean; overrides?: Record<string, number> };
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

  // Parse as end-of-day UTC so a goalDate of "2026-05-26" means
  // "must be done by midnight on 2026-05-27 UTC" — i.e., the whole 26th
  // is a valid study day.
  const goalDate = new Date(body.goalDate + 'T23:59:59Z');
  if (Number.isNaN(goalDate.getTime())) {
    return NextResponse.json({ error: 'invalid_goal_date' }, { status: 400 });
  }
  const now = new Date();
  if (goalDate.getTime() < now.getTime() - DAY_MS) {
    // Allow today as a valid goal, but reject genuinely-past dates.
    return NextResponse.json({ error: 'goal_date_in_past' }, { status: 400 });
  }

  // Reject goals beyond a reasonable horizon — protects against typos
  // like 2126 or 2207 that would push the schedule to ~0 min/day forever.
  if (goalDate.getTime() > now.getTime() + 365 * DAY_MS) {
    return NextResponse.json({ error: 'goal_date_too_far' }, { status: 400 });
  }

  const includeWeekends = typeof body.includeWeekends === 'boolean' ? body.includeWeekends : true;
  const overrides = body.overrides && typeof body.overrides === 'object' ? body.overrides : {};
  const overridesJson = JSON.stringify(overrides);

  const plan = await db.studyPlan.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      goalDate,
      includeWeekends,
      overridesJson,
    },
    update: { goalDate, includeWeekends, overridesJson },
  });

  return NextResponse.json({
    ok: true,
    plan: {
      id: plan.id,
      goalDate: plan.goalDate.toISOString(),
      includeWeekends: plan.includeWeekends,
      overrides,
    },
  });
}
