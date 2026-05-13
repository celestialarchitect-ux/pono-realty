import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { db } from '@/lib/db';
import { stripe, stripeConfigured, skuFromPriceId, computeAccessExpiry, type CheckoutSku } from '@/lib/stripe';
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
      const userId = (sess.metadata?.userId ?? '') as string;
      // metadata.sku is the canonical signal from /api/checkout/create-session
      // and /api/checkout/extend. Fall back to legacy metadata.tier for any
      // sessions created before this rollout.
      let sku = (sess.metadata?.sku ?? sess.metadata?.tier ?? '') as CheckoutSku | '';

      // Hard fallback: derive SKU from the line-item price if metadata is
      // missing entirely (manual payment links, dashboard-initiated charges).
      if (!sku || (sku !== 'standard' && sku !== 'plus' && sku !== 'solo' && sku !== 'extension')) {
        const lineItems = await s.checkout.sessions.listLineItems(sess.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        const derived = priceId ? skuFromPriceId(priceId) : null;
        if (derived) sku = derived;
      }
      if (!userId || !sku) break;

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
              tier: sku,
              status: 'succeeded',
            },
          });
        } catch {
          // Most likely cause: duplicate stripeSessionId (idempotent replay).
          // Safe to ignore — the original row already exists.
        }
      }

      // 2. Update the user's tier + access window + fire welcome email.
      //    All idempotent: if Stripe replays this event, the user ends up in
      //    the same state.
      await applyPayment(userId, sku);
      break;
    }
    // Future: handle 'charge.refunded' to write negative-amount Payment rows
    // and downgrade tier when needed.
  }

  return NextResponse.json({ received: true });
}

async function applyPayment(userId: string, sku: CheckoutSku) {
  if (!db) return;

  // Read current state so we can compute the new expiry correctly. Extension
  // needs the existing accessExpiresAt as input.
  const current = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, tier: true, accessExpiresAt: true },
  });
  if (!current) return;

  const newExpiry = computeAccessExpiry(sku, current.accessExpiresAt ?? null);

  // For Standard / Plus / Solo: set tier to the SKU.
  // For Extension: keep tier='plus' (user is still a Plus student), just
  // extend the access window. We refuse extensions on non-Plus tiers from
  // the checkout endpoint, but enforce it again here as defense-in-depth.
  let nextTier: string = current.tier;
  if (sku === 'standard' || sku === 'plus' || sku === 'solo') {
    nextTier = sku;
  } else if (sku === 'extension') {
    // Only honor extension top-up if the user is actually on Plus. If a
    // free or standard user somehow gets billed for an extension, we still
    // record the Payment but do NOT extend their access — the customer
    // service inbox will catch this for refund.
    if (current.tier !== 'plus') {
      console.warn(`webhook: refused extension top-up for non-plus user ${userId} (tier=${current.tier})`);
      return;
    }
  }

  await db.user.update({
    where: { id: userId },
    data: {
      tier: nextTier,
      // accessExpiresAt is non-NULL for Standard/Plus/Extension and NULL for
      // Solo. Trust computeAccessExpiry to express that.
      accessExpiresAt: newExpiry,
    },
  });

  try {
    const tpl = welcomePaidTemplate({ name: current.name, tier: nextTier as 'standard' | 'plus' | 'solo' });
    await sendMail({ to: current.email, ...tpl, category: 'welcome', userId });
  } catch (err) {
    console.warn('webhook: welcome email failed', err);
  }
}
