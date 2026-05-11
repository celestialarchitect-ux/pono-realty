// Stripe client + product / price configuration.
// Three Stripe Price IDs map to the academy's three paid tiers. Prices are
// created in the Stripe dashboard and wired through env vars so we never
// hard-code amounts in source.

import Stripe from 'stripe';

export type CheckoutTier = 'standard' | 'plus' | 'solo';

const PRICE_ENV: Record<CheckoutTier, string> = {
  standard: 'STRIPE_PRICE_STANDARD',
  plus:     'STRIPE_PRICE_PLUS',
  solo:     'STRIPE_PRICE_SOLO',
};

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function stripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  // No explicit apiVersion — defaults to the version pinned by the installed
  // Stripe SDK, which is the only version the SDK guarantees type compatibility
  // with. Override here if you need to peg to a specific API release.
  return new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });
}

export function priceIdFor(tier: CheckoutTier): string | null {
  return process.env[PRICE_ENV[tier]] ?? null;
}

export function tierFromPriceId(priceId: string): CheckoutTier | null {
  for (const tier of ['standard', 'plus', 'solo'] as const) {
    if (process.env[PRICE_ENV[tier]] === priceId) return tier;
  }
  return null;
}

export const TIER_PRICE_USD: Record<CheckoutTier, number> = {
  standard: 599,
  plus: 899,
  solo: 800,
};

export const TIER_LABEL: Record<CheckoutTier, string> = {
  standard: 'Standard',
  plus: 'Plus',
  solo: 'Solo Website Build',
};
