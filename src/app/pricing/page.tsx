import Link from 'next/link';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/pricing" />
        <main style={{ padding: '64px 32px', maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Open access</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
              Free for everyone.
            </h1>
            <p style={{ fontSize: 18, color: T.textDim, lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
              All 20 chapters, every practice question, full glossary, unlimited mock exams. No payment, no card, no catch.
            </p>
          </div>

          <div style={{ ...CARD, padding: 40, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 20, letterSpacing: '-0.02em' }}>What you get — all of it, free</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {[
                ['20 chapters', 'Mapped 1:1 to PSI Hawaii blueprint'],
                ['11 national + 9 state', 'Weighted to actual question counts'],
                ['Practice questions', 'Per chapter with explanations'],
                ['Mock exams', 'Timed, 130 Q, scored by portion'],
                ['Flashcards', 'Tap-to-flip, category filters'],
                ['Glossary', 'Searchable, Hawaii-specific flagged'],
                ['Hawaii statutes', 'HRS 467, 514B, 521, 508D, 515, 478, 514E, 507, 667, 449'],
                ['No expiration', 'Study now, retake later'],
              ].map(([t, b]) => (
                <div key={t} style={{ display: 'flex', gap: 10, padding: 14, background: T.bgRaised, borderRadius: 8 }}>
                  <span style={{ color: T.ocean, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 2 }}>{t}</div>
                    <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>{b}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...CARD, padding: 32, marginBottom: 32, borderLeft: `3px solid ${T.coral}` }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 12 }}>What this is NOT</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Not the 60-hour course.</b> Hawaii requires the Salesperson Pre-Licensing Course at a REC-approved school for license eligibility. This academy is a study supplement.
              </li>
              <li style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Not legal advice.</b> Statutes change. Verify against current Hawaii Revised Statutes and REC rules before relying on anything for a real transaction.
              </li>
              <li style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Not affiliated with Hawaii REC, PSI, or any official body.</b> Independent study aid built on the public PSI Content Outline.
              </li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/course" style={{ ...BUTTON_3D.primary, padding: '16px 36px', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 12, textDecoration: 'none' }}>
              Start learning →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
