// ABOUTME: Student-facing inbox API. Returns messages where userId = me, newest first.
// ABOUTME: Used by /profile inbox card + the header MessageBell unread badge.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Only show messages the academy SENT to this student (outbound rows
  // tied to their userId). Inbound rows are admin-facing only.
  const messages = await db.message.findMany({
    where: {
      userId: session.id,
      direction: 'outbound',
      // Hide one-time auth flow plumbing — verify/reset emails aren't
      // interesting in an inbox view.
      category: { notIn: ['verify', 'reset'] },
    },
    select: {
      id: true, category: true, subject: true, bodyText: true,
      fromAddr: true, readAt: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const unread = messages.filter(m => !m.readAt).length;

  return NextResponse.json({
    messages: messages.map(m => ({
      id: m.id,
      category: m.category,
      subject: m.subject,
      bodyText: m.bodyText,
      fromAddr: m.fromAddr,
      readAt: m.readAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
    unreadCount: unread,
  });
}
