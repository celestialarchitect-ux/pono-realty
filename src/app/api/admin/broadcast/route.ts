// ABOUTME: Admin email broadcast. Sends a subject + body to a filtered student audience via Resend.
// ABOUTME: Every send is logged to Message so the admin inbox shows the full outbound history.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';
import { sendMail, emailConfigured } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface BroadcastBody {
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  // Who to send to:
  //   all       — every user with a confirmed email
  //   paid      — tier in (standard, plus, solo)
  //   course    — tier in (standard, plus)   [excludes solo, which is a website-only product]
  //   free      — tier = free
  //   tier:X    — exact tier match
  audience?: string;
  // If true, count + preview only — no sends. Defaults to false.
  dryRun?: boolean;
}

const VALID_AUDIENCES = new Set(['all', 'paid', 'course', 'free']);
const VALID_TIERS = new Set(['free', 'standard', 'plus', 'solo']);

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  // Full admins or support staff can broadcast (support handles announcements too).
  if (!session.isAdmin && !hasRole(session, 'support')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: BroadcastBody;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const subject = (body.subject ?? '').trim();
  const text = (body.bodyText ?? '').trim();
  if (subject.length < 3 || subject.length > 200) {
    return NextResponse.json({ error: 'invalid_subject', message: 'Subject must be 3-200 chars.' }, { status: 400 });
  }
  if (text.length < 10 || text.length > 20000) {
    return NextResponse.json({ error: 'invalid_body', message: 'Body must be 10-20000 chars.' }, { status: 400 });
  }
  const audience = (body.audience ?? 'all').trim();
  let tierFilter: { in?: string[] } | undefined;
  if (audience.startsWith('tier:')) {
    const t = audience.slice(5);
    if (!VALID_TIERS.has(t)) return NextResponse.json({ error: 'invalid_audience' }, { status: 400 });
    tierFilter = { in: [t] };
  } else if (VALID_AUDIENCES.has(audience)) {
    if (audience === 'paid') tierFilter = { in: ['standard', 'plus', 'solo'] };
    else if (audience === 'course') tierFilter = { in: ['standard', 'plus'] };
    else if (audience === 'free') tierFilter = { in: ['free'] };
    else if (audience === 'all') tierFilter = undefined;
  } else {
    return NextResponse.json({ error: 'invalid_audience' }, { status: 400 });
  }

  // Pull the recipient list. We only send to users with verified emails so
  // we don't ship a broadcast to a typo address that bounces and trashes
  // our sender reputation.
  const recipients = await db.user.findMany({
    where: {
      emailVerifiedAt: { not: null },
      ...(tierFilter ? { tier: tierFilter } : {}),
    },
    select: { id: true, email: true, firstName: true, name: true, tier: true },
    orderBy: { createdAt: 'asc' },
  });

  if (body.dryRun) {
    return NextResponse.json({
      dryRun: true,
      recipientCount: recipients.length,
      sampleRecipients: recipients.slice(0, 5).map(r => ({ email: r.email, tier: r.tier })),
    });
  }

  if (!emailConfigured()) {
    return NextResponse.json({
      error: 'email_unconfigured',
      message: 'RESEND_API_KEY is not set on the server. Broadcast not sent. Run a dry-run for now or wire Resend first.',
      recipientCount: recipients.length,
    }, { status: 503 });
  }

  // Build a minimal default HTML if the caller didn't provide one. Keeps
  // formatting intact (paragraphs, line breaks).
  const html = (body.bodyHtml && body.bodyHtml.length > 0)
    ? body.bodyHtml
    : `<div style="font-family:Inter,system-ui,sans-serif;line-height:1.65;color:#1a2733;max-width:600px;margin:0 auto;padding:24px;">${text.split('\n\n').map(p => `<p style="margin:0 0 14px">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')}<hr style="border:none;border-top:1px solid #e8d8b8;margin:24px 0"/><div style="font-size:11px;color:#888;letter-spacing:0.08em;text-transform:uppercase">Ralph Foulger&rsquo;s Academy of Real Estate</div></div>`;

  // Pace sends to stay under Resend's per-second rate limit (10/s on the
  // default plan). 120ms gap = ~8/s, safe and finishes 100 recipients in
  // ~12 seconds.
  const results = { sent: 0, failed: 0, errors: [] as Array<{ email: string; reason: string }> };
  for (const r of recipients) {
    const personalText = personalize(text, { firstName: r.firstName || r.name });
    const personalHtml = personalize(html, { firstName: r.firstName || r.name });
    const res = await sendMail({
      to: r.email,
      subject,
      html: personalHtml,
      text: personalText,
      category: 'broadcast',
      userId: r.id,
    });
    if (res.ok) results.sent++;
    else {
      results.failed++;
      if (results.errors.length < 10) results.errors.push({ email: r.email, reason: res.reason ?? 'unknown' });
    }
    // Pause ~120ms between sends to stay under provider rate limits.
    await new Promise(res => setTimeout(res, 120));
  }

  return NextResponse.json({
    recipientCount: recipients.length,
    sent: results.sent,
    failed: results.failed,
    errors: results.errors,
  });
}

// Light personalization — {{firstName}} substitution. Keeps the template
// safe to send if firstName is missing (falls back to "there").
function personalize(s: string, vars: { firstName?: string | null }): string {
  const fn = (vars.firstName ?? '').trim() || 'there';
  return s.replace(/\{\{\s*firstName\s*\}\}/g, fn);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
