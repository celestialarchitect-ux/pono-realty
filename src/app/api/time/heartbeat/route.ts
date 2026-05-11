import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured } from '@/lib/auth';
import { pathToBucket } from '@/lib/time-tracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Server caps heartbeat granularity to prevent client abuse.
const MAX_SECONDS_PER_HEARTBEAT = 10;
// One heartbeat per user every 3s minimum.
const HEARTBEAT_COOLDOWN_MS = 3_000;
const lastHeartbeat = new Map<string, number>();

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

  const bucket = pathToBucket(path);
  try {
    await db.timeEvent.create({
      data: { userId: user.id, path, bucket, seconds },
    });
  } catch {
    return NextResponse.json({ error: 'db_write_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
