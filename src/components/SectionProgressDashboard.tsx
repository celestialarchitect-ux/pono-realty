'use client';

// ABOUTME: Rich per-section progress dashboard on /profile.
// ABOUTME: Pulls /api/me/section-progress and renders one progress row per major section
// ABOUTME: with time spent, sessions, best/avg score, inventory size, and usage rating.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { T, CARD } from '@/lib/theme';
import { formatDuration } from '@/lib/time-tracking';

interface SectionProgress {
  key: string;
  label: string;
  href: string;
  inventory: string;
  totalSeconds: number;
  sessions: number;
  bestScorePct: number | null;
  averageScorePct: number | null;
  attempts: number;
  usagePct: number;
  status: 'not-started' | 'getting-started' | 'making-progress' | 'on-track' | 'mastered';
}

interface DossierResponse {
  sections: SectionProgress[];
  totalUsagePct: number;
  overall: { totalSeconds: number; sessions: number; chapterQuizAttempts: number; mockAttempts: number };
}

const STATUS_LABELS: Record<SectionProgress['status'], string> = {
  'not-started':     'Not started',
  'getting-started': 'Getting started',
  'making-progress': 'Making progress',
  'on-track':        'On track',
  'mastered':        'Mastered',
};

const STATUS_COLORS: Record<SectionProgress['status'], string> = {
  'not-started':     T.textMute,
  'getting-started': T.amber,
  'making-progress': T.amber,
  'on-track':        T.ocean,
  'mastered':        T.green,
};

export function SectionProgressDashboard() {
  const [data, setData] = useState<DossierResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = () => fetch('/api/me/section-progress', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then((d: DossierResponse | null) => { if (mounted && d) setData(d); })
      .catch(() => { /* non-fatal */ });
    load();
    // Refresh every 2 minutes so the card stays current as the student studies.
    const id = setInterval(load, 120_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (!data) return null;

  return (
    <div style={{ ...CARD, padding: 'clamp(20px, 4vw, 28px)', marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
            Your study breakdown
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 800, color: T.text, lineHeight: 1.1, margin: 0 }}>
            Every section. Every metric.
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: T.ocean, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {data.totalUsagePct}%
          </div>
          <div style={{ fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
            Composite usage
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.sections.map(s => <SectionRow key={s.key} s={s} />)}
      </div>

      <div style={{
        marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}`,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, letterSpacing: '0.04em',
      }}>
        <FootStat label="Total time" value={formatDuration(data.overall.totalSeconds, 'short') || '0m'} />
        <FootStat label="Study sessions" value={data.overall.sessions.toString()} />
        <FootStat label="Quizzes taken" value={data.overall.chapterQuizAttempts.toString()} />
        <FootStat label="Mocks taken" value={data.overall.mockAttempts.toString()} />
      </div>
    </div>
  );
}

function SectionRow({ s }: { s: SectionProgress }) {
  const statusColor = STATUS_COLORS[s.status];
  const statusLabel = STATUS_LABELS[s.status];
  // Bar fills from left to right with the section's accent color.
  const barColor =
    s.usagePct >= 80 ? T.green :
    s.usagePct >= 50 ? T.ocean :
    s.usagePct >= 20 ? T.amber :
    s.usagePct > 0   ? T.coral :
                       T.textMute;
  return (
    <Link href={s.href} style={{ textDecoration: 'none' }}>
      <div style={{
        padding: 'clamp(12px, 2.5vw, 16px)',
        borderRadius: 12,
        background: T.bgRaised,
        border: `1px solid ${T.border}`,
        borderLeftWidth: 3, borderLeftColor: statusColor,
        display: 'flex', flexDirection: 'column', gap: 8,
        minWidth: 0,
      }}>
        {/* Top row: label + usage% */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', marginTop: 2 }}>
              {s.inventory}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: statusColor, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {s.usagePct}%
            </div>
            <div style={{ fontSize: 9, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>
              {statusLabel}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: T.bg, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${s.usagePct}%`,
            background: barColor,
            transition: 'width 0.4s ease-out',
          }} />
        </div>

        {/* Metric row — time, sessions, optional scores */}
        <div style={{
          display: 'flex', gap: 'clamp(8px, 2vw, 16px)', flexWrap: 'wrap',
          fontSize: 11, color: T.textDim, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.04em', alignItems: 'baseline',
        }}>
          <Metric label="time" value={formatDuration(s.totalSeconds, 'short') || '0m'} />
          <Metric label="sessions" value={s.sessions.toString()} />
          {s.attempts > 0 && <Metric label="attempts" value={s.attempts.toString()} />}
          {s.bestScorePct !== null && (
            <Metric label="best" value={`${s.bestScorePct}%`} accent={s.bestScorePct >= 70 ? T.green : T.coral} />
          )}
          {s.averageScorePct !== null && s.attempts > 1 && (
            <Metric label="avg" value={`${s.averageScorePct}%`} />
          )}
        </div>
      </div>
    </Link>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span style={{ color: accent ?? T.text, fontWeight: 700 }}>{value}</span>
      <span style={{ color: T.textMute, marginLeft: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
    </span>
  );
}

function FootStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: T.text, fontWeight: 800, fontSize: 14 }}>{value}</div>
      <div style={{ fontSize: 10, marginTop: 2 }}>{label}</div>
    </div>
  );
}
