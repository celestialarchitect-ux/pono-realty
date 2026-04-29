'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CURRICULUM, NATIONAL_TOTAL, STATE_TOTAL } from '@/lib/curriculum';
import { loadProgress, isChapterRead, isQuizPassed, quizzingPct } from '@/lib/progress';
import type { CourseProgress } from '@/lib/progress';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function QuizzesHubPage() {
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  if (!progress) return null;

  const pct = quizzingPct(progress, CURRICULUM.length);
  const passed = Object.values(progress.chapters).filter(c => c.quizCompletedAt).length;
  const readCount = Object.values(progress.chapters).filter(c => c.readCompletedAt).length;
  const allRead = readCount === CURRICULUM.length;
  const nextQuiz = CURRICULUM.find(c => !isQuizPassed(progress, c.slug));

  const nationalChapters = CURRICULUM.filter(c => c.portion === 'national');
  const stateChapters = CURRICULUM.filter(c => c.portion === 'state');

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/quizzes" />
        <main style={{ padding: '48px 32px', maxWidth: 1100, margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>
              Phase 2 · Chapter Quizzes
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
              {pct === 0 ? 'Test what you read.' : pct === 100 ? 'All quizzes passed.' : `${pct}% through.`}
            </h1>
            <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.55, maxWidth: 720 }}>
              One quiz per chapter. 10-12 questions each. 70% to pass. Retake any quiz unlimited times — your best score saves.
            </p>
          </div>

          {!allRead && (
            <div style={{ ...CARD, padding: 24, marginBottom: 24, borderLeft: `3px solid ${T.coral}` }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: T.coralDark, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                Heads up
              </div>
              <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6, marginBottom: 12 }}>
                You&apos;ve read {readCount} of {CURRICULUM.length} chapters. Quizzes work better when you&apos;ve finished all the reading first — but you can take any quiz now if you want.
              </p>
              <Link href="/course" style={{ ...BUTTON_3D.secondary, padding: '10px 18px', fontSize: 13, fontWeight: 600, borderRadius: 8, textDecoration: 'none' }}>
                Back to reading →
              </Link>
            </div>
          )}

          {/* Progress + CTA */}
          <div style={{ ...CARD, padding: 28, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
                Quiz progress
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.text, fontWeight: 700 }}>
                {passed} / {CURRICULUM.length} passed
              </span>
            </div>
            <div style={{ height: 10, background: T.bgRaised, borderRadius: 999, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${T.coral}, ${T.coralDark})`, transition: 'width 0.5s' }} />
            </div>
            {nextQuiz ? (
              <Link href={`/quizzes/${nextQuiz.slug}`} style={{ ...BUTTON_3D.primary, padding: '14px 24px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none', display: 'inline-block' }}>
                {passed === 0 ? `Start Ch. ${nextQuiz.number} quiz →` : `Continue · Ch. ${nextQuiz.number} quiz →`}
              </Link>
            ) : (
              <Link href="/practice" style={{ ...BUTTON_3D.primary, padding: '14px 24px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none', display: 'inline-block' }}>
                All passed · Take final mock exam →
              </Link>
            )}
          </div>

          {/* Quiz lists */}
          <QuizSection
            title="National Quizzes"
            subtitle={`${NATIONAL_TOTAL} of 130 exam questions · 11 quizzes`}
            chapters={nationalChapters}
            progress={progress}
            accent={T.ocean}
          />
          <QuizSection
            title="Hawaii State Quizzes"
            subtitle={`${STATE_TOTAL} of 130 exam questions · 9 quizzes`}
            chapters={stateChapters}
            progress={progress}
            accent={T.coral}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function QuizSection({ title, subtitle, chapters, progress, accent }: { title: string; subtitle: string; chapters: typeof CURRICULUM; progress: CourseProgress; accent: string }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, paddingBottom: 12, borderBottom: `2px solid ${accent}` }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>{title}</h2>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase' }}>{subtitle}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {chapters.map(c => {
          const ch = progress.chapters[c.slug];
          const passed = isQuizPassed(progress, c.slug);
          const attempted = (ch?.quizAttempts ?? 0) > 0;
          return (
            <Link key={c.slug} href={`/quizzes/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ ...CARD, padding: 18, height: '100%', borderLeft: `3px solid ${passed ? T.green : attempted ? accent : T.border}`, background: passed ? 'rgba(45,134,89,0.04)' : T.white }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
                    Ch. {c.number.toString().padStart(2, '0')} · {c.examItems}Q
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: passed ? T.green : attempted ? accent : T.textMute }}>
                    {passed ? `✓ ${ch?.quizScore}%` : attempted ? `${ch?.quizScore}% · retry` : 'Take'}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6, lineHeight: 1.25 }}>{c.title}</h3>
                {ch?.quizAttempts ? (
                  <p style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>{ch.quizAttempts} {ch.quizAttempts === 1 ? 'attempt' : 'attempts'}</p>
                ) : (
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>{c.description.slice(0, 80)}…</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
