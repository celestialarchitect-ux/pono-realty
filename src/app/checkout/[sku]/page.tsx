'use client';

// On-domain Stripe Embedded Checkout. Customer lands here from /pricing
// (or /profile for extension) and sees:
//   - Our Header
//   - A branded order-summary card (tier name, what's included, price)
//   - Stripe's checkout form rendered inline (an iframe on our domain)
//   - Our Footer
//
// The customer NEVER leaves ralphfoulger.com. The form fields still use
// Stripe's default visual styling — to theme those too we'd need Payment
// Element (more code) or Ralph to set account-level branding.

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { Icon, type IconKind } from '@/components/Icon';

// Tier metadata shown in the order-summary card on the left of the page.
// Keep in sync with src/lib/stripe.ts.
const TIER_INFO: Record<string, {
  label: string;
  price: number;
  tagline: string;
  bullets: { icon: IconKind; text: string }[];
  accentColor: 'ocean' | 'coral';
  note?: string;
}> = {
  standard: {
    label: 'Standard — Hawaii Pre-License Course',
    price: 599,
    tagline: 'The complete 60-hour Hawaii pre-license system.',
    accentColor: 'ocean',
    bullets: [
      { icon: 'book',       text: 'All 20 chapters with audiobook narration' },
      { icon: 'tutor',      text: '24/7 AI Real Estate Tutor' },
      { icon: 'flashcards', text: 'Smart flashcards + math drills' },
      { icon: 'target',     text: '130-question mock exams (3 difficulty tiers)' },
      { icon: 'calendar',   text: 'Built-in daily lesson planner' },
      { icon: 'graduate',   text: '3-month access ceiling · most finish in 2-6 weeks' },
    ],
    note: 'If your window expires, re-enrollment is at the full $599 Standard price.',
  },
  plus: {
    label: 'Plus — Course + Solo Agent Website Bundle',
    price: 899,
    tagline: 'Everything in Standard, plus a custom agent website on graduation.',
    accentColor: 'coral',
    bullets: [
      { icon: 'book',       text: 'Everything in Standard (full course + AI tutor + mocks)' },
      { icon: 'website',    text: 'Custom Hawaii agent website on your domain (on passing PSI)' },
      { icon: 'tutor',      text: 'CRM, lead capture, admin portal' },
      { icon: 'compass',    text: 'Launch playbook + curated starter lead packet' },
      { icon: 'shield',     text: 'Broker introductions + contract templates' },
      { icon: 'graduate',   text: '6-month access ceiling + $249.99 extension safety net' },
    ],
    note: 'Plus-only $249.99 extension available if you don\'t finish in your 6-month window.',
  },
  solo: {
    label: 'Solo — Hawaii Agent Website Build',
    price: 800,
    tagline: 'For already-licensed agents. Standalone custom website build.',
    accentColor: 'coral',
    bullets: [
      { icon: 'website',    text: 'Custom Hawaii broker website on your own domain' },
      { icon: 'tutor',      text: 'CRM + lead capture + admin portal' },
      { icon: 'mobile',     text: 'Mobile-first responsive build' },
      { icon: 'graduate',   text: '12 months of hosting + edits included' },
      { icon: 'audit',      text: 'License verification before site goes live' },
    ],
    note: 'No course component. For active Hawaii brokers and salespersons.',
  },
  extension: {
    label: 'Plus Extension — 90 More Days',
    price: 249.99,
    tagline: 'Plus-only second-attempt. Adds 90 days of full course access.',
    accentColor: 'ocean',
    bullets: [
      { icon: 'calendar',  text: '90 additional days of full course access' },
      { icon: 'book',      text: 'Same chapters, audiobook, AI tutor, mocks' },
      { icon: 'graduate',  text: 'Your study progress is preserved' },
      { icon: 'shield',    text: 'Plus website bundle stays attached to your account' },
    ],
    note: 'Available only to Plus students whose 6-month access window has expired. Standard students re-enroll at the full Standard price.',
  },
};

