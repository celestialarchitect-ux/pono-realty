'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const submit = () => {
    if (!email.includes('@') || !name) return;
    try {
      localStorage.setItem('pono-user', JSON.stringify({ email, name, joinedAt: Date.now(), plan: 'free' }));
    } catch {}
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '64px 32px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
              Start studying free.
            </h1>
            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.55 }}>
              First chapter full, sample flashcards, no card needed.
            </p>
          </div>

          <div style={{ ...CARD, padding: 32 }}>
            <Field label="Your name">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Kalani K." style={inputStyle} />
            </Field>
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
            </Field>
            <button onClick={submit} disabled={!email.includes('@') || !name} style={{ ...BUTTON_3D.primary, width: '100%', padding: '14px 22px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none', opacity: (!email.includes('@') || !name) ? 0.5 : 1 }}>
              Create account
            </button>
            <p style={{ fontSize: 12, color: T.textMute, marginTop: 14, textAlign: 'center' }}>
              Already have an account? <Link href="/login" style={{ color: T.ocean, textDecoration: 'underline' }}>Log in</Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: T.white, border: `1px solid ${T.border}`,
  borderRadius: 8, color: T.text, fontSize: 14,
  fontFamily: 'inherit', outline: 'none',
};
