// ABOUTME: Lightweight admin nav badge counts (unread inbox + open tickets).
// ABOUTME: Polled every 30s by AdminNav across every admin page.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Admins and support staff need to see badge counts.
  if (!session.isAdmin && !hasRole(session, 'support')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const [openTickets, unreadInbound] = await Promise.all([
    db.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    db.message.count({ where: { direction: 'inbound', readAt: null } }),
  ]);

  return NextResponse.json({ openTickets, unreadInbound });
}
