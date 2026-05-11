import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Returns the signed-in user's time aggregates: total, by-bucket, and recent events.
// Used by /profile and /practice (gate check).
export async function GET() {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Aggregate via grouped query
  const byBucketRows = await db.timeEvent.groupBy({
    by: ['bucket'],
    where: { userId: user.id },
    _sum: { seconds: true },
  });
  const byBucket: Record<string, number> = {
    chapters: 0, flashcards: 0, math: 0, glossary: 0,
    quizzes: 0, tutor: 0, practice: 0, other: 0,
  };
  let totalSeconds = 0;
  for (const row of byBucketRows) {
    const sec = row._sum.seconds ?? 0;
    byBucket[row.bucket] = (byBucket[row.bucket] ?? 0) + sec;
    totalSeconds += sec;
  }

  return NextResponse.json({
    totalSeconds,
    byBucket,
    user: { id: user.id, email: user.email, name: user.name, tier: user.tier, isAdmin: user.isAdmin },
  });
}
