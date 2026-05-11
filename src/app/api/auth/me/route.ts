import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authConfigured()) {
    return NextResponse.json({ user: null, authConfigured: false }, { status: 200 });
  }
  const session = await getSessionUser();
  if (!session || !db) return NextResponse.json({ user: null, authConfigured: true });
  // Enrich with verification + payment status for the client.
  const extra = await db.user.findUnique({
    where: { id: session.id },
    select: { emailVerifiedAt: true, tier: true },
  });
  return NextResponse.json({
    user: {
      ...session,
      emailVerified: !!extra?.emailVerifiedAt,
      tier: extra?.tier ?? session.tier,
    },
    authConfigured: true,
  });
}
