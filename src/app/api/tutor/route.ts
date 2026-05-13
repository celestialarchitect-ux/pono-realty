// POST /api/tutor — AI Real Estate Tutor endpoint.
//
// Sends the conversation to Anthropic's Claude with a system prompt grounded
// in the Hawaii salesperson PSI curriculum. Returns streaming text.
//
// Request body: { messages: [{role, content}], focusChapter?: string }
// Auth: requires session cookie OR (in dev) the X-Tutor-Preview header.
//       In production, gate behind paid tier check.

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/tutor-system-prompt';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// AI tutor calls cost real money. Three gates protect against runaway bills:
//   1. AUTH — must be a logged-in user with a paid tier (or admin).
//   2. EXPIRY — if the user's accessExpiresAt has passed, the tutor is
//      treated as no longer included in their plan.
//   3. RATE LIMIT — at most 60 tutor calls per user per hour. Anyone
//      hammering the endpoint hits this before they burn through the
//      Anthropic budget.
//
// All three layers fail fast (auth before rate-limit, before any model call).

const PAID_TIERS = new Set(['standard', 'plus']);
const TUTOR_RATE_LIMIT_PER_HOUR = 60;

// Module-level rate limit store. Resets on container restart, which is
// acceptable for a tutor — at worst a malicious user gets a few extra
// requests across a deploy. For stricter enforcement we'd back this with
// Redis.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; resetInSec: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(userId);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(userId, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return { allowed: true, resetInSec: 3600 };
  }
  if (bucket.count >= TUTOR_RATE_LIMIT_PER_HOUR) {
    return { allowed: false, resetInSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count++;
  return { allowed: true, resetInSec: Math.ceil((bucket.resetAt - now) / 1000) };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: 'tutor_offline',
        message:
          "The AI Tutor is being provisioned. Please check back shortly — your tutor will be ready to help once your enrollment is fully activated.",
      },
      { status: 503 }
    );
  }

  // Gate 1: auth.
  if (!authConfigured() || !db) {
    return Response.json({ error: 'auth_unavailable' }, { status: 503 });
  }
  const session = await getSessionUser();
  if (!session) {
    return Response.json({ error: 'unauthorized', message: 'Sign in to use the AI tutor.' }, { status: 401 });
  }

  // Gate 2: paid tier + non-expired access. Admins always have tutor.
  const u = await db.user.findUnique({
    where: { id: session.id },
    select: { tier: true, isAdmin: true, accessExpiresAt: true },
  });
  if (!u) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const expired = !!u.accessExpiresAt && u.accessExpiresAt <= new Date();
  if (!u.isAdmin && (!PAID_TIERS.has(u.tier) || expired)) {
    return Response.json({
      error: 'tier_required',
      message: expired
        ? 'Your course access window has ended. Re-enroll or extend (Plus only) to keep using the AI tutor.'
        : 'The AI tutor is included with Standard and Plus tiers. Upgrade at /pricing.',
      upgrade: '/pricing',
    }, { status: 402 });
  }

  // Gate 3: rate limit. Per-user hourly cap so a runaway client can't
  // drain the budget.
  const limit = checkRateLimit(session.id);
  if (!limit.allowed) {
    return Response.json({
      error: 'rate_limited',
      message: `You've hit the hourly tutor limit. Try again in ${Math.ceil(limit.resetInSec / 60)} minutes.`,
    }, { status: 429 });
  }

  let body: { messages?: ChatMessage[]; focusChapter?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return Response.json({ error: 'no_messages' }, { status: 400 });
  }

  // Sanity check: cap conversation length so a runaway client can't run up costs
  if (messages.length > 50) {
    return Response.json({ error: 'too_many_messages' }, { status: 400 });
  }

  const validMessages: ChatMessage[] = messages
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.length > 0 &&
        m.content.length < 4000
    )
    .slice(-30);

  if (validMessages.length === 0) {
    return Response.json({ error: 'no_valid_messages' }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(body.focusChapter);

  try {
    const anthropic = new Anthropic({ apiKey });
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: validMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          controller.enqueue(
            encoder.encode(`\n\n[error: ${msg}]\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json(
      { error: 'tutor_failed', message: msg },
      { status: 500 }
    );
  }
}
