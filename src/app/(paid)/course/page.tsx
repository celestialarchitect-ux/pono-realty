'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CURRICULUM, NATIONAL_TOTAL, STATE_TOTAL } from '@/lib/curriculum';
import { loadProgress, readingPct, quizzingPct, isChapterRead, isQuizPassed } from '@/lib/progress';
import type { CourseProgress } from '@/lib/progress';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function CoursePage() {
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  if (!progress) return null;

  const readPct = readingPct(progress, CURRICULUM.length);
  const quizPct = quizzingPct(progress, CURRICULUM.length);
  const readCompleted = Object.values(progress.chapters).filter(c => c.readCompletedAt).length;
  const quizCompleted = Object.values(progress.chapters).filter(c => c.quizCompletedAt).length;
  const nextRead = CURRICULUM.find(c => !isChapterRead(progress, c.slug));
  const allRead = readCompleted === CURRICULUM.length;

  const nationalChapters = CURRICULUM.filter(c => c.portion === 'national');
  const stateChapters = CURRICULUM.filter(c => c.portion === 'state');

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/course" />
        <main style={{ padding: '48px 32px', maxWidth: 1100, margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>
              Hawaii Real Estate · The Course
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
              {readPct === 0 ? 'Start with reading.' : allRead ? 'Reading done. On to quizzes.' : `${readPct}% read.`}
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.55, maxWidth: 720 }}>
              Two phases. Phase 1: read all 20 chapters straight through. Phase 2: take a quiz for each chapter once you&apos;ve read everything. Then the full mock exam.
            </p>
          </div>

          {/* Two-phase progress display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 32 }}>
            <PhaseCard
              num="01"
              label="Phase 1 · Reading"
              progress={readPct}
              completed={readCompleted}
              total={CURRICULUM.length}
              accent={T.ocean}
              cta={nextRead ? { label: readCompleted === 0 ? 'Start reading' : 'Continue reading', href: `/course/${nextRead.slug}` } : { label: 'All chapters read ✓', href: '/quizzes' }}
              status={allRead ? 'complete' : readCompleted > 0 ? 'in-progress' : 'not-started'}
            />
            <PhaseCard
              num="02"
              label="Phase 2 · Quizzes"
              progress={quizPct}
              completed={quizCompleted}
              total={CURRICULUM.length}
              accent={T.coral}
              cta={allRead ? { label: quizCompleted === 0 ? 'Start quizzes' : 'Continue quizzes', href: '/quizzes' } : { label: 'Finish reading first', href: '#', disabled: true }}
              status={!allRead ? 'locked' : quizCompleted === CURRICULUM.length ? 'complete' : quizCompleted > 0 ? 'in-progress' : 'not-started'}
            />
          </div>

          {/* National reading list */}
          <ReadingSection
            title="National Portion · Reading"
            subtitle={`${NATIONAL_TOTAL} of 130 exam questions · 11 chapters`}
            chapters={nationalChapters}
            progress={progress}
            accent={T.ocean}
          />
          <ReadingSection
            title="Hawaii State Portion · Reading"
            subtitle={`${STATE_TOTAL} of 130 exam questions · 9 chapters`}
            chapters={stateChapters}
            progress={progress}
            accent={T.coral}
          />

          {/* Mock exam CTA */}
          <div style={{ ...CARD, padding: 40, textAlign: 'center', marginTop: 40, borderTop: `4px solid ${T.ocean}`, opacity: quizPct < 100 ? 0.6 : 1 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
              Final phase · Full mock exam
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: T.text, letterSpacing: '-0.025em', marginBottom: 12 }}>
              {quizPct < 100 ? 'Unlocked after all chapter quizzes pass' : 'Ready when you are.'}
            </h2>
            <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.6, maxWidth: 600, margin: '0 auto 24px' }}>
              130 questions · 80 national + 50 state · 240 minutes · scored by portion · same format as the actual licensing exam.
            </p>
            <Link href="/practice" style={{ ...BUTTON_3D.primary, padding: '14px 32px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none' }}>
              {quizPct < 100 ? 'Skip ahead to mock exam →' : 'Take the mock exam →'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function PhaseCard({ num, label, progress, completed, total, accent, cta, status }: {
  num: string;
  label: string;
  progress: number;
  completed: number;
  total: number;
  accent: string;
  cta: { label: string; href: string; disabled?: boolean };
  status: 'not-started' | 'in-progress' | 'complete' | 'locked';
}) {
  const statusBadge = {
    'not-started': { text: 'Ready', color: T.textMute, bg: T.bgRaised },
    'in-progress': { text: 'In progress', color: accent, bg: 'rgba(20,131,123,0.08)' },
    'complete': { text: '✓ Complete', color: T.green, bg: 'rgba(45,134,89,0.1)' },
    'locked': { text: 'Locked', color: T.textGhost, bg: T.bgRaised },
  }[status];

  return (
    <div style={{ ...CARD, padding: 28, borderTop: `4px solid ${accent}`, opacity: status === 'locked' ? 0.6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: T.bgRaised, letterSpacing: '-0.02em', lineHeight: 1 }}>{num}</span>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: statusBadge.bg, color: statusBadge.color, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {statusBadge.text}
        </span>
      </div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 12, letterSpacing: '-0.015em' }}>
        {label}
      </h3>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, letterSpacing: '0.1em' }}>
          <span>{completed} / {total}</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 8, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: accent, transition: 'width 0.5s' }} />
        </div>
      </div>
      {cta.disabled ? (
        <div style={{ ...BUTTON_3D.secondary, padding: '12px 18px', fontSize: 13, fontWeight: 600, borderRadius: 10, textAlign: 'center', opacity: 0.5, cursor: 'not-allowed' }}>
          {cta.label}
        </div>
      ) : (
        <Link href={cta.href} style={{ ...BUTTON_3D.primary, padding: '12px 18px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function ReadingSection({ title, subtitle, chapters, progress, accent }: { title: string; subtitle: string; chapters: typeof CURRICULUM; progress: CourseProgress; accent: string }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, paddingBottom: 12, borderBottom: `2px solid ${accent}` }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>{title}</h2>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase' }}>{subtitle}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {chapters.map(c => {
          const read = isChapterRead(progress, c.slug);
          return (
            <Link key={c.slug} href={`/course/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ ...CARD, padding: 18, height: '100%', borderLeft: `3px solid ${read ? T.green : T.border}`, background: read ? 'rgba(45,134,89,0.04)' : T.white }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
                    Ch. {c.number.toString().padStart(2, '0')} · {c.examItems}Q
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: read ? T.green : T.textMute }}>
                    {read ? '✓ Read' : 'Read'}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6, lineHeight: 1.25 }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>{c.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
