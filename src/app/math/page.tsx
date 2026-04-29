'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MATH_PROBLEMS, MATH_CATEGORIES } from '@/lib/content/math';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function MathDrillsPage() {
  const [cat, setCat] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    return cat === 'all' ? MATH_PROBLEMS : MATH_PROBLEMS.filter(p => p.category === cat);
  }, [cat]);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '48px 32px', maxWidth: 880, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>
              Math Drills · {MATH_PROBLEMS.length} worked examples
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
              Real estate math, worked.
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.55 }}>
              Roughly 7-10 questions on the PSI exam are math. Drill until the formulas are automatic.
              Each problem includes the given facts, the formula, the step-by-step solution, and the answer.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            <CatBtn label="all" active={cat} setCat={setCat} />
            {MATH_CATEGORIES.map(c => <CatBtn key={c} label={c} active={cat} setCat={setCat} />)}
            <button
              onClick={() => setShowAll(!showAll)}
              style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: T.bgRaised, border: `1px solid ${T.border}`, color: T.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              {showAll ? 'Hide solutions' : 'Show all solutions'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((p, i) => (
              <details key={p.id} open={showAll} style={{ ...CARD, padding: 24 }}>
                <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
                      Problem {i + 1} · {p.category}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.ocean, fontWeight: 700 }}>tap to expand ▾</span>
                  </div>
                  <p style={{ fontSize: 16, color: T.text, lineHeight: 1.55, fontWeight: 500 }}>{p.question}</p>
                </summary>

                <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>Given</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {p.given.map(g => <li key={g} style={{ fontSize: 13, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>· {g}</li>)}
                    </ul>
                  </div>

                  {p.formula && (
                    <div style={{ marginBottom: 16, padding: 12, background: T.bgRaised, borderRadius: 8, borderLeft: `3px solid ${T.ocean}` }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Formula</div>
                      <div style={{ fontSize: 14, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>{p.formula}</div>
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Steps</div>
                    <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {p.steps.map(s => <li key={s} style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>{s}</li>)}
                    </ol>
                  </div>

                  <div style={{ padding: 12, background: 'rgba(45,134,89,0.08)', border: '1px solid rgba(45,134,89,0.25)', borderRadius: 8 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Answer</div>
                    <div style={{ fontSize: 16, color: T.green, fontWeight: 700 }}>{p.answer}</div>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Link href="/practice" style={{ ...BUTTON_3D.primary, padding: '14px 28px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none' }}>
              Take the mock exam →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function CatBtn({ label, active, setCat }: { label: string; active: string; setCat: (s: string) => void }) {
  const isActive = active === label;
  return (
    <button
      onClick={() => setCat(label)}
      style={{
        padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        background: isActive ? T.ocean : T.bgRaised,
        color: isActive ? T.white : T.textDim,
        border: `1px solid ${isActive ? T.ocean : T.border}`,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase',
      }}
    >{label}</button>
  );
}
