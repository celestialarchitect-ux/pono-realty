'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import {
  loadLog,
  progressTo60,
  formatDuration,
  hoursDecimal,
  STATE_LAW_HOURS_REQUIRED,
  type TimeLog,
} from '@/lib/time-tracking';

const BUCKET_LABELS: Record<keyof TimeLog['byBucket'], string> = {
  chapters: 'Curriculum chapters',
  flashcards: 'Flashcards',
  math: 'Math drills',
  glossary: 'Glossary',
  quizzes: 'Chapter quizzes',
  tutor: 'AI Tutor',
  practice: 'Mock exam',
  other: 'Other pages',
};

export default function ProfilePage() {
  const [log, setLog] = useState<TimeLog | null>(null);

  useEffect(() => {
    setLog(loadLog());
    // Refresh every 5s so users see their time tick up while looking at the page
    const id = setInterval(() => setLog(loadLog()), 5000);
    return () => clearInterval(id);
  }, []);

  if (!log) {
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

  const p = progressTo60(log.totalSeconds);
  const buckets = Object.entries(log.byBucket).sort((a, b) => b[1] - a[1]);
  const totalBuckets = buckets.reduce((sum, [, sec]) => sum + sec, 0);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/profile" />

        <main style={{ padding: '48px 32px 64px', maxWidth: 980, margin: '0 auto' }}>
          {/* HEADER CARD */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Your study profile</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 60px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 10 }}>
              {hoursDecimal(log.totalSeconds).toFixed(1)} <em style={{ color: T.ocean, fontStyle: 'italic', fontWeight: 800 }}>study hours</em> logged
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.7, maxWidth: 720, marginBottom: 0 }}>
              Hawaii state law requires <strong style={{ color: T.text }}>{STATE_LAW_HOURS_REQUIRED} hours</strong> of pre-license study before sitting the PSI Salesperson Exam. We track every active minute you spend in the platform &mdash; your mock exam unlocks the moment the counter hits {STATE_LAW_HOURS_REQUIRED}.
            </p>
          </div>

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
                height: '100%',
                width: `${p.pct}%`,
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
                {buckets.map(([key, seconds]) => {
                  if (seconds === 0) return null;
                  const pct = totalBuckets > 0 ? (seconds / totalBuckets) * 100 : 0;
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: T.text, fontWeight: 500 }}>{BUCKET_LABELS[key as keyof TimeLog['byBucket']]}</span>
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

          {/* META + DISCLOSURE */}
          <div style={{ ...CARD, padding: 22, borderLeft: `3px solid ${T.coral}` }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 10 }}>How tracking works</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
                <strong style={{ color: T.text }}>Active time only.</strong> Time accrues only when the tab is visible and you&apos;ve recently interacted (mouse, keyboard, scroll). Leaving the tab open in the background does not count.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
                <strong style={{ color: T.text }}>Per-device for now.</strong> Your study time is stored on this device until you sign in. After full account login is enabled, your time syncs across devices automatically.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
                <strong style={{ color: T.text }}>Hawaii state law.</strong> The {STATE_LAW_HOURS_REQUIRED}-hour pre-license minimum is set by Hawaii REC. Our mock exam unlocks at the same threshold so your practice eligibility mirrors your real exam eligibility.
              </li>
              <li style={{ fontSize: 12, color: T.textMute, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                Device ID: {log.deviceId} · Tracking since {new Date(log.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </li>
            </ul>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
