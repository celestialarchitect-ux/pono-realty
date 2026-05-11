'use client';

import Link from 'next/link';
import { useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError('Too many reset requests. Try again in an hour.');
        return;
      }
      if (res.status === 503) {
        setError('Password reset is not yet provisioned on this site.');
        return;
      }
      // Always show generic success — no email enumeration
      setSent(true);
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
          {sent ? (
            <div style={{ ...CARD, padding: 32, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.ocean }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', color: T.text, lineHeight: 1.1, marginBottom: 14 }}>
                Check your inbox.
              </h1>
              <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, marginBottom: 18 }}>
                If an account exists for <strong style={{ color: T.text }}>{email}</strong>, we just sent a password reset link. The link is good for 1 hour. Don&apos;t see it? Check your spam folder.
              </p>
              <Link href="/login" style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(34px, 4.5vw, 42px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
                  Forgot your password?
                </h1>
                <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.55 }}>
                  Drop your email and we&apos;ll send you a reset link.
                </p>
              </div>
              <form onSubmit={submit} style={{ ...CARD, padding: 32 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.textMute, fontWeight: 600, marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                    required
                    style={inputStyle}
                  />
                </div>
                {error && (
                  <div style={{ background: 'rgba(193,70,40,0.08)', border: `1px solid rgba(193,70,40,0.32)`, color: T.coralDark, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!email || submitting}
                  style={{
                    ...BUTTON_3D.primary,
                    width: '100%',
                    padding: '14px 22px',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    borderRadius: 10,
                    cursor: email && !submitting ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    border: 'none',
                    opacity: (!email || submitting) ? 0.5 : 1,
                  }}
                >
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>
                <p style={{ fontSize: 12, color: T.textMute, marginTop: 14, textAlign: 'center' }}>
                  Remembered it? <Link href="/login" style={{ color: T.ocean, textDecoration: 'underline' }}>Log in</Link>
                </p>
              </form>
            </>
          )}
        </main>
        <Footer />
      </div>
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
