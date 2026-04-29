'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CURRICULUM } from '@/lib/curriculum';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function Dashboard() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  useEffect(() => {
    try {
      const u = localStorage.getItem('pono-user');
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '48px 32px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>
              {user?.email || 'Guest'}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 900, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
              Aloha{user?.name ? `, ${user.name}` : ''}.
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, marginTop: 12, lineHeight: 1.55 }}>
              Pick up where you left off — or start with the heaviest exam section.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
            <DashCard href="/curriculum" title="Curriculum" body="20 chapters · weighted to PSI exam" />
            <DashCard href="/practice" title="Mock Exam" body="Timed 130 questions · same as PSI" />
            <DashCard href="/flashcards" title="Flashcards" body="170+ terms · spaced review" />
            <DashCard href="/glossary" title="Glossary" body="Searchable · all categories" />
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 18, letterSpacing: '-0.02em' }}>Continue learning</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {CURRICULUM.slice(0, 6).map(c => (
              <Link key={c.slug} href={`/chapter/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ ...CARD, padding: 18, height: '100%' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', marginBottom: 6 }}>
                    Ch. {c.number.toString().padStart(2, '0')} · {c.examItems}Q
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6, lineHeight: 1.2 }}>{c.title}</h3>
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>{c.description.slice(0, 80)}…</p>
                </div>
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function DashCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ ...CARD, padding: 24, height: '100%' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 8, letterSpacing: '-0.015em' }}>{title}</h3>
        <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.5 }}>{body}</p>
      </div>
    </Link>
  );
}
