import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CURRICULUM, getChapter, neighbors } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getChapter(slug);
  if (!meta) notFound();
  const content = [...NATIONAL_CONTENT, ...STATE_CONTENT].find(c => c.slug === slug);
  if (!content) notFound();
  const { prev, next } = neighbors(slug);
  const accent = meta.portion === 'national' ? T.ocean : T.coral;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '48px 32px', maxWidth: 880, margin: '0 auto' }}>
          <Link href="/curriculum" style={{ color: T.textMute, fontSize: 13, textDecoration: 'none' }}>← All chapters</Link>

          <div style={{ marginTop: 24, marginBottom: 40 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>
                Ch. {meta.number.toString().padStart(2, '0')} · {meta.portion}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: T.textMute }}>· {meta.examItems} exam questions</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 16 }}>
              {meta.title}
            </h1>
            <p style={{ fontSize: 19, color: T.textDim, lineHeight: 1.55, fontStyle: 'italic' }}>{content.intro}</p>
          </div>

          <article style={{ ...CARD, padding: 40, marginBottom: 24 }}>
            <SectionH>Overview</SectionH>
            {content.overview.map((p, i) => (
              <p key={i} style={{ fontSize: 16, color: T.textDim, lineHeight: 1.75, marginBottom: 16 }}>{p}</p>
            ))}
          </article>

          <article style={{ ...CARD, padding: 40, marginBottom: 24 }}>
            <SectionH>Key Concepts</SectionH>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {content.concepts.map((k) => (
                <div key={k.term} style={{ padding: 16, background: T.bgRaised, borderRadius: 10, borderLeft: `3px solid ${accent}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, color: T.text }}>{k.term}</span>
                  </div>
                  <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6, marginTop: 6 }}>{k.body}</p>
                  {k.hawaiiNote && (
                    <p style={{ fontSize: 12, color: T.coralDark, marginTop: 8, fontStyle: 'italic' }}>
                      Hawaii note: {k.hawaiiNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article style={{ ...CARD, padding: 40, marginBottom: 32 }}>
            <SectionH>Practice Questions</SectionH>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {content.practice.map((q, i) => (
                <details key={i} style={{ background: T.bgRaised, borderRadius: 10, padding: 18 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: T.text, fontSize: 15, lineHeight: 1.5 }}>
                    Q{i + 1}. {q.q}
                  </summary>
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {q.options.map((o, idx) => (
                        <li key={idx} style={{ padding: '8px 12px', background: idx === q.correctIndex ? 'rgba(45,134,89,0.12)' : T.white, borderRadius: 6, fontSize: 14, color: idx === q.correctIndex ? T.green : T.textDim, fontWeight: idx === q.correctIndex ? 600 : 400 }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", marginRight: 10, fontSize: 11 }}>{['A','B','C','D'][idx]}</span>
                          {o}
                          {idx === q.correctIndex && <span style={{ marginLeft: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' }}>· correct</span>}
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, fontStyle: 'italic' }}>{q.explain}</p>
                  </div>
                </details>
              ))}
            </div>
          </article>

          <nav style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            {prev ? (
              <Link href={`/chapter/${prev.slug}`} style={{ ...BUTTON_3D.secondary, padding: '14px 22px', fontSize: 13, fontWeight: 600, borderRadius: 10, textDecoration: 'none', flex: '1 1 200px' }}>
                ← Ch. {prev.number}: {prev.title}
              </Link>
            ) : <div style={{ flex: '1 1 200px' }} />}
            {next ? (
              <Link href={`/chapter/${next.slug}`} style={{ ...BUTTON_3D.primary, padding: '14px 22px', fontSize: 13, fontWeight: 700, borderRadius: 10, textDecoration: 'none', flex: '1 1 200px', textAlign: 'right' }}>
                Ch. {next.number}: {next.title} →
              </Link>
            ) : <Link href="/practice" style={{ ...BUTTON_3D.primary, padding: '14px 22px', fontSize: 13, fontWeight: 700, borderRadius: 10, textDecoration: 'none', flex: '1 1 200px', textAlign: 'right' }}>Take the mock exam →</Link>}
          </nav>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function SectionH({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 20, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
      {children}
    </h2>
  );
}
