'use client';

import { useState, useMemo } from 'react';
import { GLOSSARY } from '@/lib/content/glossary';
import { T, SHADOW_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string>('all');

  const filtered = useMemo(() => {
    return GLOSSARY
      .filter(g => cat === 'all' || g.category === cat)
      .filter(g => !search || g.term.toLowerCase().includes(search.toLowerCase()) || g.definition.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [search, cat]);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/glossary" />
        <main style={{ padding: '48px 32px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>
              Glossary · {GLOSSARY.length} terms
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1 }}>
              Every term that matters.
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{ flex: '1 1 240px', padding: '12px 16px', background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, color: T.text, outline: 'none', fontFamily: 'inherit' }}
            />
            <select value={cat} onChange={e => setCat(e.target.value)} style={{ padding: '12px 16px', background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, color: T.text, fontFamily: 'inherit' }}>
              {['all', 'national', 'hawaii', 'agency', 'finance', 'contracts', 'title', 'math'].map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', marginBottom: 16 }}>
            {filtered.length} of {GLOSSARY.length} terms
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
            {filtered.map(g => (
              <div key={g.term} style={{ ...CARD, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, color: T.text }}>{g.term}</h3>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.16em', color: g.category === 'hawaii' ? T.coral : T.textMute, textTransform: 'uppercase', fontWeight: 700 }}>
                    {g.category}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.55 }}>{g.definition}</p>
                {g.hawaiiNote && <p style={{ fontSize: 11, color: T.coralDark, marginTop: 6, fontStyle: 'italic' }}>HI: {g.hawaiiNote}</p>}
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
