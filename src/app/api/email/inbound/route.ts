import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Generic inbound email webhook. Accepts the shape that Cloudflare Email
// Workers, Mailgun Routes, SendGrid Inbound Parse, and Postmark Inbound all
// can be configured to send. The provider's webhook config lets you map
// their native fields to this shape.
//
// Recommended provider: Cloudflare Email Workers (free, no DNS migration if
// you keep Namecheap nameservers but route ralphfoulger.com email through
// Cloudflare). See DEPLOY_DB_AUTH.md for the setup walkthrough.
//
// Auth: requires INBOUND_WEBHOOK_SECRET as a Bearer token. Refuses anything
// else. This prevents random POSTs from littering the inbox.

const TICKET_TAG_RE = /\[RF-([a-z0-9]{6,30})\]/i;

interface InboundPayload {
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  messageId?: string;
}

export async function POST(req: NextRequest) {
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'webhook_secret_missing' }, { status: 503 });
  }
  const auth = req.headers.get('authorization') ?? '';
  const bearer = auth.replace(/^Bearer\s+/i, '');
  if (bearer !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json({ error: 'db_unavailable' }, { status: 503 });
  }

  let body: InboundPayload;
  try { body = (await req.json()) as InboundPayload; } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const fromAddr = (body.from ?? '').trim().slice(0, 200);
  const toAddr = (body.to ?? '').trim().slice(0, 200);
  const subject = (body.subject ?? '(no subject)').slice(0, 500);
  const bodyText = (body.text ?? '').slice(0, 50_000);
  const bodyHtml = body.html ? body.html.slice(0, 200_000) : null;
  const providerId = body.messageId?.slice(0, 200) ?? null;

  if (!fromAddr) return NextResponse.json({ error: 'no_from' }, { status: 400 });

  // Subject-line ticket tag (e.g., "Re: [RF-abc123] Forgot login")
  let ticketId: string | null = null;
  const tag = subject.match(TICKET_TAG_RE);
  if (tag) {
    const candidate = await db.supportTicket.findUnique({ where: { id: tag[1] }, select: { id: true } });
    if (candidate) ticketId = candidate.id;
  }

  // Match a user record by the From address so admin can see study history
  const cleanFrom = parseAddr(fromAddr);
  const user = cleanFrom ? await db.user.findUnique({ where: { email: cleanFrom }, select: { id: true } }) : null;

  await db.message.create({
    data: {
      direction: 'inbound',
      category: ticketId ? 'support-reply' : 'inbound',
      fromAddr,
      toAddr,
      subject,
      bodyText,
      bodyHtml,
      providerId,
      status: 'received',
      userId: user?.id ?? null,
      ticketId,
    },
  });

  // If this is a reply on a ticket, nudge the ticket back to open
  if (ticketId) {
    try {
      await db.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'open', resolvedAt: null, resolvedBy: null },
      });
    } catch {/* ignore */}
  }

  return NextResponse.json({ ok: true });
}

function parseAddr(raw: string): string | null {
  // Extract just the email address from "Name <email@host>" or "email@host"
  const m = raw.match(/<([^>]+)>/);
  const addr = (m ? m[1] : raw).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr) ? addr : null;
}
