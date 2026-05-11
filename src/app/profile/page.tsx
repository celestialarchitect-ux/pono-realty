'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import {
  loadLog,
  progressTo60,
  formatDuration,
  hoursDecimal,
  STATE_LAW_HOURS_REQUIRED,
} from '@/lib/time-tracking';

const BUCKET_LABELS: Record<string, string> = {
  chapters: 'Curriculum chapters',
  flashcards: 'Flashcards',
  math: 'Math drills',
  glossary: 'Glossary',
  quizzes: 'Chapter quizzes',
  tutor: 'AI Tutor',
  practice: 'Mock exam',
  other: 'Other pages',
};

interface ProfileState {
  totalSeconds: number;
  byBucket: Record<string, number>;
  source: 'server' | 'local';
  user: { name: string; email: string; tier: string; isAdmin: boolean; emailVerified?: boolean } | null;
  deviceId?: string;
  startedAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [state, setState] = useState<ProfileState | null>(null);
  const [authConfigured, setAuthConfigured] = useState<boolean | null>(null);

  // Initial load + 5s refresh
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      // Try server first — and fetch /me in parallel to pick up emailVerified flag
      try {
        const [sumRes, meRes] = await Promise.all([
          fetch('/api/time/summary', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);
        if (sumRes.ok) {
          const data = await sumRes.json();
          const me = meRes.ok ? await meRes.json() : { user: null };
          if (mounted) {
            setState({
              totalSeconds: data.totalSeconds ?? 0,
              byBucket: data.byBucket ?? {},
              source: 'server',
              user: { ...(data.user ?? {}), emailVerified: me.user?.emailVerified ?? false },
            });
            setAuthConfigured(true);
          }
          return;
        }
        if (sumRes.status === 503) setAuthConfigured(false);
      } catch {
        // network blip — fall through to local
      }
      // Server unavailable or unauthenticated — fall back to local
      const log = loadLog();
      if (mounted) {
        setState({
          totalSeconds: log.totalSeconds,
          byBucket: log.byBucket as unknown as Record<string, number>,
          source: 'local',
          user: null,
          deviceId: log.deviceId,
          startedAt: log.startedAt,
        });
      }
    };
    refresh();
    const id = setInterval(refresh, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const onLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {/* ignore */}
    router.refresh();
    router.push('/');
  };

  if (!state) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Backgrounds />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Header active="/profile" />
          <main style={{ padding: '64px 32px', maxWidth: 880, margin: '0 auto', textAlign: 'center', color: T.textMute }}>
            Loading your profile…
          </main>
        </div>
      </div>
    );
  }

  const p = progressTo60(state.totalSeconds);
  const buckets = Object.entries(state.byBucket).sort((a, b) => (b[1] as number) - (a[1] as number));
  const totalBuckets = buckets.reduce((sum, [, sec]) => sum + (sec as number), 0);
  const isServer = state.source === 'server';
  const heading = state.user ? state.user.name : 'Your study profile';

  function VerifyEmailBanner() {
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const onResend = async () => {
      setSending(true);
      setMsg(null);
      try {
        const r = await fetch('/api/auth/resend-verify', { method: 'POST' });
        if (r.ok) setMsg('Sent — check your inbox.');
        else setMsg('Could not send right now.');
      } catch { setMsg('Network error.'); }
      finally { setSending(false); }
    };
    return (
      <div style={{ ...CARD, padding: 18, marginBottom: 24, borderLeft: `3px solid ${T.coral}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, margin: 0, flex: '1 1 320px' }}>
          <strong style={{ color: T.text }}>Verify your email.</strong> We sent a confirmation link to <strong style={{ color: T.text }}>{state?.user?.email}</strong>. Open it to lock in your account. {msg && <span style={{ color: T.ocean, marginLeft: 8 }}>{msg}</span>}
        </p>
        <button
          onClick={onResend}
          disabled={sending}
          style={{ ...BUTTON_3D.secondary, padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: sending ? 0.6 : 1 }}
        >
          {sending ? 'Sending…' : 'Resend link'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/profile" />

        <main style={{ padding: '48px 32px 64px', maxWidth: 980, margin: '0 auto' }}>
          {/* HEADER */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
                {state.user ? `Logged in · ${state.user.email}` : 'Visitor (per-device tracking)'}
                {state.user?.isAdmin && <span style={{ marginLeft: 10, color: T.coral, fontWeight: 700 }}>Admin</span>}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 8 }}>
                {heading}
              </h1>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: T.ocean, letterSpacing: '-0.01em' }}>
                {hoursDecimal(state.totalSeconds).toFixed(1)} study hours logged
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {state.user ? (
                <>
                  {state.user.isAdmin && (
                    <Link href="/admin/users" style={{ ...BUTTON_3D.secondary, padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                      Admin →
                    </Link>
                  )}
                  <button onClick={onLogout} style={{ ...BUTTON_3D.ghost, padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signup" style={{ ...BUTTON_3D.primary, padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                    Create account →
                  </Link>
                  <Link href="/login" style={{ ...BUTTON_3D.secondary, padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* EMAIL VERIFICATION BANNER */}
          {isServer && state.user && state.user.emailVerified === false && (
            <VerifyEmailBanner />
          )}

          {/* AUTH-STATE BANNER */}
          {!isServer && (
            <div style={{ ...CARD, padding: 18, marginBottom: 24, borderLeft: `3px solid ${T.coral}` }}>
              <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65, margin: 0 }}>
                {authConfigured === false ? (
                  <><strong style={{ color: T.text }}>Account system not yet provisioned.</strong> Your study time is being saved to this device only. The admin needs to set <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, background: T.bgRaised, padding: '0 5px', borderRadius: 3 }}>DATABASE_URL</code> + <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, background: T.bgRaised, padding: '0 5px', borderRadius: 3 }}>SESSION_SECRET</code> on the Railway service to enable cross-device sync.</>
                ) : (
                  <><strong style={{ color: T.text }}>Per-device tracking.</strong> Create a free account to sync your study hours across phone, tablet, and laptop. Your existing time stays — it just starts counting toward your real student record.</>
                )}
              </p>
            </div>
          )}

          {/* 60-HOUR PROGRESS */}
          <div style={{ ...CARD, padding: 28, marginBottom: 24, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: p.unlocked ? T.green : T.ocean }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>State law progress</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {p.hours.toFixed(1)} / {STATE_LAW_HOURS_REQUIRED} h
                </div>
              </div>
              <div style={{
                background: p.unlocked ? 'rgba(45,134,89,0.12)' : 'rgba(20,131,123,0.10)',
                color: p.unlocked ? T.green : T.ocean,
                padding: '6px 14px',
                borderRadius: 999,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}>
                {p.unlocked ? '✓ Mock exams unlocked' : `${formatDuration(p.remainingSeconds, 'short')} to unlock`}
              </div>
            </div>
            <div style={{ height: 14, background: T.bgRaised, borderRadius: 999, overflow: 'hidden', border: `1px solid ${T.border}` }}>
              <div style={{
                height: '100%', width: `${p.pct}%`,
                background: p.unlocked
                  ? `linear-gradient(90deg, ${T.green} 0%, #1f6b46 100%)`
                  : `linear-gradient(90deg, ${T.ocean} 0%, ${T.oceanDark} 100%)`,
                transition: 'width 0.4s ease-out',
              }} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {p.unlocked && (
                <Link href="/practice" style={{ ...BUTTON_3D.primary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                  Take your mock exam →
                </Link>
              )}
              {!p.unlocked && (
                <Link href="/course" style={{ ...BUTTON_3D.primary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                  Continue the curriculum →
                </Link>
              )}
              <Link href="/free" style={{ ...BUTTON_3D.secondary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                Free lessons
              </Link>
            </div>
          </div>

          {/* TIME BY SECTION */}
          <div style={{ ...CARD, padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 18 }}>Time by section</h2>
            {totalBuckets === 0 ? (
              <p style={{ fontSize: 14, color: T.textMute, margin: 0 }}>No study time logged yet. Open a curriculum chapter, flashcard deck, or math drill to start the clock.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {buckets.map(([key, secondsRaw]) => {
                  const seconds = secondsRaw as number;
                  if (seconds === 0) return null;
                  const pct = totalBuckets > 0 ? (seconds / totalBuckets) * 100 : 0;
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: T.text, fontWeight: 500 }}>{BUCKET_LABELS[key] ?? key}</span>
                        <span style={{ color: T.textMute, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{formatDuration(seconds, 'short')} · {pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 6, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: T.ocean, transition: 'width 0.4s ease-out' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* META */}
          <div style={{ ...CARD, padding: 22, borderLeft: `3px solid ${T.coral}` }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 10 }}>How tracking works</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
                <strong style={{ color: T.text }}>Active time only.</strong> Time accrues only when the tab is visible and you&apos;ve recently interacted (mouse, keyboard, scroll). Leaving the tab open in the background does not count.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
                <strong style={{ color: T.text }}>{isServer ? 'Cross-device sync.' : 'Per-device for now.'}</strong> {isServer
                  ? 'Your study time is on the academy server and syncs across every device you sign in on. Server is the authoritative source.'
                  : 'Your study time lives on this device. Create an account to keep it across phone, tablet, and laptop.'}
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
                <strong style={{ color: T.text }}>Hawaii state law.</strong> The {STATE_LAW_HOURS_REQUIRED}-hour pre-license minimum is set by Hawaii REC. Our mock exam unlocks at the same threshold so your practice eligibility mirrors your real exam eligibility.
              </li>
              <li style={{ fontSize: 12, color: T.textMute, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                Source: {isServer ? `server (user ${state.user?.email})` : `local device${state.deviceId ? ` (${state.deviceId})` : ''}`}
              </li>
            </ul>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

