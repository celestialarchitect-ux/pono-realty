'use client';

// ABOUTME: Branded route-level error boundary — catches unhandled errors in any page subtree.
// ABOUTME: Logs the error, shows a calm "something went wrong" with retry + email-support paths.

import { useEffect } from 'react';
import Link from 'next/link';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log to the browser console for now. Once we wire a server-side error
  // reporter (Sentry, etc.) we can POST the digest here.
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '96px 32px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.28em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 18 }}>
            Something broke
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 18 }}>
            We hit an error rendering that page.
          </h1>
          <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.65, maxWidth: 560, margin: '0 auto 24px' }}>
            Your study progress is safe &mdash; nothing was lost. Try again. If it keeps happening, email <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean, textDecoration: 'underline' }}>support@ralphfoulger.com</a> with the reference code below.
          </p>

          {error.digest && (
            <div style={{ ...CARD, padding: 14, marginBottom: 28, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textMute, letterSpacing: '0.04em', display: 'inline-block' }}>
              Ref: {error.digest}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{ ...BUTTON_3D.primary, padding: '14px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}
            >
              Try again
            </button>
            <Link href="/" style={{ ...BUTTON_3D.secondary, padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              Home
            </Link>
            <Link href="/profile" style={{ ...BUTTON_3D.ghost, padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              My profile
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