// Lazy publishable-key load. If the env var is missing, we'll surface a
// clear message instead of a blank iframe.
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const sku = String(params?.sku ?? '').toLowerCase();
  const tierInfo = TIER_INFO[sku];

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!tierInfo) return;
    let cancelled = false;

    const start = async () => {
      // Pre-flight session check so we can route to /login with ?next=
      const meRes = await fetch('/api/auth/me', { cache: 'no-store' }).catch(() => null);
      const me = meRes ? await meRes.json().catch(() => null) : null;
      if (!me?.user) {
        if (!cancelled) {
          setAuthed(false);
          router.replace(`/login?next=${encodeURIComponent(`/checkout/${sku}`)}`);
        }
        return;
      }
      if (cancelled) return;
      setAuthed(true);

      // Extension uses a different endpoint (gates to expired Plus only).
      // Everything else goes through the standard create-session endpoint.
      const endpoint = sku === 'extension' ? '/api/checkout/extend' : '/api/checkout/create-session';
      const payload = sku === 'extension' ? { embedded: true } : { tier: sku, embedded: true };

      try {
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await r.json();
        if (!r.ok) {
          setError(body.message ?? body.error ?? 'Checkout is not available right now.');
          return;
        }
        if (!cancelled) setClientSecret(body.clientSecret);
      } catch {
        if (!cancelled) setError('Network error. Try again.');
      }
    };
    start();
    return () => { cancelled = true; };
  }, [sku, tierInfo, router]);

  if (!tierInfo) {
    return (
      <Shell>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: T.text, marginBottom: 14 }}>
          We couldn&apos;t find that tier.
        </h1>
        <p style={{ fontSize: 15, color: T.textDim, marginBottom: 18 }}>
          The checkout URL didn&apos;t match a known product. Back to pricing?
        </p>
        <Link href="/pricing" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          See pricing →
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 440px) 1fr', gap: 36, alignItems: 'flex-start' }} data-stack-mobile="true">
        <OrderSummary sku={sku} info={tierInfo} />
        <div style={{ ...CARD, padding: 28, minHeight: 600 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
            Secure payment
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            Complete your enrollment.
          </h2>
          <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, marginBottom: 22 }}>
            Payments are processed by Stripe. Your card details never touch our server. One-time charge &mdash; no subscription.
          </p>

          {!stripePromise ? (
            <ConfigurationMissing />
          ) : authed === false ? (
            <Notice tone="info">Redirecting to log in…</Notice>
          ) : error ? (
            <Notice tone="error">{error}</Notice>
          ) : !clientSecret ? (
            <Notice tone="info">Preparing secure checkout…</Notice>
          ) : (
            <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}` }}>
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '48px 32px 80px', maxWidth: 1180, margin: '0 auto' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function OrderSummary({ sku, info }: { sku: string; info: typeof TIER_INFO['standard'] }) {
  const accent = info.accentColor === 'ocean' ? T.ocean : T.coral;
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
        Order summary
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', color: T.text, lineHeight: 1.1, marginBottom: 8 }}>
        {info.label}
      </h1>
      <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.55, marginBottom: 20 }}>{info.tagline}</p>

      <div style={{ ...CARD, padding: 24, marginBottom: 16, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: accent }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700 }}>
            One-time payment
          </span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, color: T.text, letterSpacing: '-0.02em', lineHeight: 1 }}>
            ${info.price}
          </span>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {info.bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.45, color: T.text }}>
              <span style={{ color: accent, flexShrink: 0, marginTop: 2 }}>
                <Icon kind={b.icon} size={16} strokeWidth={1.8} />
              </span>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {info.note && (
        <p style={{ fontSize: 12, color: T.textMute, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
          {info.note}
        </p>
      )}

      <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.textMute, lineHeight: 1.65 }} data-sku={sku}>
        Need help? Email <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean, textDecoration: 'underline' }}>support@ralphfoulger.com</a> or hit <Link href="/pricing" style={{ color: T.ocean, textDecoration: 'underline' }}>Back to pricing</Link>.
      </div>
    </div>
  );
}

function Notice({ tone, children }: { tone: 'info' | 'error'; children: React.ReactNode }) {
  const color = tone === 'error' ? T.coral : T.ocean;
  const bg = tone === 'error' ? 'rgba(232,93,60,0.06)' : 'rgba(20,131,123,0.06)';
  const border = tone === 'error' ? 'rgba(232,93,60,0.22)' : 'rgba(20,131,123,0.22)';
  return (
    <div style={{ padding: '16px 18px', borderRadius: 10, background: bg, border: `1px solid ${border}`, color, fontSize: 14, fontWeight: 500 }}>
      {children}
    </div>
  );
}

function ConfigurationMissing() {
  return (
    <div style={{ padding: '20px 22px', borderRadius: 10, background: 'rgba(232,93,60,0.06)', border: '1px solid rgba(232,93,60,0.22)', color: T.coralDark, fontSize: 13, lineHeight: 1.65 }}>
      <strong style={{ color: T.coralDark }}>Embedded checkout is not configured yet.</strong><br />
      <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> must be set on the server.
      Email <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean, textDecoration: 'underline' }}>support@ralphfoulger.com</a> &mdash; we&apos;ll get you sorted right away.
    </div>
  );
}
