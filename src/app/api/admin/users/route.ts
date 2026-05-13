import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured, hasRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Admin-only user list with aggregated study hours per user.
// Gated by session user's isAdmin flag (set by ADMIN_EMAILS env var at signup).
export async function GET() {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasRole(session, 'admin')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  // Load all users (limit cap for safety as the academy grows)
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      email: true,
      name: true,
      tier: true,
      isAdmin: true,
      roles: true,
      createdAt: true,
      lastSeenAt: true,
      passedExamAt: true,
      accessExpiresAt: true,
    },
  });

  // Aggregate seconds per user in a single grouped query
  const aggs = await db.timeEvent.groupBy({
    by: ['userId'],
    _sum: { seconds: true },
  });
  const secondsByUser = new Map<string, number>();
  for (const a of aggs) secondsByUser.set(a.userId, a._sum.seconds ?? 0);

  const rows = users.map(u => ({
    ...u,
    totalSeconds: secondsByUser.get(u.id) ?? 0,
  }));

  return NextResponse.json({ users: rows });
}
