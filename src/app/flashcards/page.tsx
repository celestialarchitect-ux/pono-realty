'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { GLOSSARY } from '@/lib/content/glossary';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

const CATEGORIES = ['all', 'national', 'hawaii', 'agency', 'finance', 'contracts', 'title', 'math'] as const;

export default function FlashcardsPage() {
  const [cat, setCat] = useState<typeof CATEGORIES[number]>('all');
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = useMemo(() => {
    const filtered = cat === 'all' ? [...GLOSSARY] : GLOSSARY.filter(g => g.category === cat);
    return filtered.sort(() => Math.random() - 0.5);
  }, [cat]);

  const card = deck[idx % deck.length];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/flashcards" />
        <main style={{ padding: '48px 32px', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>Flashcards</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1 }}>
              Drill the terms.
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => { setCat(c); setIdx(0); setFlipped(false); }}
                style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: cat === c ? T.ocean : T.bgRaised,
                  color: cat === c ? T.white : T.textDim,
                  border: `1px solid ${cat === c ? T.ocean : T.border}`,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase',
                }}
              >{c}</button>
            ))}
          </div>

          <div
            onClick={() => setFlipped(!flipped)}
            style={{
              ...CARD,
              padding: 48,
              minHeight: 320,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              marginBottom: 20,
              transition: 'transform 0.3s',
              transform: flipped ? 'rotateY(180deg)' : 'none',
              transformStyle: 'preserve-3d',
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 16 }}>
              {flipped ? 'definition' : 'term'} · tap to flip
            </div>
            {!flipped ? (
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, color: T.text, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {card?.term}
              </h2>
            ) : (
              <div style={{ transform: 'rotateY(180deg)' }}>
                <p style={{ fontSize: 18, color: T.textDim, lineHeight: 1.6 }}>{card?.definition}</p>
                {card?.hawaiiNote && <p style={{ marginTop: 12, fontSize: 14, color: T.coralDark, fontStyle: 'italic' }}>Hawaii: {card.hawaiiNote}</p>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }} disabled={idx === 0} style={{ ...BUTTON_3D.secondary, padding: '10px 18px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', opacity: idx === 0 ? 0.4 : 1 }}>← Previous</button>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textMute, fontWeight: 600 }}>
              {idx + 1} / {deck.length}
            </span>
            <button onClick={() => { setIdx((idx + 1) % deck.length); setFlipped(false); }} style={{ ...BUTTON_3D.primary, padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>Next →</button>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
