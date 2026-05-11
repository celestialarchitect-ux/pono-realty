'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const sp = useSearchParams();
  const status = sp.get('status') ?? 'pending';
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  // Configurations per status. "pending" is shown when the user lands without
  // a status (just signed up) — they should check their inbox.
  const config = {
    pending: {
      title: 'Check your email.',
      body: 'We just sent a verification link to your inbox. Open it to confirm your address — your study clock keeps running either way.',
      tone: T.ocean,
      showResend: true,
    },
    ok: {
      title: 'Email verified.',
      body: 'Your account is fully set up. Your study time is now syncing across every device you sign in on.',
      tone: T.green,
      showResend: false,
    },
    invalid: {
      title: 'This link expired.',
      body: 'Verification links are good for 24 hours. Request a fresh one and we\'ll send it right out.',
      tone: T.coral,
      showResend: true,
    },
    missing: {
      title: 'Something is missing.',
      body: 'No verification token was found in this link. Try the one in your email again, or request a new one below.',
      tone: T.coral,
      showResend: true,
    },
    unavailable: {
      title: 'Verification is offline.',
      body: 'The email-verification system isn\'t fully provisioned yet. You can still use the academy — your study hours are saving normally.',
      tone: T.coral,
      showResend: false,
    },
  }[status] ?? {
    title: 'Check your email.',
    body: 'We just sent a verification link.',
    tone: T.ocean,
    showResend: true,
  };

  const onResend = async () => {
    setResending(true);
    setResendMsg(null);
    try {
      const res = await fetch('/api/auth/resend-verify', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setResendMsg(data.alreadyVerified ? 'Your email is already verified.' : 'New link sent — check your inbox.');
      } else if (res.status === 401) {
        setResendMsg('Please log in first, then click resend.');
      } else if (res.status === 503) {
        setResendMsg('Verification is not yet provisioned on this site.');
      } else {
        setResendMsg('Could not send the link. Try again in a minute.');
      }
    } catch {
      setResendMsg('Network error. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '64px 32px', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: 36, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: config.tone }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: config.tone, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
              Email verification
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', color: T.text, lineHeight: 1.1, marginBottom: 14 }}>
              {config.title}
            </h1>
            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, marginBottom: 20 }}>
              {config.body}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/profile" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                {status === 'ok' ? 'Open my profile →' : 'Continue to my profile'}
              </Link>
              {config.showResend && (
                <button onClick={onResend} disabled={resending} style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: resending ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: resending ? 0.6 : 1 }}>
                  {resending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
            {resendMsg && (
              <p style={{ fontSize: 13, color: T.textDim, marginTop: 16, padding: 12, background: T.bgRaised, borderRadius: 8 }}>
                {resendMsg}
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
