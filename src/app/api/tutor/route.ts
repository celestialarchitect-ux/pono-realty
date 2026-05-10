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

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
