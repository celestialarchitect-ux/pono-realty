// ABOUTME: Public lookup endpoint for a certificate verification ID.
// ABOUTME: Returns minimal info (name + completion date) so brokers/REC can confirm authenticity.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PASSING_MOCK_PCT = 70;
const STATE_LAW_SECONDS_REQUIRED = 60 * 60 * 60;

function stableHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function verificationCodeFor(userId: string, completedAt: Date): string {
  const seed = `${userId}::${completedAt.toISOString()}`;
  return `RFA-${stableHash(seed).toString(36).toUpperCase().slice(0, 9)}`;
}

export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  const code = (req.nextUrl.searchParams.get('code') ?? '').trim().toUpperCase();
  if (!code || !/^RFA-[A-Z0-9]{4,12}$/.test(code)) {
    return NextResponse.json({ error: 'invalid_code_format' }, { status: 400 });
  }

  // Walk through users + their passing mock attempts and recompute the
  // expected code for each. Match wins. With <1000 students this is fine
  // O(N); for larger scale we'd cache the code on issuance.
  //
  // Only considers attempts that meet the issuance bar — keeps "fake"
  // codes from accidentally validating.
  const candidates = await db.quizAttempt.findMany({
    where: { kind: 'mock', scorePct: { gte: PASSING_MOCK_PCT } },
    select: { userId: true, scorePct: true, completedAt: true },
    orderBy: { completedAt: 'asc' },
  });

  // Cache the EARLIEST passing attempt per user (matches issuance logic).
  const firstPassByUser = new Map<string, Date>();
  for (const a of candidates) {
    if (!firstPassByUser.has(a.userId)) firstPassByUser.set(a.userId, a.completedAt);
  }

  let match: { userId: string; completedAt: Date } | null = null;
  for (const [userId, completedAt] of firstPassByUser.entries()) {
    if (verificationCodeFor(userId, completedAt) === code) {
      match = { userId, completedAt };
      break;
    }
  }

  if (!match) {
    return NextResponse.json({ valid: false, message: 'No certificate found for that ID.' }, { status: 404 });
  }

  // Confirm the 60-hour gate is still met by this student (defense
  // against a record being edited post-issuance).
  const [user, time] = await Promise.all([
    db.user.findUnique({ where: { id: match.userId }, select: { name: true, firstName: true, lastName: true } }),
    db.timeEvent.aggregate({ where: { userId: match.userId }, _sum: { seconds: true } }),
  ]);
  if (!user || (time._sum.seconds ?? 0) < STATE_LAW_SECONDS_REQUIRED) {
    return NextResponse.json({ valid: false, message: 'Certificate is no longer valid.' }, { status: 404 });
  }

  // Public response — DO NOT include email, ID, or anything else sensitive.
  // Just name + completion date. That's enough for a broker to confirm
  // "yes, this person completed our course on this date".
  return NextResponse.json({
    valid: true,
    name: user.name,
    completedAt: match.completedAt.toISOString(),
    code,
    school: 'Ralph Foulger\'s Academy of Real Estate',
    validityYears: 2,
  });
}
