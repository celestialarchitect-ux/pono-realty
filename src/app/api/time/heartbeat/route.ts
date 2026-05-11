import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured } from '@/lib/auth';
import { pathToBucket, DAILY_HOURS_CAP } from '@/lib/time-tracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SECONDS_PER_HEARTBEAT = 10;
const HEARTBEAT_COOLDOWN_MS = 3_000;
const lastHeartbeat = new Map<string, number>();

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { path?: string; seconds?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const path = (body.path ?? '').slice(0, 200);
  const seconds = Math.min(MAX_SECONDS_PER_HEARTBEAT, Math.max(0, Math.floor(body.seconds ?? 0)));
  if (!path || seconds <= 0) return NextResponse.json({ error: 'bad_payload' }, { status: 400 });

  // Cooldown — drop rapid duplicate heartbeats silently
  const now = Date.now();
  const prev = lastHeartbeat.get(user.id) ?? 0;
  if (now - prev < HEARTBEAT_COOLDOWN_MS) {
    return NextResponse.json({ ok: true, throttled: true });
  }
  lastHeartbeat.set(user.id, now);

  // Daily cap — server-side anti-cheat. Sum today's seconds, refuse if over.
  // The cap is 12 hours/day; honest study almost never exceeds this and bot
  // farming becomes obviously suspicious at higher values.
  try {
    const todayAgg = await db.timeEvent.aggregate({
      where: { userId: user.id, createdAt: { gte: startOfTodayUTC() } },
      _sum: { seconds: true },
    });
    const today = todayAgg._sum.seconds ?? 0;
    if (today >= DAILY_HOURS_CAP * 3600) {
      return NextResponse.json({ ok: false, error: 'daily_cap_reached', cap: DAILY_HOURS_CAP }, { status: 429 });
    }
  } catch {
    // If the cap check fails, fall through and record — fail-open on read
    // errors so a flaky DB doesn't lose study time, but the writeable check
    // below still catches catastrophic failures.
  }

  const bucket = pathToBucket(path);
  try {
    await db.timeEvent.create({
      data: { userId: user.id, path, bucket, seconds },
    });
    // Bump lastSeenAt so the admin "active now" view reflects this ping.
    await db.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });
  } catch {
    return NextResponse.json({ error: 'db_write_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
