import Link from 'next/link';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/pricing" />
        <main style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Pricing</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05 }}>
              Less than the textbook. More than the prep kit.
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 48 }}>
            <Tier name="Free" price="$0" sub="forever" perks={['First chapter full', 'Sample flashcards', '10 practice questions', 'Glossary read-only']} cta="Start free" href="/signup" highlight={false} />
            <Tier name="Lifetime" price="$97" sub="one-time" perks={['All 20 chapters', 'Unlimited mock exams', 'Full flashcards (170+)', 'All math drills', 'Progress tracking', 'No expiration']} cta="Get lifetime" href="/signup?plan=lifetime" highlight={true} />
            <Tier name="Pro" price="$197" sub="lifetime" perks={['Everything in Lifetime', 'Hawaii deep-dive videos', 'Weekly group Q&A', 'Pass guarantee*', 'CE credits post-license']} cta="Go Pro" href="/signup?plan=pro" highlight={false} />
          </div>

          <div style={{ ...CARD, padding: 32, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 16, letterSpacing: '-0.02em' }}>How we compare</h2>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.bgRaised }}>
                    <th style={{ textAlign: 'left', padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase' }}>Feature</th>
                    <th style={{ textAlign: 'center', padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700 }}>Ralph&apos;s Lifetime $97</th>
                    <th style={{ textAlign: 'center', padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase' }}>Vitousek $50 Book + $175 Kit</th>
                    <th style={{ textAlign: 'center', padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase' }}>Online Course $300+</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Total cost', '$97', '$225', '$300+'],
                    ['Mobile-first', '✓', '✗', '~'],
                    ['Unlimited mock exams', '✓', '✗ (one-time)', '~'],
                    ['Smart flashcards', '✓', '✗', '✓'],
                    ['Updates with Hawaii law', '✓ live', '✗ printed', '~'],
                    ['Hawaii statutes covered', 'HRS 467, 514B, 521, 508D, 515, 478', 'Yes', 'Varies'],
                    ['Pass guarantee', 'Pro tier', '✗', '✗'],
                    ['Re-take after passing', '✓ no expiration', '✗', '✗'],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: T.text }}>{row[0]}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: T.green, fontWeight: 600 }}>{row[1]}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: T.textDim }}>{row[2]}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: T.textDim }}>{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: T.textMute, fontStyle: 'italic' }}>
            *Pass guarantee details: complete the curriculum, fail twice on PSI, full refund. See Terms.
          </p>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Tier({ name, price, sub, perks, cta, href, highlight }: { name: string; price: string; sub: string; perks: string[]; cta: string; href: string; highlight: boolean }) {
  return (
    <div style={{
      ...CARD, padding: 32,
      border: highlight ? `2px solid ${T.ocean}` : `1px solid ${T.border}`,
      transform: highlight ? 'scale(1.02)' : 'none',
      position: 'relative',
    }}>
      {highlight && (
        <div style={{ position: 'absolute', top: -10, left: 24, padding: '4px 12px', background: T.ocean, color: T.white, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: 999 }}>
          Best value
        </div>
      )}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>{name}</div>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 900, color: T.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{price}</span>
        <span style={{ fontSize: 13, color: T.textMute, marginLeft: 8 }}>{sub}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {perks.map((p) => (
          <li key={p} style={{ display: 'flex', gap: 10, fontSize: 13, color: T.textDim, lineHeight: 1.5 }}>
            <span style={{ color: T.ocean, fontWeight: 700 }}>✓</span><span>{p}</span>
          </li>
        ))}
      </ul>
      <Link href={href} style={{ ...((highlight ? BUTTON_3D.primary : BUTTON_3D.secondary)), display: 'block', textAlign: 'center', padding: '12px 22px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none' }}>
        {cta}
      </Link>
    </div>
  );
}
