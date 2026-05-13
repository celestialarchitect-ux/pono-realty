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
import { MotivationModal } from '@/components/MotivationModal';
import { CURRICULUM } from '@/lib/curriculum';
import { setPin as pwaSetPin, clearPin as pwaClearPin } from '@/components/PWAInstaller';
import { StudyPlanner } from '@/components/StudyPlanner';
import { QuizHistory } from '@/components/QuizHistory';

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
  byPath?: Record<string, number>;
  recentSessions: { path: string; bucket: string; start: string; end: string; seconds: number }[];
  lastActiveAt: string | null;
  lastPath?: string | null;
}
interface MeUser {
  name: string;
  email: string;
  tier: string;
  isAdmin: boolean;
  emailVerified?: boolean;
  accessExpiresAt?: string | null;
  accessMsRemaining?: number | null;
  accessStatus?: 'active' | 'expired_plus' | 'expired_standard' | 'lifetime' | 'none';
}

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
      <MotivationModal />
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

      {/* ACADEMIC GRADE — composite score, locked until 5 study hours */}
      {isServer && user && <GradeCard />}

      {/* ACCESS WINDOW — countdown timer + state-aware CTA */}
      {isServer && user && <AccessWindowCard user={user} />}

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

      {/* STUDY PLANNER — goal-date scheduler with monthly calendar */}
      {isServer && <StudyPlanner />}

      {/* QUIZ HISTORY — drill into past attempts + review wrong answers */}
      {isServer && <QuizHistory />}

      {/* CONTINUE + COURSE PROGRESS */}
      {isServer && <ContinueAndCourseProgress byPath={analytics.byPath ?? {}} lastPath={analytics.lastPath ?? null} />}

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

// Course-player feel on the profile page: surfaces "Continue where you
// left off" + a chapter-by-chapter progress list. Per-chapter status is
// derived from TimeEvent.path totals — no separate "completed" flag yet,
// but minutes-spent is a load-bearing proxy and lines up with the
// 60-hour state-law math.
function ContinueAndCourseProgress({ byPath, lastPath }: { byPath: Record<string, number>; lastPath: string | null }) {
  // The "continue" card prefers the most-recent path. If it's a chapter,
  // we resolve to the chapter title. Otherwise we just label by bucket.
  const continueChapter = lastPath ? CURRICULUM.find(c => lastPath === `/course/${c.slug}` || lastPath.startsWith(`/free/`)) : null;
  const continueHref = lastPath ?? '/course';
  const continueTitle = continueChapter
    ? `Chapter ${continueChapter.number}: ${continueChapter.title}`
    : (lastPath?.startsWith('/free/') ? 'Free Foundation lesson' : 'The curriculum');

  return (
    <>
      {lastPath && (
        <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.ocean, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Continue where you left off</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.2, margin: 0 }}>{continueTitle}</h2>
          </div>
          <Link href={continueHref} style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Resume →
          </Link>
        </div>
      )}

      <div style={{ ...CARD, padding: 28, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>My courses</h2>
          <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            {CURRICULUM.length} chapters · {CURRICULUM.filter(c => c.portion === 'national').length} national · {CURRICULUM.filter(c => c.portion === 'state').length} Hawaii
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CURRICULUM.map(ch => {
            const path = `/course/${ch.slug}`;
            const seconds = byPath[path] ?? 0;
            const minutes = Math.floor(seconds / 60);
            const targetMinutes = ch.estimatedMinutes;
            const pct = Math.min(100, Math.round((minutes / targetMinutes) * 100));
            const started = seconds > 0;
            const completedEnough = minutes >= targetMinutes;
            const portionColor = ch.portion === 'state' ? T.coral : T.ocean;

            return (
              <Link key={ch.slug} href={path} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '32px minmax(0, 1fr) 100px 70px',
                  gap: 14,
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: started ? T.bgRaised : 'transparent',
                  border: `1px solid ${started ? T.border : 'transparent'}`,
                }} data-stack-mobile="true">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: completedEnough ? T.green : (started ? portionColor : T.bgRaised), color: completedEnough || started ? '#fff' : T.textMute, fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                    {completedEnough ? '✓' : ch.number}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.title}</div>
                    <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
                      <span style={{ color: portionColor, fontWeight: 700, textTransform: 'uppercase' }}>{ch.portion}</span>
                      <span style={{ margin: '0 8px', color: T.textGhost }}>·</span>
                      <span>{ch.examItems} exam items</span>
                      <span style={{ margin: '0 8px', color: T.textGhost }}>·</span>
                      <span>~{targetMinutes} min</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textMute, marginBottom: 4, letterSpacing: '0.04em' }}>
                      <span style={{ color: started ? T.text : T.textMute, fontWeight: 700 }}>{minutes}</span> / {targetMinutes} min
                    </div>
                    <div style={{ height: 4, background: T.bgRaised, borderRadius: 999, overflow: 'hidden', border: started ? 'none' : `1px dashed ${T.border}` }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: completedEnough ? T.green : portionColor, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: completedEnough ? T.green : (started ? T.ocean : T.textMute), letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                    {completedEnough ? 'Done' : started ? 'Active' : 'Open'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: T.textGhost, marginTop: 14, lineHeight: 1.55, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
          Progress = active study time on the chapter page. ✓ = you&apos;ve met the suggested time. Hawaii state law: 60 total hours across all chapters before mock-exam eligibility.
        </p>
      </div>
    </>
  );
}

