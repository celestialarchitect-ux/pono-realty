'use client';

// Stripe Embedded Checkout return URL. The session ID is in the query
// string; we fetch the session status from our server and route to /profile
// on success or back to /pricing on failure. Webhook handles the actual
// tier provisioning — this page is just the user-facing transition.

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const sessionId = sp.get('session_id');
  const kind = sp.get('kind') ?? '';
  const [status, setStatus] = useState<'pending' | 'paid' | 'failed'>('pending');

  useEffect(() => {
    if (!sessionId) {
      setStatus('failed');
      return;
    }
    let cancelled = false;
    const check = async () => {
      try {
        const r = await fetch(`/api/checkout/session-status?id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
        const j = await r.json();
        if (cancelled) return;
        if (j.status === 'complete' || j.payment_status === 'paid') {
          setStatus('paid');
          setTimeout(() => router.replace('/profile?welcome=1'), 1800);
        } else if (j.status === 'open') {
          // Stripe says the session is still open — bounce them back to checkout.
          router.replace('/pricing');
        } else {
          setStatus('failed');
        }
      } catch {
        if (!cancelled) setStatus('failed');
      }
    };
    check();
    return () => { cancelled = true; };
  }, [sessionId, router]);

  return (
    <Shell>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        {status === 'pending' && (
          <>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
              Confirming payment
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 14 }}>
              One moment…
            </h1>
            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.65 }}>
              We&apos;re confirming the charge with Stripe. You&apos;ll be redirected automatically.
            </p>
          </>
        )}
        {status === 'paid' && (
          <>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.green, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
              {kind === 'extension' ? 'Extension applied' : 'You\'re in'}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 18 }}>
              Welcome to the <em style={{ color: T.ocean, fontStyle: 'italic' }}>Academy.</em>
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.65, marginBottom: 22 }}>
              Your access is active. We&apos;ve sent a receipt to your email and you&apos;ll be on your profile in a moment.
            </p>
            <Link href="/profile?welcome=1" style={{ ...BUTTON_3D.primary, padding: '14px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', display: 'inline-flex' }}>
              Open my profile →
            </Link>
          </>
        )}
        {status === 'failed' && (
          <div style={{ ...CARD, padding: 28, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral, textAlign: 'left' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 10 }}>
              We couldn&apos;t confirm that payment.
            </h1>
            <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.65, marginBottom: 16 }}>
              The Stripe session didn&apos;t come back as paid. If you were charged, please email <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean }}>support@ralphfoulger.com</a> with your receipt — we&apos;ll sort it within the hour.
            </p>
            <Link href="/pricing" style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              Back to pricing
            </Link>
          </div>
        )}
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
        <main style={{ padding: '96px 32px', maxWidth: 1180, margin: '0 auto' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
