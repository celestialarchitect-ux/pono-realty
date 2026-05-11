import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, authConfigured } from '@/lib/auth';
import { pathToBucket } from '@/lib/time-tracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Migrates a visitor's pre-signup localStorage time into their server record
// so first-session study time isn't lost the moment they create an account.
//
// Anti-cheat: hard-cap the total migrated time at MAX_MIGRATE_SECONDS so a
// malicious user can't pre-load 60 hours into localStorage to skip the
// state-law gate. Anything above the cap is dropped. Per-path values are
// also capped individually.
const MAX_MIGRATE_SECONDS = 4 * 3600;       // 4 hours total — generous first-session budget
const MAX_PER_PATH_SECONDS = 2 * 3600;      // 2 hours per page max

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { byPath?: Record<string, number> };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const byPath = body.byPath ?? {};

  // Refuse if this user already has time events — migration is a one-shot,
  // first-session thing. Subsequent POSTs are silently no-ops.
  const existing = await db.timeEvent.count({ where: { userId: user.id } });
  if (existing > 0) {
    return NextResponse.json({ ok: true, migrated: 0, reason: 'already_has_history' });
  }

  // Normalize, cap per-path, and accumulate against the global cap.
  const entries: { path: string; bucket: string; seconds: number }[] = [];
  let running = 0;
  for (const [rawPath, rawSeconds] of Object.entries(byPath)) {
    const path = String(rawPath).slice(0, 200);
    if (!path.startsWith('/')) continue;
    const seconds = Math.max(0, Math.min(MAX_PER_PATH_SECONDS, Math.floor(Number(rawSeconds) || 0)));
    if (seconds === 0) continue;
    if (running + seconds > MAX_MIGRATE_SECONDS) {
      // Allow the remainder up to the cap, then stop accepting more
      const remaining = MAX_MIGRATE_SECONDS - running;
      if (remaining <= 0) break;
      entries.push({ path, bucket: pathToBucket(path), seconds: remaining });
      running = MAX_MIGRATE_SECONDS;
      break;
    }
    entries.push({ path, bucket: pathToBucket(path), seconds });
    running += seconds;
  }

  if (entries.length === 0) {
    return NextResponse.json({ ok: true, migrated: 0 });
  }

  try {
    await db.timeEvent.createMany({
      data: entries.map(e => ({ userId: user.id, path: e.path, bucket: e.bucket, seconds: e.seconds })),
    });
  } catch {
    return NextResponse.json({ error: 'db_write_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, migrated: running, capped: running >= MAX_MIGRATE_SECONDS });
}
