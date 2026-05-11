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
      const userId = (sess.metadata?.userId ?? '') as string;
      const tier = (sess.metadata?.tier ?? '') as CheckoutTier | '';
      if (!userId || (tier !== 'standard' && tier !== 'plus' && tier !== 'solo')) {
        // Fall back to deriving tier from the price ID
        const lineItems = await s.checkout.sessions.listLineItems(sess.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        const derived = priceId ? tierFromPriceId(priceId) : null;
        if (!userId || !derived) break;
        await applyTier(userId, derived);
      } else {
        await applyTier(userId, tier);
      }
      break;
    }
    // Future: handle refunds → downgrade tier, subscription events if we add recurring billing
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
    await sendMail({ to: user.email, ...tpl });
  } catch (err) {
    console.warn('webhook: welcome email failed', err);
  }
}
