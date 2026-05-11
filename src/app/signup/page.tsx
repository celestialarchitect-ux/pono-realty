'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const valid =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 10;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          email,
          password,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 503) {
          setError('Account system not yet provisioned. Please try again later or email support@ralphfoulger.com.');
        } else if (res.status === 409) {
          setError('An account with that email already exists. Try logging in instead.');
        } else if (body.message) {
          setError(body.message);
        } else if (body.error === 'weak_password') {
          setError('Password must be at least 10 characters.');
        } else if (body.error === 'invalid_email') {
          setError("That doesn't look like a valid email address.");
        } else if (body.error === 'invalid_first_name') {
          setError('First name is required.');
        } else if (body.error === 'invalid_last_name') {
          setError('Last name is required.');
        } else if (body.error === 'invalid_phone') {
          setError('Phone number looks invalid. Leave it blank or enter a real number.');
        } else {
          setError('Could not create your account. Please try again.');
        }
        return;
      }
      router.push('/profile');
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
        <main style={{ padding: '64px 32px', maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
              Create your account.
            </h1>
            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.55 }}>
              Your study hours sync across devices. Mock exam unlocks at the 60-hour Hawaii minimum.
            </p>
          </div>

          <form onSubmit={submit} style={{ ...CARD, padding: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} data-stack-mobile="true">
              <Field label="First name">
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Kalani"
                  autoComplete="given-name"
                  required
                  style={inputStyle}
                />
              </Field>
              <Field label="Last name">
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Kahale"
                  autoComplete="family-name"
                  required
                  style={inputStyle}
                />
              </Field>
            </div>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                required
                style={inputStyle}
              />
            </Field>
            <Field
              label={
                <>
                  Phone <span style={{ color: T.textGhost, textTransform: 'none', letterSpacing: 'normal', fontWeight: 500, marginLeft: 6 }}>(optional)</span>
                </>
              }
            >
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(808) 555-0123"
                autoComplete="tel"
                style={inputStyle}
              />
            </Field>
            <Field label="Password (10+ characters)">
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

            {error && (
              <div
                style={{
                  background: 'rgba(193,70,40,0.08)',
                  border: `1px solid rgba(193,70,40,0.32)`,
                  color: T.coralDark,
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}
              >
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
                opacity: !valid || submitting ? 0.5 : 1,
              }}
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
            <p style={{ fontSize: 12, color: T.textMute, marginTop: 14, textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: T.ocean, textDecoration: 'underline' }}>
                Log in
              </Link>
            </p>
          </form>

          <p style={{ fontSize: 11, color: T.textGhost, marginTop: 18, textAlign: 'center', lineHeight: 1.6 }}>
            By signing up you agree to the{' '}
            <Link href="/policies/terms" style={{ color: T.textMute, textDecoration: 'underline' }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/policies/privacy" style={{ color: T.textMute, textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
            . We store your name, email, hashed password, and (if provided) phone. Phone is optional and is used only for support &amp; account-recovery contact.
          </p>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: T.textMute,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
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
