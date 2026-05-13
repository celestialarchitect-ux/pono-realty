// ABOUTME: Admin can flag a specific question variant for review.
// ABOUTME: Creates a SupportTicket with full variant context so the issue is queued in /admin/support.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface FlagPayload {
  questionId?: string;
  variantIndex?: number;
  questionText?: string;     // the variant's q text — included so the ticket reads cleanly
  category?: string;          // 'wording' | 'wrong-answer' | 'distractor' | 'typo' | 'other'
  notes?: string;             // admin's free-text explanation
}

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin && !hasRole(session, 'instructor') && !hasRole(session, 'content')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: FlagPayload;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  if (typeof body.questionId !== 'string' || body.questionId.length === 0) {
    return NextResponse.json({ error: 'missing_questionId' }, { status: 400 });
  }
  if (typeof body.variantIndex !== 'number' || body.variantIndex < 0 || body.variantIndex > 49) {
    return NextResponse.json({ error: 'invalid_variantIndex' }, { status: 400 });
  }
  const category = typeof body.category === 'string' && body.category.length < 30 ? body.category : 'other';
  const notes = typeof body.notes === 'string' ? body.notes.slice(0, 1000) : '';
  const qText = typeof body.questionText === 'string' ? body.questionText.slice(0, 500) : '(question text unavailable)';

  // Idempotency: an admin re-flagging the same variant with the same
  // category just updates the existing open ticket rather than creating
  // a new one.
  const existing = await db.supportTicket.findFirst({
    where: {
      userId: session.id,
      category: 'variant-review',
      status: { in: ['open', 'in_progress'] },
      page: `/admin/questions#${body.questionId}-v${body.variantIndex}`,
    },
    select: { id: true },
  });

  const description = [
    `[${category.toUpperCase()}] Variant flagged for review`,
    ``,
    `Question ID:    ${body.questionId}`,
    `Variant index:  ${body.variantIndex} ${body.variantIndex === 0 ? '(original)' : '(generated)'}`,
    `Question text:  ${qText}`,
    ``,
    `Admin notes:`,
    notes || '(none)',
  ].join('\n');

  if (existing) {
    await db.supportTicket.update({
      where: { id: existing.id },
      data: { description, updatedAt: new Date() },
    });
    return NextResponse.json({ ok: true, ticketId: existing.id, updated: true });
  }

  const ticket = await db.supportTicket.create({
    data: {
      userId: session.id,
      reporterEmail: session.email,
      reporterName: session.name,
      page: `/admin/questions#${body.questionId}-v${body.variantIndex}`,
      url: `https://ralphfoulger.com/admin/questions`,
      userAgent: req.headers.get('user-agent') ?? null,
      category: 'variant-review',
      description,
      status: 'open',
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, ticketId: ticket.id, created: true });
}
