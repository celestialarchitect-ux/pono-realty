import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { db } from '@/lib/db';
import { stripe, stripeConfigured, tierFromPriceId, type CheckoutTier } from '@/lib/stripe';
import { sendMail, welcomePaidTemplate } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe webhook. STRIPE_WEBHOOK_SECRET must be set; without it we refuse to
// process events because we cannot verify their authenticity.
export async function POST(req: NextRequest) {
  if (!stripeConfigured() || !db) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const s = stripe();
  if (!s) return NextResponse.json({ error: 'stripe_unavailable' }, { status: 503 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'webhook_secret_missing' }, { status: 503 });

  const sig = req.headers.get('stripe-signature') ?? '';
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: 'invalid_signature', detail: err instanceof Error ? err.message : 'unknown' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const sess = event.data.object as Stripe.Checkout.Session;
      let userId = (sess.metadata?.userId ?? '') as string;
      let tier = (sess.metadata?.tier ?? '') as CheckoutTier | '';

      // Fallback: derive tier from the price ID on the line item if metadata
      // was stripped or missing for some reason.
      if (!tier || (tier !== 'standard' && tier !== 'plus' && tier !== 'solo')) {
        const lineItems = await s.checkout.sessions.listLineItems(sess.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        const derived = priceId ? tierFromPriceId(priceId) : null;
        if (derived) tier = derived;
      }
      if (!userId || !tier) break;

      const amountCents = sess.amount_total ?? 0;
      const currency = sess.currency ?? 'usd';
      const paymentIntent = typeof sess.payment_intent === 'string'
        ? sess.payment_intent
        : sess.payment_intent?.id ?? null;

      // 1. Record the real payment so the admin "Verified revenue" KPI
      //    reflects actual money in. Unique stripeSessionId prevents
      //    double-counting if the webhook fires more than once for the
      //    same session (Stripe's at-least-once delivery guarantee).
      if (amountCents > 0) {
        try {
          await db.payment.create({
            data: {
              userId,
              stripeSessionId: sess.id,
              stripePaymentIntent: paymentIntent,
              amountCents,
              currency,
              tier,
              status: 'succeeded',
            },
          });
        } catch {
          // Most likely cause: duplicate stripeSessionId (idempotent replay).
          // Safe to ignore — the original row already exists.
        }
      }

      // 2. Update the user's tier + fire welcome email (idempotent).
      await applyTier(userId, tier);
      break;
    }
    // Future: handle 'charge.refunded' to write negative-amount Payment rows
    // and downgrade tier when needed.
  }

  return NextResponse.json({ received: true });
}

async function applyTier(userId: string, tier: CheckoutTier) {
  if (!db) return;
  const user = await db.user.update({
    where: { id: userId },
    data: { tier },
    select: { email: true, name: true },
  });
  try {
    const tpl = welcomePaidTemplate({ name: user.name, tier });
    await sendMail({ to: user.email, ...tpl, category: 'welcome', userId });
  } catch (err) {
    console.warn('webhook: welcome email failed', err);
  }
}
