'use client';

// Admin · Student detail
// One-screen view of everything about a student — identity, access
// status, composite grade (admin sees the raw number too), quiz attempts,
// study time, study plan, payment log.

import { useEffect, useState } from 'react';
import { use as usePromise } from 'react';
import Link from 'next/link';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Icon, type IconKind } from '@/components/Icon';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string | null;
  tier: string;
  isAdmin: boolean;
  roles: string[];
  accessExpiresAt: string | null;
  emailVerified: boolean;
  stripeCustomerId: string | null;
  passedExamAt: string | null;
  createdAt: string;
  lastSeenAt: string;
}
interface GradeData {
  unlocked: boolean;
  letter: string | null;
  trend: 'rising' | 'steady' | 'falling' | null;
  hoursStudied: number;
  hoursToUnlock: number;
  numericPrivate: number | null;
}
interface StudyTimeData {
  totalSeconds: number;
  weekSeconds: number;
  consistencyDays: number;
  byBucket: Record<string, number>;
}
interface QuizAttempt {
  id: string;
  kind: 'chapter' | 'mock';
  context: string;
  scorePct: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
}
interface ChapterScore {
  slug: string;
  number: number;
  title: string;
  portion: 'national' | 'state';
  score: number | null;
  completedAt: string | null;
}
interface Payment {
  id: string;
  stripeSessionId: string;
  amountUsd: number;
  currency: string;
  tier: string;
  status: string;
  createdAt: string;
}
interface Plan {
  goalDate: string;
  includeWeekends: boolean;
  startHour: number;
  createdAt: string;
  updatedAt: string;
}
interface DossierResponse {
  user: UserData;
  grade: GradeData;
  studyTime: StudyTimeData;
  quizAttempts: QuizAttempt[];
  chapterScores: ChapterScore[];
  lastMockScore: number | null;
  payments: Payment[];
  totalRevenueUsd: number;
  plan: Plan | null;
}

const BUCKET_LABELS: Record<string, string> = {
  chapters:   'Curriculum chapters',
  flashcards: 'Flashcards',
  math:       'Math drills',
  glossary:   'Glossary',
  quizzes:    'Chapter quizzes',
  tutor:      'AI Tutor',
  practice:   'Mock exam',
  other:      'Other pages',
};

