// ABOUTME: Marks a single student message as read (POST). Idempotent.
// ABOUTME: Used by the inbox UI when the student opens a message.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  // Only the message recipient can mark it read — prevents cross-account
  // read receipts. updateMany with the userId filter is one atomic round trip.
  await db.message.updateMany({
    where: { id, userId: session.id, readAt: null },
    data: { readAt: new Date(), status: 'read' },
  });
  return NextResponse.json({ ok: true });
}
