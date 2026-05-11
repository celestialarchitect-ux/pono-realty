'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const valid = password.length >= 10 && password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !token || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (body.message) setError(body.message);
        else if (res.status === 503) setError('Password reset is not yet provisioned on this site.');
        else setError('Could not reset your password. The link may have expired.');
        return;
      }
      router.push('/profile');
    } catch {
      setError('Network error. Try again.');
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
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(34px, 4.5vw, 42px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
              Set a new password.
            </h1>
            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.55 }}>
              10+ characters. You&apos;ll be signed in automatically.
            </p>
          </div>

          {!token ? (
            <div style={{ ...CARD, padding: 32 }}>
              <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, marginBottom: 16 }}>
                This page needs a reset token in the URL. Use the link from your reset email, or request a new one below.
              </p>
              <Link href="/forgot-password" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                Request a fresh reset link →
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ ...CARD, padding: 32 }}>
              <Field label="New password (10+ characters)">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="new-password"
                  minLength={10}
                  required
                  style={inputStyle}
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="new-password"
                  minLength={10}
                  required
                  style={inputStyle}
                />
              </Field>

              {password.length > 0 && confirm.length > 0 && password !== confirm && (
                <p style={{ fontSize: 12, color: T.coralDark, marginBottom: 12 }}>Passwords don&apos;t match.</p>
              )}
              {error && (
                <div style={{ background: 'rgba(193,70,40,0.08)', border: `1px solid rgba(193,70,40,0.32)`, color: T.coralDark, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!valid || submitting}
                style={{
                  ...BUTTON_3D.primary,
                  width: '100%',
                  padding: '14px 22px',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  borderRadius: 10,
                  cursor: valid && !submitting ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  border: 'none',
                  opacity: (!valid || submitting) ? 0.5 : 1,
                }}
              >
                {submitting ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )}
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
