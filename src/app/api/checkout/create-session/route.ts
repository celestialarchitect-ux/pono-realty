import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { stripe, stripeConfigured, priceIdFor, type CheckoutTier } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.SITE_URL || 'https://ralphfoulger.com';

// Tier-purchase endpoint. The Plus 90-day extension lives at
// /api/checkout/extend so it can enforce its own gating (Plus-only, expired
// only). This route handles fresh tier purchases and Standard re-enrollment.
export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  if (!stripeConfigured()) return NextResponse.json({ error: 'stripe_unavailable', message: 'Checkout is not yet configured. Email support@ralphfoulger.com.' }, { status: 503 });

  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized', loginRedirect: '/login' }, { status: 401 });

  let body: { tier?: CheckoutTier };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const tier = body.tier;
  if (tier !== 'standard' && tier !== 'plus' && tier !== 'solo') {
    return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
  }
  const priceId = priceIdFor(tier);
  if (!priceId) return NextResponse.json({ error: 'price_not_configured', message: `STRIPE_PRICE_${tier.toUpperCase()} env var is not set on the server.` }, { status: 503 });

  const s = stripe();
  if (!s) return NextResponse.json({ error: 'stripe_unavailable' }, { status: 503 });

  // Look up or create a Stripe Customer keyed to the academy user
  let customerId = (await db.user.findUnique({ where: { id: session.id }, select: { stripeCustomerId: true } }))?.stripeCustomerId;
  if (!customerId) {
    const cust = await s.customers.create({
      email: session.email,
      name: session.name,
      metadata: { userId: session.id },
    });
    customerId = cust.id;
    await db.user.update({ where: { id: session.id }, data: { stripeCustomerId: customerId } });
  }

  const checkout = await s.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${SITE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}/pricing`,
    // sku is the modern field the webhook reads; tier kept for back-compat.
    metadata: { userId: session.id, sku: tier, tier },
    payment_intent_data: {
      metadata: { userId: session.id, sku: tier, tier },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkout.url });
}
