'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CURRICULUM, NATIONAL_TOTAL, STATE_TOTAL } from '@/lib/curriculum';
import { loadProgress, overallPct, chapterPct, isChapterComplete } from '@/lib/progress';
import type { CourseProgress } from '@/lib/progress';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function CoursePage() {
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  if (!progress) return null;

  const overall = overallPct(progress, CURRICULUM.length);
  const completed = Object.values(progress.chapters).filter(c => c.completedAt).length;
  const inProgress = Object.values(progress.chapters).filter(c => c.startedAt && !c.completedAt).length;
  const lastChapter = progress.lastChapter ? CURRICULUM.find(c => c.slug === progress.lastChapter) : null;
  const nextChapter = CURRICULUM.find(c => !isChapterComplete(progress, c.slug));

  const nationalChapters = CURRICULUM.filter(c => c.portion === 'national');
  const stateChapters = CURRICULUM.filter(c => c.portion === 'state');

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/course" />
        <main style={{ padding: '48px 32px', maxWidth: 1100, margin: '0 auto' }}>
          {/* Hero with progress */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>
              Hawaii Real Estate · The Course
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
              {overall === 0 ? 'Start your journey.' : overall === 100 ? 'You finished the course.' : `${overall}% through.`}
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.55, maxWidth: 720, marginBottom: 24 }}>
              20 chapters. Each chapter has three lessons: read the overview, study the key concepts, then pass the chapter quiz. Complete all three to mark a chapter done.
            </p>

            {/* Progress bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase' }}>
                <span>Course progress</span>
                <span>{completed} / {CURRICULUM.length} chapters</span>
              </div>
              <div style={{ height: 12, background: T.bgRaised, borderRadius: 999, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                <div style={{ height: '100%', width: `${overall}%`, background: `linear-gradient(90deg, ${T.ocean}, ${T.oceanDark})`, transition: 'width 0.5s' }} />
              </div>
            </div>

            {/* Continue / start CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {nextChapter && (
                <Link href={`/course/${nextChapter.slug}`} style={{ ...BUTTON_3D.primary, padding: '14px 28px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none' }}>
                  {lastChapter && lastChapter.slug === nextChapter.slug ? 'Continue' : completed === 0 ? 'Start Chapter 1' : 'Next chapter'}: {nextChapter.title} →
                </Link>
              )}
              {!nextChapter && (
                <Link href="/practice" style={{ ...BUTTON_3D.primary, padding: '14px 28px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none' }}>
                  Take the final mock exam →
                </Link>
              )}
              <Link href="/practice" style={{ ...BUTTON_3D.secondary, padding: '14px 28px', fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none' }}>
                Skip to mock exam
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 40 }}>
            <Stat label="Completed" value={completed.toString()} sub="of 20 chapters" />
            <Stat label="In progress" value={inProgress.toString()} sub="started, not done" />
            <Stat label="Time invested" value={`${Math.round((Date.now() - progress.enrolledAt) / 86400000)}d`} sub="since enrollment" />
            <Stat label="Quiz attempts" value={Object.values(progress.chapters).reduce((s, c) => s + c.quizAttempts, 0).toString()} sub="across all chapters" />
          </div>

          {/* National section */}
          <Section
            title="National Portion"
            subtitle={`${NATIONAL_TOTAL} of 130 exam questions · 70% to pass · 150 minutes`}
            chapters={nationalChapters}
            progress={progress}
            accent={T.ocean}
          />
          <Section
            title="Hawaii State Portion"
            subtitle={`${STATE_TOTAL} of 130 exam questions · 70% to pass · 90 minutes`}
            chapters={stateChapters}
            progress={progress}
            accent={T.coral}
          />

          {/* Final exam CTA */}
          <div style={{ ...CARD, padding: 40, textAlign: 'center', marginTop: 40, borderTop: `4px solid ${T.ocean}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
              Final exam
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: T.text, letterSpacing: '-0.025em', marginBottom: 12 }}>
              The full PSI mock exam.
            </h2>
            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.6, maxWidth: 600, margin: '0 auto 24px' }}>
              130 questions · 80 national + 50 state · 240 minutes · scored by portion · same format as the actual licensing exam.
              Take it after completing the course. Aim for 85%+ consistent before your real test.
            </p>
            <Link href="/practice" style={{ ...BUTTON_3D.primary, padding: '14px 32px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none' }}>
              Start mock exam →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Section({ title, subtitle, chapters, progress, accent }: { title: string; subtitle: string; chapters: typeof CURRICULUM; progress: CourseProgress; accent: string }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, paddingBottom: 12, borderBottom: `2px solid ${accent}` }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>{title}</h2>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase' }}>{subtitle}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {chapters.map(c => {
          const pct = chapterPct(progress, c.slug);
          const ch = progress.chapters[c.slug];
          const status = ch?.completedAt ? 'complete' : ch?.startedAt ? 'in-progress' : 'not-started';
          return (
            <Link key={c.slug} href={`/course/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ ...CARD, padding: 20, height: '100%', borderLeft: `3px solid ${status === 'complete' ? T.green : status === 'in-progress' ? accent : T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
                    Ch. {c.number.toString().padStart(2, '0')} · {c.examItems}Q
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: status === 'complete' ? T.green : status === 'in-progress' ? accent : T.textMute }}>
                    {status === 'complete' ? '✓ Done' : status === 'in-progress' ? `${pct}%` : 'Start'}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8, lineHeight: 1.25 }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.55, marginBottom: 12 }}>{c.description}</p>
                <div style={{ height: 4, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: status === 'complete' ? T.green : accent, transition: 'width 0.3s' }} />
                </div>
                {ch?.quizScore != null && (
                  <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.textMute, letterSpacing: '0.1em' }}>
                    Best quiz: {ch.quizScore}%
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ ...CARD, padding: 16 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', color: T.text, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textMute }}>{sub}</div>
    </div>
  );
}
