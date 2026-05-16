// ABOUTME: Admin direct message to a single student. Logs to Message + sends via Resend if configured.
// ABOUTME: The message appears in the student's /profile inbox immediately; the email is a nice-to-have.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';
import { sendMail, emailConfigured } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface DirectMessageBody {
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  // If true, only writes the in-app message (no Resend email). Default false.
  inAppOnly?: boolean;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin && !hasRole(session, 'support') && !hasRole(session, 'instructor')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const recipient = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, firstName: true, name: true },
  });
  if (!recipient) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: DirectMessageBody;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const subject = (body.subject ?? '').trim();
  const text = (body.bodyText ?? '').trim();
  if (subject.length < 2 || subject.length > 200) {
    return NextResponse.json({ error: 'invalid_subject' }, { status: 400 });
  }
  if (text.length < 2 || text.length > 20000) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const inAppOnly = body.inAppOnly === true || !emailConfigured();

  // Personalize {{firstName}} like the broadcast endpoint does.
  const fn = (recipient.firstName ?? '').trim() || recipient.name?.split(' ')[0] || 'there';
  const personalText = text.replace(/\{\{\s*firstName\s*\}\}/g, fn);
  const personalHtml = (body.bodyHtml && body.bodyHtml.length > 0)
    ? body.bodyHtml.replace(/\{\{\s*firstName\s*\}\}/g, fn)
    : `<div style="font-family:Inter,system-ui,sans-serif;line-height:1.65;color:#1a2733;max-width:600px;margin:0 auto;padding:24px;">${personalText.split('\n\n').map(p => `<p style="margin:0 0 14px">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>`;

  if (inAppOnly) {
    // Just create the Message row — appears instantly in /profile inbox.
    const row = await db.message.create({
      data: {
        direction: 'outbound',
        category: 'other',
        fromAddr: 'support@ralphfoulger.com',
        toAddr: recipient.email,
        subject,
        bodyText: personalText,
        bodyHtml: personalHtml,
        status: 'delivered',  // in-app: instant delivery
        userId: recipient.id,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, messageId: row.id, channel: 'in-app' });
  }

  // Email + DB log (sendMail handles both).
  const res = await sendMail({
    to: recipient.email,
    subject,
    html: personalHtml,
    text: personalText,
    category: 'other',
    userId: recipient.id,
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: 'send_failed', reason: res.reason }, { status: 502 });
  }
  return NextResponse.json({ ok: true, messageId: res.id, channel: 'email+in-app' });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
