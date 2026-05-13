// Transactional email via Resend. Gracefully no-ops when RESEND_API_KEY is
// missing — the auth flows write the token to the server log in dev so you
// can still test locally without a real Resend account.

import { Resend } from 'resend';
import { db } from './db';

const FROM = process.env.EMAIL_FROM || 'Ralph Foulger Academy <noreply@ralphfoulger.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@ralphfoulger.com';

export type MessageCategory = 'verify' | 'reset' | 'welcome' | 'support-reply' | 'broadcast' | 'inbound' | 'other';

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  category?: MessageCategory;
  userId?: string | null;
  ticketId?: string | null;
}

// Sends transactional mail via Resend AND logs the message to the DB so
// the admin inbox can show everything we ship out (verify, reset, welcome,
// etc.). The DB log is best-effort — Resend send is the source of truth
// for actual delivery.
export async function sendMail({ to, subject, html, text, category = 'other', userId = null, ticketId = null }: SendArgs): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const c = client();

  // Pre-create a queued record so admin can see attempts even when Resend
  // is unconfigured or the network fails.
  let logId: string | null = null;
  if (db) {
    try {
      const row = await db.message.create({
        data: {
          direction: 'outbound',
          category,
          fromAddr: FROM,
          toAddr: to,
          subject,
          bodyText: text,
          bodyHtml: html,
          status: c ? 'queued' : 'unconfigured',
          userId,
          ticketId,
        },
        select: { id: true },
      });
      logId = row.id;
    } catch {/* logging failure is non-fatal */}
  }

  if (!c) {
    console.warn(`[email:unconfigured] would send to=${to} subject="${subject}"\n${text}`);
    return { ok: false, reason: 'unconfigured' };
  }

  try {
    const res = await c.emails.send({ from: FROM, replyTo: REPLY_TO, to, subject, html, text });
    if (res.error) {
      if (db && logId) {
        try { await db.message.update({ where: { id: logId }, data: { status: 'bounced', errorMsg: res.error.message } }); } catch {/* ignore */}
      }
      return { ok: false, reason: res.error.message };
    }
    if (db && logId) {
      try { await db.message.update({ where: { id: logId }, data: { status: 'sent', providerId: res.data?.id ?? null } }); } catch {/* ignore */}
    }
    return { ok: true, id: res.data?.id };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    if (db && logId) {
      try { await db.message.update({ where: { id: logId }, data: { status: 'bounced', errorMsg: reason } }); } catch {/* ignore */}
    }
    return { ok: false, reason };
  }
}

// ─────────────── Templates ───────────────

const BRAND_COLOR = '#14837b';
const BG_COLOR = '#fbf7f0';
const TEXT_COLOR = '#0e1a26';
const MUTED = '#6b7a8a';
const SITE = process.env.SITE_URL || 'https://ralphfoulger.com';

