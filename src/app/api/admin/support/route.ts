import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET = list tickets (admin only). Optional ?status filter.
export async function GET(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? undefined;
  const category = url.searchParams.get('category') ?? undefined;
  const where: { status?: string; category?: string } = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const tickets = await db.supportTicket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  // Hydrate signed-in reporter names/emails since we don't have a Prisma
  // relation for it (the FK is optional and we want fast inclusion either way).
  const userIds = Array.from(new Set(tickets.map(t => t.userId).filter((x): x is string => !!x)));
  const users = userIds.length === 0 ? [] : await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, name: true, firstName: true, lastName: true, tier: true },
  });
  const userById = new Map(users.map(u => [u.id, u]));

  const rows = tickets.map(t => ({
    id: t.id,
    page: t.page,
    url: t.url,
    category: t.category,
    description: t.description,
    status: t.status,
    adminNotes: t.adminNotes,
    resolvedAt: t.resolvedAt,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    userAgent: t.userAgent,
    reporter: t.userId
      ? { kind: 'user' as const, ...(userById.get(t.userId) ?? null) }
      : { kind: 'anonymous' as const, email: t.reporterEmail, name: t.reporterName },
  }));

  // Counts by status for the header
  const counts = await db.supportTicket.groupBy({ by: ['status'], _count: { _all: true } });
  const counter: Record<string, number> = { open: 0, in_progress: 0, resolved: 0, dismissed: 0 };
  for (const c of counts) counter[c.status] = (counter[c.status] ?? 0) + c._count._all;

  // Counts by category (across ALL statuses) so the category filter chips
  // can show how many tickets exist in each bucket.
  const catCounts = await db.supportTicket.groupBy({ by: ['category'], _count: { _all: true } });
  const categoryCounts: Record<string, number> = {};
  for (const c of catCounts) categoryCounts[c.category] = c._count._all;

  return NextResponse.json({ tickets: rows, counts: counter, categoryCounts });
}
