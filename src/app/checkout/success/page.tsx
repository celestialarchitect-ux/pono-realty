'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const sp = useSearchParams();
  const sessionId = sp.get('session_id');
  const [tier, setTier] = useState<string | null>(null);

  // Poll our own /api/auth/me — after the webhook completes, the user.tier
  // will have been updated. Most webhooks fire within a couple seconds.
  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const probe = async () => {
      if (attempts > 10 || !mounted) return;
      attempts++;
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.tier && data.user.tier !== 'free') {
            setTier(data.user.tier);
            return;
          }
        }
      } catch {/* ignore */}
      setTimeout(probe, 1500);
    };
    probe();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '64px 32px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: 40, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.green }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.green, textTransform: 'uppercase', marginBottom: 14, fontWeight: 700 }}>
              Payment received
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
              You&rsquo;re in.
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.7, marginBottom: 24 }}>
              {tier
                ? <>Your <strong style={{ color: T.text, textTransform: 'capitalize' }}>{tier}</strong> tier is active. Your study clock is running &mdash; Hawaii state law requires 60 hours of pre-license study before the PSI exam, and we&rsquo;ll show you exactly where you are at every step.</>
                : <>Your payment is confirmed. Your account is being upgraded right now &mdash; usually within a few seconds.</>}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/profile" style={{ ...BUTTON_3D.primary, padding: '14px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                Open my profile →
              </Link>
              <Link href="/course" style={{ ...BUTTON_3D.secondary, padding: '14px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                Start the curriculum
              </Link>
            </div>

            {sessionId && (
              <p style={{ fontSize: 11, color: T.textGhost, marginTop: 24, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                Reference: {sessionId}
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
