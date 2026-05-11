import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns new admin-relevant events since the given timestamp. Polled by
// the AdminEventBell component on each admin page (5-10s interval) so we
// can fire sound + toast when a signup or payment lands.
//
// Events surfaced:
//   - signup: User.createdAt > since
//   - payment: Payment.createdAt > since
//
// Bounded results (max 30 of each) to keep responses small. The bell
// always advances its cursor to the most-recent timestamp it saw so the
// next poll only fetches truly-new items.
export async function GET(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasRole(session, 'admin') && !hasRole(session, 'support') && !hasRole(session, 'instructor') && !hasRole(session, 'finance')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const sinceParam = new URL(req.url).searchParams.get('since');
  // If the client doesn't send a cursor (first load), look at last 60 seconds
  // so we don't blast through historic data on every reload.
  const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 60_000);
  const safeSince = isNaN(since.getTime()) ? new Date(Date.now() - 60_000) : since;

  const [signups, payments] = await Promise.all([
    db.user.findMany({
      where: { createdAt: { gt: safeSince }, isAdmin: false },
      orderBy: { createdAt: 'asc' },
      take: 30,
      select: { id: true, name: true, email: true, firstName: true, tier: true, createdAt: true },
    }),
    db.payment.findMany({
      where: { createdAt: { gt: safeSince } },
      orderBy: { createdAt: 'asc' },
      take: 30,
      select: { id: true, userId: true, amountCents: true, currency: true, tier: true, createdAt: true },
    }),
  ]);

  // Hydrate payment.userId → name/email for the toast
  const paymentUserIds = Array.from(new Set(payments.map(p => p.userId)));
  const paymentUsers = paymentUserIds.length === 0 ? [] : await db.user.findMany({
    where: { id: { in: paymentUserIds } },
    select: { id: true, name: true, email: true, firstName: true },
  });
  const userById = new Map(paymentUsers.map(u => [u.id, u]));

  const events = [
    ...signups.map(s => ({
      type: 'signup' as const,
      id: `signup:${s.id}`,
      at: s.createdAt.toISOString(),
      user: { id: s.id, name: s.name, email: s.email, firstName: s.firstName, tier: s.tier },
    })),
    ...payments.map(p => {
      const u = userById.get(p.userId);
      return {
        type: 'payment' as const,
        id: `payment:${p.id}`,
        at: p.createdAt.toISOString(),
        user: u ? { id: u.id, name: u.name, email: u.email, firstName: u.firstName } : { id: p.userId },
        amountCents: p.amountCents,
        currency: p.currency,
        tier: p.tier,
      };
    }),
  ].sort((a, b) => a.at.localeCompare(b.at));

  // Cursor = most recent event time the client should send back next poll
  const cursor = events.length > 0 ? events[events.length - 1].at : safeSince.toISOString();

  return NextResponse.json({ events, cursor, now: new Date().toISOString() });
}
