import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUSES = new Set(['open', 'in_progress', 'resolved', 'dismissed']);

// PATCH = update status / admin notes on a ticket.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  let body: { status?: string; adminNotes?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const data: { status?: string; adminNotes?: string; resolvedAt?: Date | null; resolvedBy?: string | null } = {};
  if (body.status !== undefined) {
    if (!VALID_STATUSES.has(body.status)) return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    data.status = body.status;
    if (body.status === 'resolved' || body.status === 'dismissed') {
      data.resolvedAt = new Date();
      data.resolvedBy = session.id;
    } else {
      data.resolvedAt = null;
      data.resolvedBy = null;
    }
  }
  if (body.adminNotes !== undefined) {
    data.adminNotes = body.adminNotes.slice(0, 4000);
  }

  try {
    const updated = await db.supportTicket.update({
      where: { id },
      data,
      select: { id: true, status: true, adminNotes: true, resolvedAt: true, resolvedBy: true, updatedAt: true },
    });
    return NextResponse.json({ ticket: updated });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
