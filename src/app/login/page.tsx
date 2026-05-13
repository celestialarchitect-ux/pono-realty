'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { PasswordInput } from '@/components/PasswordInput';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/profile';
  // Only allow same-app paths as the post-login redirect target.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/profile';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 'checking' = pre-render session lookup in flight; the form is hidden
  // entirely so a logged-in user never sees the form (and never gets stuck
  // submitting it). 'form' = render the actual login form.
  // 'redirecting' = session found, router.replace already firing, freeze UI.
  const [phase, setPhase] = useState<'checking' | 'form' | 'redirecting'>('checking');

  // If a live session already exists, skip the form entirely and drop the
  // user on the dashboard (or wherever ?next pointed). Prevents the
  // "I clicked login but I was already logged in" friction.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d?.user) {
          setPhase('redirecting');
          router.replace(safeNext);
        } else {
          setPhase('form');
        }
      })
      .catch(() => { if (!cancelled) setPhase('form'); });
    return () => { cancelled = true; };
  }, [router, safeNext]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Belt-and-suspenders: any failure path re-checks the session. If
        // the user was actually already authed (e.g., they had a tab open,
        // session cookie just got refreshed, browser re-sent old form),
        // redirect them anyway instead of leaving them stuck on the error.
        const meRes = await fetch('/api/auth/me', { cache: 'no-store' }).catch(() => null);
        const meBody = meRes ? await meRes.json().catch(() => null) : null;
        if (meBody?.user) {
          setPhase('redirecting');
          router.replace(safeNext);
          return;
        }
        if (res.status === 503) {
          setError('Account system not yet provisioned. Please try again later.');
        } else if (res.status === 429) {
          setError(body.message ?? 'Too many login attempts. Try again in 15 minutes.');
        } else {
          setError(body.message ?? 'Email or password is incorrect.');
        }
        return;
      }
      setPhase('redirecting');
      router.push(safeNext);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '64px 32px', maxWidth: 480, margin: '0 auto' }}>
          {phase !== 'form' && (
            <div style={{ ...CARD, padding: 48, textAlign: 'center' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
                {phase === 'checking' ? 'Checking your session…' : 'Already signed in'}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.02em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
                {phase === 'checking' ? 'One moment…' : 'Welcome back.'}
              </h1>
              <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6, margin: 0 }}>
                {phase === 'checking' ? 'Looking up your account.' : 'Taking you to your profile…'}
              </p>
              {phase === 'redirecting' && (
                <Link href={safeNext} style={{ ...BUTTON_3D.primary, display: 'inline-flex', padding: '12px 22px', borderRadius: 10, marginTop: 18, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                  Continue to {safeNext === '/profile' ? 'profile' : 'page'} →
                </Link>
              )}
            </div>
          )}
          {phase === 'form' && (<>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
              Welcome back.
            </h1>
            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.55 }}>
              Log in to continue your study clock.
            </p>
          </div>

          <form onSubmit={submit} style={{ ...CARD, padding: 32 }}>
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" required style={inputStyle} />
            </Field>
            <Field label="Password">
              <PasswordInput value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" required style={inputStyle} />
            </Field>

            {error && (
              <div style={{ background: 'rgba(193,70,40,0.08)', border: `1px solid rgba(193,70,40,0.32)`, color: T.coralDark, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!email || !password || submitting}
              style={{
                ...BUTTON_3D.primary,
                width: '100%',
                padding: '14px 22px',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.04em',
                borderRadius: 10,
                cursor: (email && password && !submitting) ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                border: 'none',
                opacity: (!email || !password || submitting) ? 0.5 : 1,
              }}
            >
              {submitting ? 'Signing in…' : 'Log in'}
            </button>
            <p style={{ fontSize: 12, color: T.textMute, marginTop: 14, textAlign: 'center' }}>
              No account yet? <Link href="/signup" style={{ color: T.ocean, textDecoration: 'underline' }}>Create one</Link>
              <span style={{ margin: '0 8px', color: T.textGhost }}>·</span>
              <Link href="/forgot-password" style={{ color: T.ocean, textDecoration: 'underline' }}>Forgot password?</Link>
            </p>
          </form>
          </>)}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.textMute, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.white,
  color: T.text,
  fontFamily: 'inherit',
  fontSize: 16,
  lineHeight: 1.4,
};