function wrap(inner: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT_COLOR};">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${BG_COLOR};padding:40px 20px;">
<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="background:#fff;border-radius:14px;padding:36px 32px;border:1px solid rgba(45,55,72,0.08);max-width:560px;">
<tr><td>
  <div style="font-family:Georgia,'Times New Roman',serif;font-weight:800;font-size:18px;letter-spacing:0.02em;color:${BRAND_COLOR};margin-bottom:24px;">
    RALPH FOULGER&rsquo;S ACADEMY OF REAL ESTATE
  </div>
  ${inner}
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(45,55,72,0.08);font-size:12px;color:${MUTED};line-height:1.6;">
    Ralph Foulger&rsquo;s Academy of Real Estate &middot; Hawaii REC-approved pre-license course<br>
    Ralph S. Foulger, Realtor &middot; Instructor since 1972<br>
    <a href="${SITE}" style="color:${MUTED};">${SITE.replace(/^https?:\/\//, '')}</a>
  </div>
</td></tr></table>
</td></tr></table>
</body></html>`;
}

export function verifyEmailTemplate(args: { name: string; link: string }): { subject: string; html: string; text: string } {
  const greeting = args.name.split(' ')[0] || 'there';
  return {
    subject: 'Verify your email — Ralph Foulger Academy',
    html: wrap(`
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:800;font-size:28px;letter-spacing:-0.02em;line-height:1.2;margin:0 0 14px;color:${TEXT_COLOR};">
        Welcome, ${escape(greeting)}.
      </h1>
      <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 24px;">
        Click below to confirm your email so your study hours sync across devices and your mock-exam eligibility shows up on your profile.
      </p>
      <a href="${args.link}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.04em;">
        Verify my email →
      </a>
      <p style="font-size:13px;line-height:1.6;color:${MUTED};margin:28px 0 0;">
        Or paste this link into your browser:<br>
        <a href="${args.link}" style="color:${BRAND_COLOR};word-break:break-all;">${args.link}</a>
      </p>
      <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:24px 0 0;">
        This link expires in 24 hours. If you didn&rsquo;t sign up, you can safely ignore this email.
      </p>
    `),
    text: `Welcome, ${greeting}.

Click to verify your email and start tracking your Hawaii pre-license study hours:
${args.link}

This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.

— Ralph Foulger's Academy of Real Estate`,
  };
}

export function resetPasswordTemplate(args: { name: string; link: string }): { subject: string; html: string; text: string } {
  const greeting = args.name.split(' ')[0] || 'there';
  return {
    subject: 'Reset your password — Ralph Foulger Academy',
    html: wrap(`
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:800;font-size:28px;letter-spacing:-0.02em;line-height:1.2;margin:0 0 14px;color:${TEXT_COLOR};">
        Reset your password.
      </h1>
      <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 24px;">
        Hey ${escape(greeting)} &mdash; we received a request to reset your password. Click below to choose a new one. The link is good for 1 hour.
      </p>
      <a href="${args.link}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.04em;">
        Reset my password →
      </a>
      <p style="font-size:13px;line-height:1.6;color:${MUTED};margin:28px 0 0;">
        Or paste this link into your browser:<br>
        <a href="${args.link}" style="color:${BRAND_COLOR};word-break:break-all;">${args.link}</a>
      </p>
      <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:24px 0 0;">
        If you didn&rsquo;t request a reset, you can safely ignore this email &mdash; your password stays unchanged.
      </p>
    `),
    text: `Hey ${greeting},

Click to reset your password:
${args.link}

The link is good for 1 hour. If you didn't request this, you can ignore it.

— Ralph Foulger's Academy of Real Estate`,
  };
}

export function welcomePaidTemplate(args: { name: string; tier: string }): { subject: string; html: string; text: string } {
  const greeting = args.name.split(' ')[0] || 'there';
  const tierLabel = args.tier.charAt(0).toUpperCase() + args.tier.slice(1);
  return {
    subject: `Welcome to ${tierLabel} — Ralph Foulger Academy`,
    html: wrap(`
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:800;font-size:28px;letter-spacing:-0.02em;line-height:1.2;margin:0 0 14px;color:${TEXT_COLOR};">
        You&rsquo;re in, ${escape(greeting)}.
      </h1>
      <p style="font-size:15px;line-height:1.65;color:${MUTED};margin:0 0 24px;">
        Your ${escape(tierLabel)} tier is active. Your study clock is running &mdash; Hawaii state law requires 60 hours of pre-license study before the PSI exam, and we&rsquo;ll show you exactly where you are at every step.
      </p>
      <a href="${SITE}/profile" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.04em;">
        Open my profile →
      </a>
      <p style="font-size:13px;line-height:1.65;color:${MUTED};margin:24px 0 0;">
        Questions? Just reply to this email &mdash; it goes straight to support.
      </p>
    `),
    text: `You're in, ${greeting}.

Your ${tierLabel} tier is active. Your study clock starts now:
${SITE}/profile

Hawaii state law requires 60 hours of pre-license study before the PSI exam. We'll show you where you are at every step.

— Ralph Foulger's Academy of Real Estate`,
  };
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
