import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Per-user analytics: today seconds, last 30 days breakdown, streak,
// last-active timestamp, recent sessions. Used by /profile.
export async function GET() {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const now = new Date();
  const todayStart = startOfDayUTC(now);
  const thirtyDaysAgo = new Date(todayStart.getTime() - 29 * 86400 * 1000);

  // Pull the last 30 days of events ordered by createdAt
  const events = await db.timeEvent.findMany({
    where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
    orderBy: { createdAt: 'asc' },
    select: { seconds: true, createdAt: true, path: true, bucket: true },
  });

  // Aggregate by UTC day
  const byDay = new Map<string, number>();
  for (const e of events) {
    const k = e.createdAt.toISOString().slice(0, 10);
    byDay.set(k, (byDay.get(k) ?? 0) + e.seconds);
  }
  const last30: { date: string; seconds: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 86400 * 1000);
    const k = d.toISOString().slice(0, 10);
    last30.push({ date: k, seconds: byDay.get(k) ?? 0 });
  }
  const todaySeconds = byDay.get(todayStart.toISOString().slice(0, 10)) ?? 0;

  // Streak: consecutive days ending today with >0 seconds. Today counts even
  // with 0 if the user has any history; otherwise streak is 0.
  let streak = 0;
  for (let i = 0; i < last30.length; i++) {
    const day = last30[last30.length - 1 - i];
    if (day.seconds > 0) streak++;
    else if (i === 0) break; // Today is empty → no streak
    else break;
  }

  // Recent sessions = group consecutive events on same path within 5-min gaps
  const sessionGapMs = 5 * 60 * 1000;
  type SessionRow = { path: string; bucket: string; start: string; end: string; seconds: number };
  const sessions: SessionRow[] = [];
  let cur: SessionRow | null = null;
  for (const e of events) {
    if (cur && e.path === cur.path && e.createdAt.getTime() - new Date(cur.end).getTime() < sessionGapMs) {
      cur.seconds += e.seconds;
      cur.end = e.createdAt.toISOString();
    } else {
      if (cur) sessions.push(cur);
      cur = { path: e.path, bucket: e.bucket, start: e.createdAt.toISOString(), end: e.createdAt.toISOString(), seconds: e.seconds };
    }
  }
  if (cur) sessions.push(cur);
  const recent = sessions.slice(-12).reverse();

  // Aggregate by bucket (full history, not just 30 days)
  const allBuckets = await db.timeEvent.groupBy({
    by: ['bucket'],
    where: { userId: user.id },
    _sum: { seconds: true },
  });
  const byBucket: Record<string, number> = {
    chapters: 0, flashcards: 0, math: 0, glossary: 0,
    quizzes: 0, tutor: 0, practice: 0, other: 0,
  };
  let totalSeconds = 0;
  for (const row of allBuckets) {
    const sec = row._sum.seconds ?? 0;
    byBucket[row.bucket] = (byBucket[row.bucket] ?? 0) + sec;
    totalSeconds += sec;
  }

  // Last active = max createdAt
  const lastActiveAt = events.length > 0 ? events[events.length - 1].createdAt.toISOString() : null;

  // Per-path totals — used by the /profile course-progress panel so every
  // chapter row can show real minutes spent. Returns top 60 paths by seconds.
  const pathAgg = await db.timeEvent.groupBy({
    by: ['path'],
    where: { userId: user.id },
    _sum: { seconds: true },
  });
  const byPath: Record<string, number> = {};
  for (const row of pathAgg) {
    byPath[row.path] = (byPath[row.path] ?? 0) + (row._sum.seconds ?? 0);
  }
  // Most-recent path (regardless of timestamp) — surfaced in the
  // 'Continue where you left off' card.
  const lastPath = events.length > 0 ? events[events.length - 1].path : null;

  // Per-section "last visited" map — every major area of the academy
  // (chapters, flashcards, math, glossary, quizzes, tutor, practice) gets
  // its own resume slot so the profile can surface a Continue card for
  // EACH section, not just the curriculum. The chronologically-last event
  // within each bucket wins; ties are broken by bucket order.
  const lastBySection: Record<string, { path: string; createdAt: string; seconds: number }> = {};
  // events comes ordered oldest→newest from above, so walking forward and
  // overwriting yields the most-recent event per bucket.
  for (const ev of events) {
    lastBySection[ev.bucket] = {
      path: ev.path,
      createdAt: ev.createdAt.toISOString(),
      seconds: byPath[ev.path] ?? 0,
    };
  }

  return NextResponse.json({
    totalSeconds,
    todaySeconds,
    streakDays: streak,
    last30,
    byBucket,
    byPath,
    recentSessions: recent,
    lastActiveAt,
    lastPath,
    lastBySection,
  });
}
