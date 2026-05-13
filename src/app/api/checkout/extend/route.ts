// ABOUTME: Plus-only $249.99 extension checkout. Gated to expired Plus users.
// ABOUTME: Standard users never see this — they must re-enroll at $599.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { stripe, stripeConfigured, priceIdFor } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.SITE_URL || 'https://ralphfoulger.com';

// Eligibility rules — kept here, near the gate, so they're easy to audit:
//   1. Must be authenticated.
//   2. User's current tier must be exactly 'plus'. Standard users cannot
//      buy an extension; they must re-enroll at the full $599 Standard
//      price. Solo users have no course access to extend.
//   3. User's accessExpiresAt must be in the past (window has expired).
//      An active Plus student can't buy an extension preemptively — that
//      would be a weird purchase pattern and we'd rather they finish first.
export async function POST(_req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  if (!stripeConfigured()) return NextResponse.json({ error: 'stripe_unavailable', message: 'Checkout is not yet configured. Email support@ralphfoulger.com.' }, { status: 503 });

  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized', loginRedirect: '/login' }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, tier: true, accessExpiresAt: true, stripeCustomerId: true },
  });
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

  // Rule 2: must be Plus.
  if (user.tier !== 'plus') {
    return NextResponse.json({
      error: 'extension_plus_only',
      message:
        user.tier === 'standard'
          ? 'The $249.99 extension is a Plus-only benefit. Standard students re-enroll at the full Standard price.'
          : 'The $249.99 extension is only available to Plus students.',
    }, { status: 403 });
  }

  // Rule 3: window must already be expired (or there is no window at all,
  // which shouldn't happen for a Plus user but is defensively allowed).
  const now = new Date();
  if (user.accessExpiresAt && user.accessExpiresAt > now) {
    return NextResponse.json({
      error: 'still_active',
      message: 'Your Plus access is still active. The extension is available once your window expires.',
      accessExpiresAt: user.accessExpiresAt.toISOString(),
    }, { status: 409 });
  }

  const priceId = priceIdFor('extension');
  if (!priceId) {
    return NextResponse.json({
      error: 'price_not_configured',
      message: 'STRIPE_PRICE_EXTENSION env var is not set on the server.',
    }, { status: 503 });
  }

  const s = stripe();
  if (!s) return NextResponse.json({ error: 'stripe_unavailable' }, { status: 503 });

  // Reuse the Stripe customer record we created on first checkout. Create one
  // if (somehow) the user has no Stripe customer yet — defense-in-depth.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const cust = await s.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = cust.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const checkout = await s.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${SITE}/checkout/success?session_id={CHECKOUT_SESSION_ID}&kind=extension`,
    cancel_url: `${SITE}/profile`,
    metadata: { userId: user.id, sku: 'extension', tier: 'plus' },
    payment_intent_data: {
      metadata: { userId: user.id, sku: 'extension', tier: 'plus' },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkout.url });
}
