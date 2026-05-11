import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_ROLES = new Set(['admin', 'support', 'instructor', 'finance', 'content']);
const VALID_TIERS = new Set(['free', 'standard', 'plus', 'solo']);

// PATCH = admin updates a user. Only full admins (isAdmin=true) can touch
// roles + isAdmin so granular role-holders can't escalate themselves.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasRole(session, 'admin')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  let body: { isAdmin?: boolean; roles?: string[]; tier?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  // Refuse to demote yourself from admin so you can't accidentally lock out
  // the only admin account.
  if (id === session.id && body.isAdmin === false) {
    return NextResponse.json({ error: 'cannot_demote_self', message: "You can't remove your own admin flag." }, { status: 400 });
  }

  const data: { isAdmin?: boolean; roles?: string[]; tier?: string } = {};
  if (typeof body.isAdmin === 'boolean') data.isAdmin = body.isAdmin;
  if (Array.isArray(body.roles)) {
    const clean = body.roles.filter(r => typeof r === 'string' && VALID_ROLES.has(r));
    data.roles = Array.from(new Set(clean));
  }
  if (typeof body.tier === 'string' && VALID_TIERS.has(body.tier)) {
    data.tier = body.tier;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  try {
    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, isAdmin: true, roles: true, tier: true },
    });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
