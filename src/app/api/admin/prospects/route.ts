import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';
import { score, type ProspectSignals } from '@/lib/prospect-scoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAY_MS = 86400 * 1000;

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Returns every non-admin user scored as a prospect. Admins (staff) are
// excluded since they're not the audience for this view. Available to full
// admins + the 'instructor' and 'support' roles since both need to see
// who's struggling vs thriving.
export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasRole(session, 'admin') && !hasRole(session, 'instructor') && !hasRole(session, 'support')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const now = new Date();
  const todayStart = startOfDayUTC(now);
  const thirtyDaysAgo = new Date(todayStart.getTime() - 29 * DAY_MS);
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * DAY_MS);

  // Load all students (exclude staff)
  const users = await db.user.findMany({
    where: { isAdmin: false },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, firstName: true, lastName: true,
      phone: true, tier: true, createdAt: true, lastSeenAt: true,
      emailVerifiedAt: true,
    },
  });
  if (users.length === 0) {
    return NextResponse.json({ prospects: [], counts: { hot: 0, engaged: 0, building: 0, 'at-risk': 0, cold: 0, new: 0 } });
  }

  // One query for all relevant events
  const events = await db.timeEvent.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { userId: true, seconds: true, createdAt: true },
  });

  // Aggregate per user
  type Agg = { total: number; last7: number; days: Set<string>; lastEventAt: Date | null };
  const agg = new Map<string, Agg>();
  // Also need ALL-TIME totals (not just 30-day window) for the hours score
  const allTimeTotals = await db.timeEvent.groupBy({
    by: ['userId'],
    _sum: { seconds: true },
  });
  const allTimeById = new Map(allTimeTotals.map(r => [r.userId, r._sum.seconds ?? 0]));

  for (const e of events) {
    let a = agg.get(e.userId);
    if (!a) { a = { total: 0, last7: 0, days: new Set(), lastEventAt: null }; agg.set(e.userId, a); }
    a.total += e.seconds;
    if (e.createdAt >= sevenDaysAgo) a.last7 += e.seconds;
    a.days.add(e.createdAt.toISOString().slice(0, 10));
    if (!a.lastEventAt || e.createdAt > a.lastEventAt) a.lastEventAt = e.createdAt;
  }

  const prospects = users.map(u => {
    const a = agg.get(u.id);
    const allTime = allTimeById.get(u.id) ?? 0;
    const signals: ProspectSignals = {
      totalSeconds: allTime,
      hoursLast7Days: Math.round((a?.last7 ?? 0) / 360) / 10, // 1 decimal
      daysActiveLast30: a?.days.size ?? 0,
      daysSinceLastActive: a?.lastEventAt
        ? Math.floor((now.getTime() - a.lastEventAt.getTime()) / DAY_MS)
        : null,
      daysSinceSignup: Math.max(0, Math.floor((now.getTime() - new Date(u.createdAt).getTime()) / DAY_MS)),
      emailVerified: !!u.emailVerifiedAt,
      hasPhone: !!u.phone,
    };
    const s = score(signals);
    return {
      user: {
        id: u.id, email: u.email, name: u.name,
        firstName: u.firstName, lastName: u.lastName,
        phone: u.phone, tier: u.tier,
        createdAt: u.createdAt, lastSeenAt: u.lastSeenAt,
        emailVerified: !!u.emailVerifiedAt,
      },
      signals,
      ...s,
    };
  });

  // Sort by score descending so hot prospects float to the top
  prospects.sort((a, b) => b.score - a.score);

  const counts: Record<string, number> = { hot: 0, engaged: 0, building: 0, 'at-risk': 0, cold: 0, new: 0 };
  for (const p of prospects) counts[p.tier]++;

  return NextResponse.json({ prospects, counts });
}
