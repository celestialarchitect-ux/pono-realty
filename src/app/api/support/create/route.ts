import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = new Set(['bug', 'typo', 'confusing', 'feature', 'billing', 'other']);

// Rate limit anonymous reports to prevent spam. Per-IP, 10/hour.
const ATTEMPTS = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function ipKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}
function rateLimited(key: string): boolean {
  const now = Date.now();
  const rec = ATTEMPTS.get(key);
  if (!rec) { ATTEMPTS.set(key, { count: 1, firstAt: now }); return false; }
  if (now - rec.firstAt > WINDOW_MS) { ATTEMPTS.set(key, { count: 1, firstAt: now }); return false; }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.json({ error: 'unavailable', message: 'Support is not yet provisioned. Email support@ralphfoulger.com instead.' }, { status: 503 });
  }

  if (rateLimited(ipKey(req))) {
    return NextResponse.json({ error: 'rate_limited', message: 'Too many reports in a short window. Try again in an hour.' }, { status: 429 });
  }

  let body: { description?: string; category?: string; page?: string; url?: string; userAgent?: string; reporterEmail?: string; reporterName?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const description = (body.description ?? '').trim();
  if (description.length < 10) {
    return NextResponse.json({ error: 'too_short', message: 'Please give us a bit more detail (10+ characters).' }, { status: 400 });
  }
  if (description.length > 4000) {
    return NextResponse.json({ error: 'too_long', message: 'Description is too long (4000 char max).' }, { status: 400 });
  }
  const category = VALID_CATEGORIES.has(body.category ?? '') ? body.category! : 'bug';
  const page = (body.page ?? '/').slice(0, 200);
  const url = (body.url ?? '').slice(0, 500);
  const userAgent = (body.userAgent ?? req.headers.get('user-agent') ?? '').slice(0, 500);

  const session = await getSessionUser();

  // For anonymous reports, capture identity inline (optional).
  let reporterEmail: string | null = null;
  let reporterName: string | null = null;
  if (!session) {
    if (body.reporterEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.reporterEmail)) {
      reporterEmail = body.reporterEmail.trim().toLowerCase();
    }
    if (body.reporterName) {
      reporterName = body.reporterName.trim().slice(0, 100);
    }
  }

  try {
    const ticket = await db.supportTicket.create({
      data: {
        userId: session?.id ?? null,
        reporterEmail,
        reporterName,
        page,
        url,
        userAgent,
        category,
        description,
      },
      select: { id: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, id: ticket.id, createdAt: ticket.createdAt });
  } catch {
    return NextResponse.json({ error: 'db_write_failed' }, { status: 500 });
  }
}
