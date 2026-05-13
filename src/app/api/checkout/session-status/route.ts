// ABOUTME: Returns the status of a Stripe Checkout Session by ID.
// ABOUTME: Used by /checkout/return to show success/failure UI after Embedded Checkout finishes.

import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfigured } from '@/lib/stripe';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!authConfigured() || !stripeConfigured()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id || !/^cs_[a-zA-Z0-9_]+$/.test(id)) {
    return NextResponse.json({ error: 'invalid_session_id' }, { status: 400 });
  }

  const s = stripe();
  if (!s) return NextResponse.json({ error: 'stripe_unavailable' }, { status: 503 });

  try {
    const checkout = await s.checkout.sessions.retrieve(id);
    // Defense-in-depth: only let the session-owner read it.
    if (checkout.metadata?.userId && checkout.metadata.userId !== session.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    return NextResponse.json({
      status: checkout.status,
      payment_status: checkout.payment_status,
      amount_total: checkout.amount_total,
      currency: checkout.currency,
    });
  } catch (err) {
    return NextResponse.json({
      error: 'lookup_failed',
      detail: err instanceof Error ? err.message : 'unknown',
    }, { status: 500 });
  }
}
