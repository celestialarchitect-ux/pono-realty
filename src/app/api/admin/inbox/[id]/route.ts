import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET = full body + metadata for a single message (marks as read).
// PATCH = update readAt or other flags.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const msg = await db.message.findUnique({ where: { id } });
  if (!msg) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Mark inbound messages as read on first GET
  if (msg.direction === 'inbound' && !msg.readAt) {
    await db.message.update({ where: { id }, data: { readAt: new Date() } });
  }
  return NextResponse.json({ message: msg });
}
