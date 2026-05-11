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
import { isHapticsEnabled, setHapticsEnabled, tap } from '@/lib/haptics';

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

interface AnalyticsRes {
  totalSeconds: number;
  todaySeconds: number;
  streakDays: number;
  last30: { date: string; seconds: number }[];
  byBucket: Record<string, number>;
  recentSessions: { path: string; bucket: string; start: string; end: string; seconds: number }[];
  lastActiveAt: string | null;
}
interface MeUser { name: string; email: string; tier: string; isAdmin: boolean; emailVerified?: boolean }

interface ProfileState {
  source: 'server' | 'local';
  user: MeUser | null;
  analytics: AnalyticsRes;
  deviceId?: string;
  startedAt?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [state, setState] = useState<ProfileState | null>(null);
  const [unprovisioned, setUnprovisioned] = useState(false);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const [aRes, mRes] = await Promise.all([
          fetch('/api/analytics/me', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);
        if (aRes.ok) {
          const a = (await aRes.json()) as AnalyticsRes;
          const m = mRes.ok ? await mRes.json() : { user: null };
          if (mounted) {
            setState({
              source: 'server',
              user: m.user ?? null,
              analytics: a,
            });
          }
          return;
        }
        if (aRes.status === 503) setUnprovisioned(true);
      } catch {/* fall through */}
      const log = loadLog();
      if (mounted) {
        const localAnalytics: AnalyticsRes = {
          totalSeconds: log.totalSeconds,
          todaySeconds: 0,
          streakDays: 0,
          last30: [],
          byBucket: log.byBucket as unknown as Record<string, number>,
          recentSessions: [],
          lastActiveAt: log.lastSavedAt,
        };
        setState({
          source: 'local',
          user: null,
          analytics: localAnalytics,
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
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {/* ignore */}
    router.refresh();
    router.push('/');
  };

  if (!state) {
    return (
      <Shell><p style={{ color: T.textMute, textAlign: 'center' }}>Loading your profile…</p></Shell>
    );
  }

  const { analytics, user, source } = state;
  const isServer = source === 'server';
  const p = progressTo60(analytics.totalSeconds);
  const peakDay = Math.max(1, ...analytics.last30.map(d => d.seconds));
  const last7 = analytics.last30.slice(-7);

  return (
    <Shell>
      {/* HEADER */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
            {user ? `Logged in · ${user.email}` : (unprovisioned ? 'Visitor · per-device' : 'Visitor (per-device tracking)')}
            {user?.isAdmin && <span style={{ marginLeft: 10, color: T.coral, fontWeight: 700 }}>Admin</span>}
            {user?.tier && user.tier !== 'free' && <span style={{ marginLeft: 10, color: T.ocean, fontWeight: 700, textTransform: 'uppercase' }}>{user.tier}</span>}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 8 }}>
            {user ? user.name : 'Your study profile'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {user ? (
            <>
              {user.isAdmin && (
                <Link href="/admin" style={{ ...BUTTON_3D.secondary, padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
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

      {/* VERIFY EMAIL BANNER */}
      {isServer && user && user.emailVerified === false && <VerifyEmailBanner email={user.email} />}

      {/* SOURCE BANNER WHEN NOT SERVER */}
      {!isServer && (
        <div style={{ ...CARD, padding: 18, marginBottom: 24, borderLeft: `3px solid ${T.coral}` }}>
          <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: T.text }}>Per-device tracking.</strong> Your study time is saved on this device only. Create an account to sync across phone, tablet, and laptop — your existing time stays.
          </p>
        </div>
      )}

      {/* TOP STAT ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 22 }} data-stack-mobile="true">
        <Stat label="Today" value={formatDuration(analytics.todaySeconds, 'short') || '0m'} sub="active study" accent="ocean" live />
        <Stat label="Total studied" value={`${hoursDecimal(analytics.totalSeconds).toFixed(1)} h`} sub={`${STATE_LAW_HOURS_REQUIRED} h required`} />
        <Stat label="Streak" value={`${analytics.streakDays} day${analytics.streakDays === 1 ? '' : 's'}`} sub="consecutive" accent={analytics.streakDays > 0 ? 'ocean' : 'mute'} />
        <Stat label="Status" value={p.unlocked ? 'Eligible' : `${(60 - p.hours).toFixed(1)} h to go`} sub={p.unlocked ? 'Mock exam unlocked' : 'state-law gate'} accent={p.unlocked ? 'green' : 'coral'} />
      </div>

      {/* 60-HOUR PROGRESS */}
      <div style={{ ...CARD, padding: 24, marginBottom: 22, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: p.unlocked ? T.green : T.ocean }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Hawaii state-law progress</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: T.text, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {p.hours.toFixed(1)} / {STATE_LAW_HOURS_REQUIRED} hours
            </div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textMute, letterSpacing: '0.1em' }}>{p.pct.toFixed(1)}%</div>
        </div>
        <div style={{ height: 14, background: T.bgRaised, borderRadius: 999, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <div style={{
            height: '100%', width: `${p.pct}%`,
            background: p.unlocked ? `linear-gradient(90deg, ${T.green} 0%, #1f6b46 100%)` : `linear-gradient(90deg, ${T.ocean} 0%, ${T.oceanDark} 100%)`,
            transition: 'width 0.4s ease-out',
          }} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {p.unlocked ? (
            <Link href="/practice" style={{ ...BUTTON_3D.primary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              Take your mock exam →
            </Link>
          ) : (
            <Link href="/course" style={{ ...BUTTON_3D.primary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
              Continue the curriculum →
            </Link>
          )}
          <Link href="/free" style={{ ...BUTTON_3D.secondary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
            Free lessons
          </Link>
        </div>
      </div>

      {/* TWO-COL: WEEK BAR + TIME BY SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 22 }} data-stack-mobile="true">
        <div style={{ ...CARD, padding: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 14 }}>Last 7 days</h2>
          {last7.length === 0 ? (
            <p style={{ fontSize: 13, color: T.textMute, margin: 0 }}>No study time logged this week yet.</p>
          ) : (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
              {last7.map(d => {
                const pct = (d.seconds / peakDay) * 100;
                const isToday = d.date === new Date().toISOString().slice(0, 10);
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }} title={`${d.date}: ${formatDuration(d.seconds, 'short') || '0'}`}>
                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${pct}%`, background: isToday ? T.ocean : T.oceanDark, borderRadius: '4px 4px 0 0', minHeight: d.seconds > 0 ? 3 : 0, opacity: isToday ? 1 : 0.7 }} />
                    </div>
                    <div style={{ fontSize: 10, color: isToday ? T.ocean : T.textMute, fontFamily: "'JetBrains Mono', monospace", fontWeight: isToday ? 700 : 500, letterSpacing: '0.04em' }}>
                      {new Date(d.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' })[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ ...CARD, padding: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 14 }}>Time by section</h2>
          {Object.values(analytics.byBucket).every(v => !v) ? (
            <p style={{ fontSize: 13, color: T.textMute, margin: 0 }}>No study time yet. Open a chapter to start the clock.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(analytics.byBucket).sort((a, b) => b[1] - a[1]).map(([k, sec]) => {
                if (!sec) return null;
                const pct = analytics.totalSeconds > 0 ? (sec / analytics.totalSeconds) * 100 : 0;
                return (
                  <div key={k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: T.text, fontWeight: 500 }}>{BUCKET_LABELS[k] ?? k}</span>
                      <span style={{ color: T.textMute, fontFamily: "'JetBrains Mono', monospace" }}>{formatDuration(sec, 'short')} · {pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 5, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: T.ocean, transition: 'width 0.4s ease-out' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RECENT SESSIONS */}
      {isServer && analytics.recentSessions.length > 0 && (
        <div style={{ ...CARD, padding: 24, marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 14 }}>Recent study sessions</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analytics.recentSessions.map((s, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '6px 0', borderBottom: i < analytics.recentSessions.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ color: T.text, fontWeight: 500 }}>{BUCKET_LABELS[s.bucket] ?? s.bucket}</span>
                  <span style={{ color: T.textMute, marginLeft: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{s.path}</span>
                </div>
                <div style={{ textAlign: 'right', color: T.textMute, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                  <span style={{ color: T.ocean, fontWeight: 700 }}>{formatDuration(s.seconds, 'short')}</span>
                  <span style={{ marginLeft: 10 }}>{new Date(s.start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SETTINGS */}
      <SettingsCard />

      {/* META */}
      <div style={{ ...CARD, padding: 22, borderLeft: `3px solid ${T.coral}` }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 10 }}>How real-time tracking works</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
            <strong style={{ color: T.text }}>Engagement only.</strong> Time accrues only when you actually interact &mdash; scrolling, typing, clicking, or actively listening to audio. Mouse-hovering alone does not count, and the clock goes idle after 60 seconds of no engagement.
          </li>
          <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
            <strong style={{ color: T.text }}>Tab must be visible.</strong> Switching tabs or minimizing the window stops the timer. Hidden tabs cannot accrue study hours.
          </li>
          <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
            <strong style={{ color: T.text }}>Daily cap of 12 hours.</strong> Honest study almost never exceeds this. Hitting the cap pauses tracking until midnight UTC. {isServer ? 'Server-enforced.' : 'Client cap when not signed in.'}
          </li>
          <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
            <strong style={{ color: T.text }}>{isServer ? 'Server-side source of truth.' : 'Per-device for now.'}</strong> {isServer
              ? 'Your hours sync across every device you sign in on.'
              : 'Create an account to sync across phone, tablet, and laptop.'}
          </li>
        </ul>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/profile" />
        <main style={{ padding: '48px 32px 64px', maxWidth: 980, margin: '0 auto' }}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent = 'default', live = false }: { label: string; value: string; sub: string; accent?: 'default' | 'ocean' | 'coral' | 'green' | 'mute'; live?: boolean }) {
  const accentColor: Record<string, string> = {
    default: T.text,
    ocean: T.ocean,
    coral: T.coral,
    green: T.green,
    mute: T.textMute,
  };
  return (
    <div style={{ ...CARD, padding: '18px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
        <span>{label}</span>
        {live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'rfs-pulse 1.5s infinite' }} />}
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: accentColor[accent], letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{sub}</div>
      <style>{`@keyframes rfs-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }`}</style>
    </div>
  );
}

function SettingsCard() {
  const [hapticsOn, setHapticsOn] = useState<boolean | null>(null);
  useEffect(() => { setHapticsOn(isHapticsEnabled()); }, []);
  const toggle = () => {
    setHapticsOn(curr => {
      const next = !(curr ?? true);
      setHapticsEnabled(next);
      if (next) tap();   // demo the feedback on enable
      return next;
    });
  };
  if (hapticsOn === null) return null;
  return (
    <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `3px solid ${T.ocean}` }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 6 }}>Settings</h3>
      <p style={{ fontSize: 12, color: T.textMute, lineHeight: 1.6, marginBottom: 14 }}>
        Stored on this device. Sign in on another device to set it there too.
      </p>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, cursor: 'pointer' }}>
        <div>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 2 }}>Haptic feedback</div>
          <div style={{ fontSize: 12, color: T.textMute, lineHeight: 1.5 }}>
            A subtle tap + tone on study-page interactions. Vibrates on mobile, soft click on desktop.
          </div>
        </div>
        <span
          role="switch"
          aria-checked={hapticsOn}
          onClick={toggle}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
          tabIndex={0}
          style={{
            position: 'relative',
            width: 46, height: 26,
            borderRadius: 999,
            background: hapticsOn ? T.ocean : T.bgRaised,
            border: `1px solid ${hapticsOn ? T.oceanDark : T.border}`,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.18s',
          }}
        >
          <span style={{
            position: 'absolute',
            top: 2,
            left: hapticsOn ? 22 : 2,
            width: 20, height: 20,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.18s',
            boxShadow: '0 1px 3px rgba(45,55,72,0.2)',
          }} />
        </span>
      </label>
    </div>
  );
}

function VerifyEmailBanner({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const onResend = async () => {
    setSending(true); setMsg(null);
    try {
      const r = await fetch('/api/auth/resend-verify', { method: 'POST' });
      setMsg(r.ok ? 'Sent — check your inbox.' : 'Could not send right now.');
    } catch { setMsg('Network error.'); }
    finally { setSending(false); }
  };
  return (
    <div style={{ ...CARD, padding: 18, marginBottom: 24, borderLeft: `3px solid ${T.coral}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, margin: 0, flex: '1 1 320px' }}>
        <strong style={{ color: T.text }}>Verify your email.</strong> We sent a confirmation link to <strong style={{ color: T.text }}>{email}</strong>. {msg && <span style={{ color: T.ocean, marginLeft: 8 }}>{msg}</span>}
      </p>
      <button onClick={onResend} disabled={sending} style={{ ...BUTTON_3D.secondary, padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', cursor: sending ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: sending ? 0.6 : 1 }}>
        {sending ? 'Sending…' : 'Resend link'}
      </button>
    </div>
  );
}
