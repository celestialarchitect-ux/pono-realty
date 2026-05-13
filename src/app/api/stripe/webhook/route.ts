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
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      // Both events represent "money is in". Async-payment-succeeded fires
      // for slower methods (ACH, certain wallets) that don't settle at the
      // moment the customer clicks Pay. We treat them identically — apply
      // tier + write Payment row + send welcome email.
      const sess = event.data.object as Stripe.Checkout.Session;
      const userId = (sess.metadata?.userId ?? '') as string;
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
          // Duplicate stripeSessionId from idempotent replay — safe to skip.
        }
      }
      await applyPayment(userId, sku);
      break;
    }

    case 'checkout.session.async_payment_failed': {
      // The customer's slow payment method (ACH etc.) ultimately failed.
      // Log it for admin review — no tier grant happens. We do NOT delete
      // any Payment row because none should have been written; this branch
      // is informational only.
      const sess = event.data.object as Stripe.Checkout.Session;
      console.warn('webhook: async_payment_failed', { sessionId: sess.id, customer: sess.customer });
      break;
    }

    case 'charge.refunded': {
      // Full or partial refund issued. We flip the Payment row's status,
      // and on FULL refund of a course-access tier we also revoke the
      // student's access (set accessExpiresAt to now) so they lose the
      // content immediately. Solo (website build) refunds don't expire
      // anything since accessExpiresAt is null anyway.
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent = typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id ?? null;
      if (!paymentIntent) break;

      const fullyRefunded = charge.amount_refunded >= charge.amount;
      const newStatus = fullyRefunded ? 'refunded' : 'partial_refund';

      const payment = await db.payment.findFirst({
        where: { stripePaymentIntent: paymentIntent },
        select: { id: true, userId: true, tier: true, status: true },
      });
      if (!payment) {
        console.warn('webhook: charge.refunded — no matching Payment row', { paymentIntent });
        break;
      }
      // Idempotent: skip if already at the same status.
      if (payment.status !== newStatus) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: newStatus },
        });
      }

      // On full refund of a course tier, revoke immediately.
      if (fullyRefunded && (payment.tier === 'standard' || payment.tier === 'plus' || payment.tier === 'extension')) {
        await db.user.update({
          where: { id: payment.userId },
          data: {
            tier: 'free',
            accessExpiresAt: new Date(), // expire right now
          },
        });
      }
      // Solo full refund: drop the tier but keep accessExpiresAt null (it
      // was null anyway — no course component to revoke).
      if (fullyRefunded && payment.tier === 'solo') {
        await db.user.update({
          where: { id: payment.userId },
          data: { tier: 'free' },
        });
      }
      break;
    }

    case 'charge.dispute.created': {
      // Chargeback opened. We DO NOT auto-revoke access yet — chargebacks
      // can be won by the merchant. Flag the payment for admin review.
      // Stripe will fire charge.refunded if the dispute is lost; that
      // handler above does the actual revocation.
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntent = typeof dispute.payment_intent === 'string'
        ? dispute.payment_intent
        : dispute.payment_intent?.id ?? null;
      if (!paymentIntent) break;
      try {
        await db.payment.updateMany({
          where: { stripePaymentIntent: paymentIntent },
          data: { status: 'disputed' },
        });
      } catch (err) {
        console.warn('webhook: dispute flag failed', err);
      }
      // TODO: alert admin via email/Slack once that channel exists.
      console.warn('webhook: charge.dispute.created', { paymentIntent, reason: dispute.reason });
      break;
    }
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
