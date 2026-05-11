import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET = list messages for the admin inbox. Optional filters:
//   ?direction=inbound|outbound
//   ?category=verify|reset|welcome|support-reply|broadcast|inbound|other
export async function GET(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const sp = new URL(req.url).searchParams;
  const direction = sp.get('direction') ?? undefined;
  const category = sp.get('category') ?? undefined;

  const where: { direction?: string; category?: string } = {};
  if (direction === 'inbound' || direction === 'outbound') where.direction = direction;
  if (category) where.category = category;

  const messages = await db.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true, direction: true, category: true,
      fromAddr: true, toAddr: true,
      subject: true, bodyText: true,
      status: true, providerId: true, errorMsg: true,
      readAt: true, createdAt: true,
      userId: true, ticketId: true,
    },
  });

  // Aggregate counts per category + direction for the sidebar
  const byCategory = await db.message.groupBy({
    by: ['category', 'direction'],
    _count: { _all: true },
  });
  const unreadInbound = await db.message.count({ where: { direction: 'inbound', readAt: null } });
  const counts = {
    inbox: byCategory.filter(g => g.direction === 'inbound').reduce((s, g) => s + g._count._all, 0),
    sent: byCategory.filter(g => g.direction === 'outbound').reduce((s, g) => s + g._count._all, 0),
    unreadInbound,
    byCategory: byCategory.reduce<Record<string, number>>((acc, g) => {
      acc[`${g.direction}:${g.category}`] = g._count._all;
      return acc;
    }, {}),
  };

  return NextResponse.json({ messages, counts });
}