function SettingsCard() {
  const [hapticsOn, setHapticsOn] = useState<boolean | null>(null);
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [pinFormOpen, setPinFormOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSaving, setPinSaving] = useState(false);

  useEffect(() => { setHapticsOn(isHapticsEnabled()); }, []);

  useEffect(() => {
    // Ask the PWAInstaller bridge whether a PIN is already set.
    const onState = (e: Event) => setHasPin(!!(e as CustomEvent).detail.hasPin);
    window.addEventListener('rfa-pin-state', onState as EventListener);
    window.dispatchEvent(new Event('rfa-pin-query'));
    return () => window.removeEventListener('rfa-pin-state', onState as EventListener);
  }, [pinFormOpen]);

  const toggle = () => {
    setHapticsOn(curr => {
      const next = !(curr ?? true);
      setHapticsEnabled(next);
      if (next) tap();   // demo the feedback on enable
      return next;
    });
  };

  const onSavePin = async () => {
    setPinError(null);
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    setPinSaving(true);
    try {
      await pwaSetPin(pinInput);
      setHasPin(true);
      setPinFormOpen(false);
      setPinInput('');
      tap();
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'Could not save PIN.');
    } finally {
      setPinSaving(false);
    }
  };

  const onRemovePin = () => {
    if (typeof window !== 'undefined' && window.confirm('Remove app PIN? The app will launch without the lock screen.')) {
      pwaClearPin();
      setHasPin(false);
      setPinFormOpen(false);
      setPinInput('');
    }
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

      {/* APP PIN — only meaningful on installed PWA, but works in browser too */}
      <div style={{ marginTop: 22, paddingTop: 22, borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 4 }}>
              App PIN {hasPin && <span style={{ color: T.green, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', marginLeft: 8 }}>· SET</span>}
            </div>
            <div style={{ fontSize: 12, color: T.textMute, lineHeight: 1.55 }}>
              A 4-digit PIN that locks the app when you open it from your home screen. Re-locks after 15 minutes in the background. <strong style={{ color: T.textDim }}>Not a replacement for your account password</strong> — it&apos;s a quick privacy gate for shared phones.
            </div>
          </div>
          {hasPin ? (
            <button onClick={onRemovePin} style={{ ...BUTTON_3D.ghost, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit', color: T.coral }}>
              Remove PIN
            </button>
          ) : (
            <button onClick={() => setPinFormOpen(o => !o)} style={{ ...BUTTON_3D.secondary, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>
              {pinFormOpen ? 'Cancel' : 'Set PIN'}
            </button>
          )}
        </div>
        {pinFormOpen && !hasPin && (
          <div style={{ marginTop: 14, padding: '14px 16px', background: T.bgRaised, borderRadius: 10, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              pattern="\d{4}"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                letterSpacing: '0.4em',
                textAlign: 'center',
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.bg,
                color: T.text,
                width: 140,
              }}
            />
            <button onClick={onSavePin} disabled={pinSaving || pinInput.length !== 4} style={{
              ...BUTTON_3D.primary, padding: '10px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
              cursor: (pinSaving || pinInput.length !== 4) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: (pinSaving || pinInput.length !== 4) ? 0.5 : 1,
            }}>
              {pinSaving ? 'Saving…' : 'Save PIN'}
            </button>
            {pinError && <p style={{ fontSize: 12, color: T.coral, margin: 0, flexBasis: '100%' }}>{pinError}</p>}
            <p style={{ fontSize: 11, color: T.textMute, margin: 0, flexBasis: '100%', lineHeight: 1.5 }}>
              Stored locally on this device. Forget your PIN? Clear your site data in browser settings, or simply uninstall + reinstall the app.
            </p>
          </div>
        )}
      </div>

      {/* PWA install nudge */}
      <div style={{ marginTop: 22, paddingTop: 22, borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 4 }}>Save to your home screen</div>
        <div style={{ fontSize: 12, color: T.textMute, lineHeight: 1.6 }}>
          Tap your browser&apos;s share menu and pick <strong style={{ color: T.textDim }}>&ldquo;Add to Home Screen&rdquo;</strong> (iOS Safari) or use the <strong style={{ color: T.textDim }}>install</strong> option in your address bar (Chrome / Edge). The app launches straight into your profile with the RF icon — like a native app, no app store needed. The floating &ldquo;Install&rdquo; pill that appears when the browser detects you&apos;re eligible is the fastest way on Android.
        </div>
      </div>
    </div>
  );
}

// Top-of-profile access banner. Renders one of four states:
//   active           — live countdown, color escalates as expiry approaches
//   expired_plus     — "Buy $249.99 extension" CTA (Plus-only benefit)
//   expired_standard — "Re-enroll at $599" CTA (no extension available)
//   lifetime         — Solo build / admin (no expiry)
//   none             — free user, never paid — gentle pricing nudge
//
// The countdown re-renders every 30 seconds. A second useEffect re-fetches
// /api/auth/me every 60 seconds so that mid-session admin tier changes or
// freshly-completed extension purchases reflect without a page reload.
function AccessWindowCard({ user }: { user: MeUser }) {
  const [tick, setTick] = useState(0);
  const [extendingPending, setExtendingPending] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Derive remaining time from the server-supplied accessExpiresAt so that
  // the timer is monotonic even if the client clock drifts. The `tick`
  // dependency forces a re-render every 30 seconds.
  const status = user.accessStatus ?? 'none';
  const expiresAt = user.accessExpiresAt ? new Date(user.accessExpiresAt) : null;
  const msRemaining = expiresAt ? expiresAt.getTime() - Date.now() : null;
  // Reference the tick state in a no-op expression so the linter doesn't drop
  // it from the dep list — and so the rendered values update every interval.
  void tick;

  const onExtend = async () => {
    setExtendingPending(true);
    setExtendError(null);
    // Embedded Checkout: send the buyer to /checkout/extension, which
    // creates the session in embedded mode and renders the Stripe form
    // inline on our domain.
    window.location.href = '/checkout/extension';
  };

  // LIFETIME (admin or Solo): single calm card, no urgency.
  if (status === 'lifetime') {
    const reason = user.isAdmin ? 'Admin access' : 'Solo Website Build';
    return (
      <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `3px solid ${T.green}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.green, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Access · No expiration</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>{reason}</h3>
        </div>
      </div>
    );
  }

  // NONE — free user. Show a soft enroll prompt, not a doom timer.
  if (status === 'none') {
    return (
      <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `3px solid ${T.ocean}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Free tier · Foundation only</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: T.text, margin: 0, marginBottom: 4 }}>Unlock the full 60-hour course</h3>
          <p style={{ fontSize: 13, color: T.textDim, margin: 0, lineHeight: 1.55 }}>
            Standard is 3 months. Plus is 6 months plus the agent-website bundle on graduation.
          </p>
        </div>
        <Link href="/pricing" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          See pricing →
        </Link>
      </div>
    );
  }

  // EXPIRED PLUS — extension CTA.
  if (status === 'expired_plus') {
    return (
      <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `3px solid ${T.coral}` }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Plus access · Window expired</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0, marginBottom: 8 }}>
          Get another 90 days for $249.99
        </h3>
        <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.65, margin: 0, marginBottom: 14 }}>
          Your six-month Plus window has ended. The <strong style={{ color: T.text }}>$249.99 extension</strong> is a Plus-only benefit that gives you another <strong style={{ color: T.text }}>90 days of full course access</strong> &mdash; a second attempt at finishing the curriculum and passing the PSI exam. Your study progress and the agent-website bundle on graduation are preserved.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={onExtend}
            disabled={extendingPending}
            style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: extendingPending ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: extendingPending ? 0.6 : 1 }}
          >
            {extendingPending ? 'Opening checkout…' : 'Extend my access — $249.99'}
          </button>
          <Link href="/pricing" style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
            Review pricing
          </Link>
        </div>
        {extendError && (
          <p style={{ fontSize: 12, color: T.coral, marginTop: 10, lineHeight: 1.5 }}>{extendError}</p>
        )}
      </div>
    );
  }

  // EXPIRED STANDARD — must re-enroll. No extension available.
  if (status === 'expired_standard') {
    return (
      <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `3px solid ${T.coral}` }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Standard access · Window expired</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0, marginBottom: 8 }}>
          Re-enroll at the full Standard price
        </h3>
        <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.65, margin: 0, marginBottom: 14 }}>
          Your three-month Standard window has ended. Standard does not include the $249.99 extension &mdash; that benefit is reserved for the Plus tier. To continue, re-enroll at <strong style={{ color: T.text }}>$599</strong> for a fresh 3-month window, or upgrade to <strong style={{ color: T.text }}>Plus ($899)</strong> for a 6-month window plus the agent-website bundle on graduation.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/pricing?reason=re_enroll" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
            Re-enroll →
          </Link>
        </div>
      </div>
    );
  }

  // ACTIVE — show the live countdown.
  if (status === 'active' && msRemaining !== null && expiresAt) {
    const days = Math.floor(msRemaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((msRemaining / (60 * 60 * 1000)) % 24);
    const minutes = Math.floor((msRemaining / (60 * 1000)) % 60);

    // Color escalates as expiry approaches.
    const accent =
      days >= 30 ? T.green :
      days >= 7  ? T.ocean :
      days >= 2  ? T.coral :
                   T.coral;
    const isPlus = user.tier === 'plus';
    const totalDays = isPlus ? 180 : 90;
    const dayPct = Math.max(0, Math.min(100, (days / totalDays) * 100));

    return (
      <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `4px solid ${accent}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
              {isPlus ? 'Plus' : 'Standard'} access · Active
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.15 }}>
              {days > 0
                ? <>{days} day{days === 1 ? '' : 's'}<span style={{ color: T.textMute, fontWeight: 700, fontSize: 16, marginLeft: 8 }}>{hours}h {minutes}m</span></>
                : hours > 0
                  ? <>{hours} hour{hours === 1 ? '' : 's'} {minutes} min</>
                  : <>{minutes} minute{minutes === 1 ? '' : 's'} left</>}
            </h3>
            <p style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', margin: '6px 0 0' }}>
              Window ends {expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {expiresAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              of {totalDays} total
            </div>
          </div>
        </div>
        <div style={{ height: 6, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${dayPct}%`, background: accent, transition: 'width 0.4s' }} />
        </div>
        <p style={{ fontSize: 12, color: T.textMute, marginTop: 12, lineHeight: 1.55 }}>
          This is the ceiling, not the expected pace. Hawaii requires 60 study hours total &mdash; full-time students finish in about <strong style={{ color: T.text }}>two weeks</strong>. Use the Study Planner below to pick a goal date and generate a daily schedule.
        </p>
        {days <= 14 && (
          <p style={{ fontSize: 12, color: T.textDim, marginTop: 8, lineHeight: 1.55 }}>
            {isPlus
              ? <>You have less than two weeks of your Plus window left. When this ends you can extend for <strong style={{ color: T.text }}>$249.99 (90 more days)</strong> &mdash; the extension button will appear here automatically.</>
              : <>You have less than two weeks of your Standard window left. Standard doesn&apos;t include an extension &mdash; when this ends, re-enrollment is at the full <strong style={{ color: T.text }}>$599</strong> Standard price.</>}
          </p>
        )}
      </div>
    );
  }

  return null;
}

