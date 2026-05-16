// ABOUTME: Admin upsert / delete of a per-variant override.
// ABOUTME: PATCH saves edits. DELETE reverts to the original variant from the static pool.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface OverrideBody {
  questionId?: string;
  variantIndex?: number;
  q?: string;
  options?: string[];
  correctIndex?: number;
  explain?: string;
  reason?: string;
}

function canEdit(session: { isAdmin?: boolean; roles?: string[] }): boolean {
  return !!session.isAdmin || hasRole(session, 'instructor') || hasRole(session, 'content');
}

export async function PATCH(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!canEdit(session)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let body: OverrideBody;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  // Validate every field — bad input here corrupts real student-facing data.
  if (typeof body.questionId !== 'string' || body.questionId.length === 0 || body.questionId.length > 80) {
    return NextResponse.json({ error: 'invalid_questionId' }, { status: 400 });
  }
  if (typeof body.variantIndex !== 'number' || body.variantIndex < 0 || body.variantIndex > 49) {
    return NextResponse.json({ error: 'invalid_variantIndex' }, { status: 400 });
  }
  if (typeof body.q !== 'string' || body.q.trim().length < 5 || body.q.length > 1000) {
    return NextResponse.json({ error: 'invalid_q', message: 'Question text must be 5-1000 chars.' }, { status: 400 });
  }
  if (!Array.isArray(body.options) || body.options.length !== 4) {
    return NextResponse.json({ error: 'invalid_options', message: 'Need exactly 4 options.' }, { status: 400 });
  }
  for (const o of body.options) {
    if (typeof o !== 'string' || o.trim().length === 0 || o.length > 400) {
      return NextResponse.json({ error: 'invalid_option', message: 'Each option must be 1-400 chars.' }, { status: 400 });
    }
  }
  if (typeof body.correctIndex !== 'number' || body.correctIndex < 0 || body.correctIndex > 3) {
    return NextResponse.json({ error: 'invalid_correctIndex' }, { status: 400 });
  }
  if (typeof body.explain !== 'string' || body.explain.trim().length < 5 || body.explain.length > 1500) {
    return NextResponse.json({ error: 'invalid_explain', message: 'Explanation must be 5-1500 chars.' }, { status: 400 });
  }
  const reason = typeof body.reason === 'string' ? body.reason.slice(0, 500) : null;

  const data = {
    q: body.q.trim(),
    optionsJson: JSON.stringify(body.options.map(o => o.trim())),
    correctIndex: Math.floor(body.correctIndex),
    explain: body.explain.trim(),
    reason,
    editedById: session.id,
  };

  const saved = await db.questionVariantOverride.upsert({
    where: { questionId_variantIndex: { questionId: body.questionId, variantIndex: body.variantIndex } },
    create: { questionId: body.questionId, variantIndex: body.variantIndex, ...data },
    update: data,
    select: { id: true, updatedAt: true, editedById: true },
  });

  return NextResponse.json({ ok: true, override: saved });
}

// DELETE removes the override row for (questionId, variantIndex) — students
// will see the original static-pool variant again on the next quiz attempt.
export async function DELETE(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!canEdit(session)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let body: { questionId?: string; variantIndex?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  if (typeof body.questionId !== 'string' || typeof body.variantIndex !== 'number') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  await db.questionVariantOverride.deleteMany({
    where: { questionId: body.questionId, variantIndex: body.variantIndex },
  });
  return NextResponse.json({ ok: true });
}
