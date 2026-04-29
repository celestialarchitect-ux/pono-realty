import Link from 'next/link';
import { CURRICULUM, NATIONAL_TOTAL, STATE_TOTAL } from '@/lib/curriculum';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function CurriculumPage() {
  const national = CURRICULUM.filter(c => c.portion === 'national');
  const state = CURRICULUM.filter(c => c.portion === 'state');

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/curriculum" />
        <main style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
              Curriculum · 20 chapters
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
              The complete blueprint.
            </h1>
            <p style={{ fontSize: 17, color: T.textDim, maxWidth: 720, lineHeight: 1.55 }}>
              Eleven national chapters · nine Hawaii state chapters · weighted to match the official PSI exam.
            </p>
          </div>

          <Section title="National Portion" subtitle={`${NATIONAL_TOTAL} questions · 150 min · 70% to pass`} chapters={national} accent={T.ocean} />
          <Section title="Hawaii State Portion" subtitle={`${STATE_TOTAL} questions · 90 min · 70% to pass`} chapters={state} accent={T.coral} />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Section({ title, subtitle, chapters, accent }: { title: string; subtitle: string; chapters: typeof CURRICULUM; accent: string }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, paddingBottom: 12, borderBottom: `2px solid ${accent}` }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>{title}</h2>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase' }}>{subtitle}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {chapters.map((c) => (
          <Link key={c.slug} href={`/chapter/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ ...CARD, padding: 22, height: '100%', borderLeft: `3px solid ${accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
                  Ch. {c.number.toString().padStart(2, '0')}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: accent, fontWeight: 700 }}>{c.examItems} questions</span>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 8, lineHeight: 1.2 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.55, marginBottom: 12 }}>{c.description}</p>
              <div style={{ display: 'flex', gap: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.textMute, letterSpacing: '0.1em' }}>
                <span>~{c.estimatedMinutes} MIN</span>
                <span>·</span>
                <span>{c.keyTerms} KEY TERMS</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
