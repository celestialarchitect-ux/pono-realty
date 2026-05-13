'use client';

// Public certificate-verification page. Anyone — sponsoring broker, Hawaii
// REC, the student showing their phone — can paste in the RFA-XXXXXXXXX
// code from any course-completion certificate and confirm it's real.

import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

interface VerifyResponse {
  valid: boolean;
  name?: string;
  completedAt?: string;
  code?: string;
  school?: string;
  validityYears?: number;
  message?: string;
}

export default function VerifyCertificatePage() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  // Read ?code= on mount so a deep link from a printed cert works.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = new URL(window.location.href).searchParams.get('code');
    if (initial) {
      setCode(initial);
      // Auto-verify
      doVerify(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doVerify = async (raw: string) => {
    const trimmed = raw.trim().toUpperCase();
    if (!trimmed) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch(`/api/verify-certificate?code=${encodeURIComponent(trimmed)}`, { cache: 'no-store' });
      const j = await r.json() as VerifyResponse;
      setResult(j);
    } catch {
      setResult({ valid: false, message: 'Network error.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '64px 32px', maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.24em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
              Verify a certificate
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 12 }}>
              Is this certificate real?
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.65, maxWidth: 540, margin: '0 auto' }}>
              Paste the <strong style={{ color: T.text }}>RFA-XXXXXXXXX</strong> verification ID from the bottom-right corner of any Ralph Foulger Academy certificate. We&rsquo;ll confirm in one second.
            </p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); doVerify(code); }}
            style={{ ...CARD, padding: 24, marginBottom: 22 }}
          >
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              Verification ID
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="RFA-XXXXXXXXX"
                autoComplete="off"
                spellCheck={false}
                style={{
                  flex: '1 1 240px',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: T.bgRaised,
                  color: T.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              />
              <button
                type="submit"
                disabled={busy || code.trim().length === 0}
                style={{
                  ...BUTTON_3D.primary,
                  padding: '14px 28px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: busy ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  border: 'none',
                  opacity: busy || code.trim().length === 0 ? 0.5 : 1,
                }}>
                {busy ? 'Checking…' : 'Verify'}
              </button>
            </div>
          </form>

          {result && (
            <div style={{
              ...CARD,
              padding: 28,
              borderLeftWidth: 4,
              borderLeftStyle: 'solid',
              borderLeftColor: result.valid ? T.green : T.coral,
            }}>
              {result.valid ? (
                <>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.green, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
                    ✓ Authentic
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: T.text, lineHeight: 1.15, marginBottom: 10 }}>
                    {result.name}
                  </h2>
                  <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, marginBottom: 8 }}>
                    Completed the 60-hour Hawaii pre-license course at <strong style={{ color: T.text }}>{result.school}</strong> on <strong style={{ color: T.text }}>{result.completedAt ? new Date(result.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</strong>.
                  </p>
                  <p style={{ fontSize: 13, color: T.textMute, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                    Code: <strong style={{ color: T.text }}>{result.code}</strong> · Valid for {result.validityYears ?? 2} years from completion per Hawaii REC rules.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
                    Not authentic
                  </div>
                  <p style={{ fontSize: 15, color: T.text, lineHeight: 1.7, marginBottom: 14, fontWeight: 600 }}>
                    {result.message ?? 'We could not verify that code.'}
                  </p>
                  <p style={{ fontSize: 13, color: T.textMute, lineHeight: 1.65, margin: 0 }}>
                    Double-check the code format (<code style={{ background: T.bgRaised, padding: '2px 6px', borderRadius: 4 }}>RFA-</code> prefix followed by 4-12 letters/digits). If it still doesn&rsquo;t verify, email <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean, textDecoration: 'underline' }}>support@ralphfoulger.com</a> with a copy of the certificate; we&rsquo;ll investigate.
                  </p>
                </>
              )}
            </div>
          )}

          <p style={{ fontSize: 12, color: T.textMute, lineHeight: 1.65, marginTop: 22, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
            We return only the student&rsquo;s name + completion date. No email, no phone, no other personal data.
          </p>
        </main>
        <Footer />
      </div>
    </div>
  );
}