export default function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [data, setData] = useState<DossierResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/admin/users/${id}`, { cache: 'no-store' });
        if (!r.ok) {
          if (mounted) setError(r.status === 403 ? 'Forbidden' : r.status === 404 ? 'Student not found' : `HTTP ${r.status}`);
          return;
        }
        const j = await r.json();
        if (mounted) setData(j);
      } catch {
        if (mounted) setError('Network error');
      }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => { mounted = false; clearInterval(t); };
  }, [id]);

  if (error) {
    return <Shell><p style={{ color: T.coral, fontSize: 14 }}>{error}</p></Shell>;
  }
  if (!data) {
    return <Shell><p style={{ color: T.textMute }}>Loading student dossier…</p></Shell>;
  }

  const { user, grade, studyTime, quizAttempts, chapterScores, lastMockScore, payments, totalRevenueUsd, plan } = data;
  const totalHours = studyTime.totalSeconds / 3600;
  const weekHours = studyTime.weekSeconds / 3600;

  return (
    <Shell>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/users" style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', textDecoration: 'none' }}>← All students</Link>
      </div>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Student dossier
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 900, color: T.text, letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0 }}>
            {user.name}
          </h1>
          <p style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginTop: 8 }}>
            {user.email}{user.phone ? ` · ${user.phone}` : ''}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <Tag label={`Tier · ${user.tier.toUpperCase()}`} color={user.tier === 'free' ? T.textMute : T.ocean} />
            {user.isAdmin && <Tag label="ADMIN" color={T.coral} />}
            {user.roles.map(r => <Tag key={r} label={r.toUpperCase()} color={T.amber} />)}
            <Tag label={user.emailVerified ? 'Email verified' : 'Email not verified'} color={user.emailVerified ? T.green : T.coral} />
            {user.passedExamAt && <Tag label="Passed PSI" color={T.green} />}
          </div>
        </div>
        <Link href="/admin/users" style={{ ...BUTTON_3D.secondary, padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          Edit tier &amp; roles →
        </Link>
      </div>

      {/* TOP KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
        <Kpi label="Composite grade" value={grade.unlocked ? (grade.letter ?? '—') : '—'} sub={grade.unlocked ? `Server: ${grade.numericPrivate?.toFixed(1) ?? '—'}` : `${grade.hoursToUnlock}h to unlock`} accent={grade.unlocked ? 'ocean' : 'mute'} />
        <Kpi label="Total studied" value={`${totalHours.toFixed(1)} h`} sub="of 60 required" accent={totalHours >= 60 ? 'green' : 'default'} />
        <Kpi label="This week" value={`${weekHours.toFixed(1)} h`} sub={`${studyTime.consistencyDays}/14 study days`} />
        <Kpi label="Quizzes taken" value={quizAttempts.length.toString()} sub={`Last mock: ${lastMockScore ?? '—'}${lastMockScore != null ? '%' : ''}`} />
        <Kpi label="Total paid" value={totalRevenueUsd > 0 ? `$${totalRevenueUsd.toLocaleString()}` : '—'} sub={`${payments.length} payment${payments.length === 1 ? '' : 's'}`} accent={totalRevenueUsd > 0 ? 'coral' : 'mute'} />
      </div>

      {/* ACCESS WINDOW */}
      <div style={{ ...CARD, padding: 22, marginBottom: 22 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Access window</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 16, color: T.text, fontWeight: 600 }}>
            {user.accessExpiresAt
              ? new Date(user.accessExpiresAt) > new Date()
                ? `Active until ${new Date(user.accessExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : `Expired ${new Date(user.accessExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : user.tier === 'solo' || user.isAdmin
                ? 'No expiration (Solo / Admin)'
                : 'Not set'}
          </span>
          <span style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
            Created {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · last seen {relativeAgo(user.lastSeenAt)}
          </span>
        </div>
      </div>

      {/* STUDY PLAN */}
      {plan && (
        <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.ocean }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Study plan</div>
          <div style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>
            Goal: finish by <strong>{new Date(plan.goalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </div>
          <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginTop: 6 }}>
            Daily start: {plan.startHour}:00 · weekends: {plan.includeWeekends ? 'included' : 'excluded'} · plan set {relativeAgo(plan.createdAt)}
          </div>
        </div>
      )}

      {/* STUDY TIME BY SECTION */}
      <div style={{ ...CARD, padding: 24, marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 14 }}>Time by section</h2>
        {Object.values(studyTime.byBucket).every(v => !v) ? (
          <p style={{ fontSize: 13, color: T.textMute }}>No study time logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(studyTime.byBucket).sort((a, b) => b[1] - a[1]).filter(([_k, sec]) => sec > 0).map(([k, sec]) => {
              const pct = studyTime.totalSeconds > 0 ? (sec / studyTime.totalSeconds) * 100 : 0;
              const minutes = Math.floor(sec / 60);
              return (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: T.text, fontWeight: 600 }}>{BUCKET_LABELS[k] ?? k}</span>
                    <span style={{ color: T.textMute, fontFamily: "'JetBrains Mono', monospace" }}>{minutes}m · {pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 5, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: T.ocean, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PER-CHAPTER QUIZ SCORES */}
      <div style={{ ...CARD, padding: 24, marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 14 }}>Chapter quiz scores</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {chapterScores.map(c => {
            const tone = c.score == null ? T.textMute : c.score >= 70 ? T.green : T.coral;
            const portionColor = c.portion === 'state' ? T.coral : T.ocean;
            return (
              <div key={c.slug} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr 80px 80px', gap: 14, alignItems: 'center',
                padding: '10px 14px', borderRadius: 8, background: T.bgRaised, border: `1px solid ${T.border}`,
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: portionColor, color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  {c.number}
                </div>
                <div style={{ minWidth: 0, fontSize: 13, color: T.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.title}
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 800, color: tone }}>
                  {c.score == null ? '—' : `${c.score}%`}
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
                  {c.completedAt ? relativeAgo(c.completedAt) : 'not taken'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUIZ HISTORY */}
      <div style={{ ...CARD, padding: 24, marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 14 }}>All attempts (most recent first)</h2>
        {quizAttempts.length === 0 ? (
          <p style={{ fontSize: 13, color: T.textMute }}>No quiz attempts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {quizAttempts.map(a => {
              const tone = a.scorePct >= 70 ? T.green : T.coral;
              return (
                <div key={a.id} style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr 70px 90px', gap: 12, alignItems: 'center',
                  padding: '10px 14px', borderRadius: 8, background: T.bgRaised, border: `1px solid ${T.border}`,
                  borderLeftWidth: 3, borderLeftColor: tone,
                }}>
                  <div style={{ fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                    {a.kind}
                  </div>
                  <div style={{ minWidth: 0, fontSize: 13, color: T.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.context}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 800, color: tone }}>
                    {a.scorePct}%
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
                    {relativeAgo(a.completedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAYMENT LOG */}
      <div style={{ ...CARD, padding: 24, marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 14 }}>Payments</h2>
        {payments.length === 0 ? (
          <p style={{ fontSize: 13, color: T.textMute }}>No payments on this account (admin grants don&apos;t count).</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {payments.map(p => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 80px 90px', gap: 12, alignItems: 'center',
                padding: '10px 14px', borderRadius: 8, background: T.bgRaised, border: `1px solid ${T.border}`,
              }}>
                <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                  {p.stripeSessionId}
                </div>
                <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: T.text }}>
                  ${p.amountUsd}
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: p.status === 'succeeded' ? T.green : T.coral, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {p.status}
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
                  {relativeAgo(p.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif', flex: 1, minWidth: 0 }}>
      <main style={{ padding: '40px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>{children}</main>
    </div>
  );
}

function Kpi({ label, value, sub, accent = 'default' }: { label: string; value: string; sub: string; accent?: 'default' | 'ocean' | 'coral' | 'green' | 'mute' }) {
  const colors: Record<string, string> = { default: T.text, ocean: T.ocean, coral: T.coral, green: T.green, mute: T.textMute };
  return (
    <div style={{ ...CARD, padding: 18 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: colors[accent], letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{sub}</div>
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ padding: '4px 10px', borderRadius: 999, background: `${color}1f`, color, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, border: `1px solid ${color}33` }}>
      {label}
    </span>
  );
}

function relativeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
