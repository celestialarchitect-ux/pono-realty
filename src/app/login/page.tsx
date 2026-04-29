'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const submit = () => { if (email.includes('@')) router.push('/dashboard'); };
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '96px 32px', maxWidth: 440, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, color: T.text, textAlign: 'center', marginBottom: 32, letterSpacing: '-0.025em' }}>Welcome back.</h1>
          <div style={{ ...CARD, padding: 28 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={{ width: '100%', padding: '12px 14px', marginBottom: 14, background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
            <button onClick={submit} disabled={!email.includes('@')} style={{ ...BUTTON_3D.primary, width: '100%', padding: '14px 22px', fontSize: 14, fontWeight: 700, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none', opacity: !email.includes('@') ? 0.5 : 1 }}>
              Continue with magic link
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: T.textMute, marginTop: 14 }}>
              New here? <Link href="/signup" style={{ color: T.ocean, textDecoration: 'underline' }}>Sign up free</Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
