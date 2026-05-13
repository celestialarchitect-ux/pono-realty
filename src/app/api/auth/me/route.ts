import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns the current session + everything the client needs to know about
// access state. The "accessStatus" field is the single source of truth the
// UI uses to pick which CTA to show (continue / extend / re-enroll).
//
// accessStatus values:
//   'active'         — user has paid access that has not expired
//   'expired_plus'   — was Plus, window ended → can buy $249.99 extension
//   'expired_standard'— was Standard, window ended → must re-enroll at $599
//   'lifetime'       — Solo (website build, no expiry) or admin
//   'none'           — free user, never paid
export async function GET() {
  if (!authConfigured()) {
    return NextResponse.json({ user: null, authConfigured: false }, { status: 200 });
  }
  const session = await getSessionUser();
  if (!session || !db) return NextResponse.json({ user: null, authConfigured: true });

  const extra = await db.user.findUnique({
    where: { id: session.id },
    select: { emailVerifiedAt: true, tier: true, accessExpiresAt: true, isAdmin: true },
  });

  const tier = extra?.tier ?? session.tier;
  const accessExpiresAt = extra?.accessExpiresAt ?? null;
  const now = new Date();
  const expired = !!accessExpiresAt && accessExpiresAt <= now;

  let accessStatus: 'active' | 'expired_plus' | 'expired_standard' | 'lifetime' | 'none';
  if (extra?.isAdmin) {
    accessStatus = 'lifetime';
  } else if (tier === 'solo') {
    accessStatus = 'lifetime';
  } else if (tier === 'free') {
    accessStatus = 'none';
  } else if (!expired) {
    accessStatus = 'active';
  } else if (tier === 'plus') {
    accessStatus = 'expired_plus';
  } else {
    accessStatus = 'expired_standard';
  }

  // Compute ms remaining (negative if expired) so the client can render the
  // countdown without re-doing the arithmetic.
  const accessMsRemaining = accessExpiresAt
    ? accessExpiresAt.getTime() - now.getTime()
    : null;

  return NextResponse.json({
    user: {
      ...session,
      emailVerified: !!extra?.emailVerifiedAt,
      tier,
      accessExpiresAt: accessExpiresAt ? accessExpiresAt.toISOString() : null,
      accessMsRemaining,
      accessStatus,
    },
    authConfigured: true,
  });
}