// Composite-grade card. The formula is intentionally hidden from the
// student (server returns letter + trend only — no numeric). Locked
// until the student has logged the unlock threshold of study hours,
// at which point the letter shows up with a trend arrow next to it.
function GradeCard() {
  interface GradeResponse {
    unlocked: boolean;
    hoursStudied: number;
    hoursToUnlock: number;
    letter: string | null;
    trend: 'rising' | 'steady' | 'falling' | null;
  }
  const [g, setG] = useState<GradeResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch('/api/grade', { cache: 'no-store' });
        if (r.ok && mounted) setG(await r.json() as GradeResponse);
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (!g) return null;

  if (!g.unlocked) {
    // Pre-unlock: pure "calculating" state. Don't reveal the threshold
    // explicitly per Zach — just communicate "we need more data".
    const pct = Math.max(0, Math.min(100, (g.hoursStudied / (g.hoursStudied + g.hoursToUnlock)) * 100));
    return (
      <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `3px solid ${T.textMute}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Academy grade</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>
              Your grade is <em style={{ color: T.ocean, fontStyle: 'italic' }}>updating.</em>
            </h3>
            <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, margin: '8px 0 0', maxWidth: 540 }}>
              Once we have enough study data, a letter grade will appear here. It updates continuously based on what you do.
            </p>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 900, color: T.textGhost, letterSpacing: '-0.04em', lineHeight: 1 }}>
            —
          </div>
        </div>
        <div style={{ height: 4, background: T.bgRaised, borderRadius: 999, overflow: 'hidden', marginTop: 4 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: T.ocean, transition: 'width 0.4s' }} />
        </div>
      </div>
    );
  }

  // Unlocked: show the letter + trend arrow.
  const trendInfo = g.trend === 'rising'  ? { arrow: '↑', label: 'Trending up',   color: T.green }
                  : g.trend === 'falling' ? { arrow: '↓', label: 'Trending down', color: T.coral }
                  :                         { arrow: '→', label: 'Steady',        color: T.textMute };
  const isHigh = ['A+','A','A-','B+'].includes(g.letter ?? '');
  const isLow  = ['D','F'].includes(g.letter ?? '');
  const gradeColor = isHigh ? T.green : isLow ? T.coral : T.text;

  return (
    <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `3px solid ${gradeColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Academy grade</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>
            Where you stand today.
          </h3>
          <p style={{ fontSize: 12, color: T.textMute, marginTop: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', lineHeight: 1.5 }}>
            Updates with every quiz, study session, and mock exam.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 76, fontWeight: 900, color: gradeColor, letterSpacing: '-0.05em', lineHeight: 0.9 }}>
              {g.letter}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ fontSize: 28, color: trendInfo.color, fontWeight: 800, lineHeight: 1 }}>{trendInfo.arrow}</div>
            <div style={{ fontSize: 10, color: trendInfo.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>{trendInfo.label}</div>
          </div>
        </div>
      </div>
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
