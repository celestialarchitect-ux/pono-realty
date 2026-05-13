// ABOUTME: Branded 404 page — shown for any unknown route in the app.
// ABOUTME: Keeps users in the funnel by linking back to high-intent pages.

import Link from 'next/link';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '96px 32px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.28em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 18 }}>
            404 · Not found
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, letterSpacing: '-0.03em', color: T.text, lineHeight: 0.95, marginBottom: 24 }}>
            That page isn&rsquo;t here.
          </h1>
          <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.6, maxWidth: 540, margin: '0 auto 36px' }}>
            The link might be old, mistyped, or just plain made up. Pick a real destination &mdash; we&apos;ll keep you moving toward your Hawaii real estate license.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            <Link href="/" style={{ ...BUTTON_3D.primary, padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              Home
            </Link>
            <Link href="/free" style={{ ...BUTTON_3D.secondary, padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              Free course
            </Link>
            <Link href="/pricing" style={{ ...BUTTON_3D.secondary, padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              Pricing
            </Link>
            <Link href="/profile" style={{ ...BUTTON_3D.ghost, padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              My profile
            </Link>
          </div>

          <div style={{ ...CARD, padding: 22, textAlign: 'left' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
              Looking for something specific?
            </div>
            <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65, margin: 0 }}>
              The most common destinations: <Link href="/course" style={{ color: T.ocean, textDecoration: 'underline' }}>Curriculum</Link> &middot; <Link href="/practice" style={{ color: T.ocean, textDecoration: 'underline' }}>Mock exam</Link> &middot; <Link href="/quizzes" style={{ color: T.ocean, textDecoration: 'underline' }}>Chapter quizzes</Link> &middot; <Link href="/glossary" style={{ color: T.ocean, textDecoration: 'underline' }}>Glossary</Link>. If you typed a URL and expected something here, email <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean, textDecoration: 'underline' }}>support@ralphfoulger.com</a>.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
