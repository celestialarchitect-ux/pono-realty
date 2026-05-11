import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Shopify-style ops dashboard for /admin. Returns KPIs, time-series for the
// last 30 days (signups + hours studied), active-now count (last 60s of
// heartbeats), recent signups, recent payments (tier upgrades), and the
// 60-hour eligibility funnel.
export async function GET() {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const now = new Date();
  const todayStart = startOfDayUTC(now);
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 86400 * 1000);
  const thirtyDaysAgo = new Date(todayStart.getTime() - 29 * 86400 * 1000);
  const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);

  // KPI: total users, eligible (60h+) users, paid users, open tickets, unread inbound
  const [totalUsers, paidUsers, eligibleAgg, recentSignups, recentUpgrades, openTickets, unreadInbound] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { tier: { in: ['standard', 'plus', 'solo'] } } }),
    db.timeEvent.groupBy({
      by: ['userId'],
      _sum: { seconds: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, email: true, name: true, tier: true, createdAt: true, emailVerifiedAt: true },
    }),
    db.user.findMany({
      where: { tier: { in: ['standard', 'plus', 'solo'] } },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, email: true, name: true, tier: true, createdAt: true },
    }),
    db.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    db.message.count({ where: { direction: 'inbound', readAt: null } }),
  ]);
  const eligibleCount = eligibleAgg.filter(a => (a._sum.seconds ?? 0) >= 60 * 3600).length;

  // Signups today / 7d / 30d
  const [signupsToday, signups7d, signups30d] = await Promise.all([
    db.user.count({ where: { createdAt: { gte: todayStart } } }),
    db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  // Active right now = users whose lastSeenAt is within 60s
  const activeNow = await db.user.count({
    where: { lastSeenAt: { gte: sixtySecondsAgo } },
  });

  // Hours studied — total (all time) and today
  const [totalStudyAgg, todayStudyAgg] = await Promise.all([
    db.timeEvent.aggregate({ _sum: { seconds: true } }),
    db.timeEvent.aggregate({ where: { createdAt: { gte: todayStart } }, _sum: { seconds: true } }),
  ]);

  // Daily series for the last 30 days — signups + hours studied per day
  const signupRows = await db.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });
  const eventRows = await db.timeEvent.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, seconds: true },
  });

  const dailySignups = new Map<string, number>();
  for (const r of signupRows) {
    const k = r.createdAt.toISOString().slice(0, 10);
    dailySignups.set(k, (dailySignups.get(k) ?? 0) + 1);
  }
  const dailySeconds = new Map<string, number>();
  for (const r of eventRows) {
    const k = r.createdAt.toISOString().slice(0, 10);
    dailySeconds.set(k, (dailySeconds.get(k) ?? 0) + r.seconds);
  }
  const last30: { date: string; signups: number; seconds: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 86400 * 1000);
    const k = d.toISOString().slice(0, 10);
    last30.push({
      date: k,
      signups: dailySignups.get(k) ?? 0,
      seconds: dailySeconds.get(k) ?? 0,
    });
  }

  // Real verified revenue from the Payment table — every row is a Stripe
  // charge that actually completed. Manual tier comps via the admin Edit
  // drawer do NOT inflate this number; only real money does. Returns 0
  // until the Stripe webhook has fired at least once for a paid checkout.
  const revenueAgg = await db.payment.aggregate({
    where: { status: 'succeeded' },
    _sum: { amountCents: true },
    _count: { _all: true },
  });
  const revenueUsd = Math.round((revenueAgg._sum.amountCents ?? 0) / 100);
  const paidCount = revenueAgg._count._all;

  return NextResponse.json({
    kpi: {
      totalUsers,
      paidUsers,
      eligibleCount,
      signupsToday,
      signups7d,
      signups30d,
      activeNow,
      totalStudyHours: Math.round(((totalStudyAgg._sum.seconds ?? 0) / 3600) * 10) / 10,
      todayStudyHours: Math.round(((todayStudyAgg._sum.seconds ?? 0) / 3600) * 10) / 10,
      revenueUsd,
      paymentCount: paidCount,
      openTickets,
      unreadInbound,
    },
    last30,
    recentSignups,
    recentUpgrades,
  });
}
