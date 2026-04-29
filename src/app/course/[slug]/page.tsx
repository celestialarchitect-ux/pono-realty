'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRICULUM, getChapter, neighbors } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { loadProgress, markLessonComplete, getChapterProgress } from '@/lib/progress';
import type { CourseProgress } from '@/lib/progress';
import type { ChapterContent, PracticeQ } from '@/lib/content/national';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

type Lesson = 'overview' | 'concepts' | 'quiz' | 'complete';

export default function CourseLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const meta = getChapter(slug);
  const content: ChapterContent | undefined = [...NATIONAL_CONTENT, ...STATE_CONTENT].find(c => c.slug === slug);
  const [lesson, setLesson] = useState<Lesson>('overview');
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  useEffect(() => {
    const p = loadProgress();
    setProgress(p);
    const ch = getChapterProgress(p, slug);
    // If they've already completed lessons, skip them
    if (ch.lessonsCompleted.includes('overview') && !ch.lessonsCompleted.includes('concepts')) setLesson('concepts');
    else if (ch.lessonsCompleted.includes('concepts') && !ch.lessonsCompleted.includes('quiz')) setLesson('quiz');
  }, [slug]);

  if (!meta || !content || !progress) {
    return <div style={{ padding: 64, textAlign: 'center', fontFamily: 'Inter, sans-serif', color: T.text }}>Loading…</div>;
  }

  const accent = meta.portion === 'national' ? T.ocean : T.coral;
  const { prev, next } = neighbors(slug);

  const completeAndAdvance = (l: 'overview' | 'concepts' | 'quiz', extra?: { quizScore?: number }) => {
    const updated = markLessonComplete(slug, l, extra);
    setProgress(updated);
    if (l === 'overview') setLesson('concepts');
    else if (l === 'concepts') setLesson('quiz');
    else setLesson('complete');
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/course" />
        <main style={{ padding: '32px 32px 48px', maxWidth: 880, margin: '0 auto' }}>
          {/* Top bar with chapter info + back */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <Link href="/course" style={{ color: T.textMute, fontSize: 13, textDecoration: 'none' }}>← All chapters</Link>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>
              Ch. {meta.number.toString().padStart(2, '0')} · {meta.portion} · {meta.examItems}Q
            </div>
          </div>

          {/* Chapter title */}
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.55, fontStyle: 'italic', marginBottom: 32 }}>{content.intro}</p>

          {/* Lesson tabs */}
          <LessonTabs lesson={lesson} setLesson={setLesson} progress={progress} slug={slug} accent={accent} />

          {/* Active lesson */}
          {lesson === 'overview' && <OverviewLesson content={content} onComplete={() => completeAndAdvance('overview')} />}
          {lesson === 'concepts' && <ConceptsLesson content={content} accent={accent} onComplete={() => completeAndAdvance('concepts')} />}
          {lesson === 'quiz' && <QuizLesson content={content} onComplete={(score) => completeAndAdvance('quiz', { quizScore: score })} />}
          {lesson === 'complete' && <CompleteLesson next={next} onContinue={() => next ? router.push(`/course/${next.slug}`) : router.push('/practice')} />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function LessonTabs({ lesson, setLesson, progress, slug, accent }: { lesson: Lesson; setLesson: (l: Lesson) => void; progress: CourseProgress; slug: string; accent: string }) {
  const ch = getChapterProgress(progress, slug);
  const tabs: Array<{ key: Lesson; label: string; num: string }> = [
    { key: 'overview', label: 'Read', num: '01' },
    { key: 'concepts', label: 'Study', num: '02' },
    { key: 'quiz', label: 'Quiz', num: '03' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
      {tabs.map(t => {
        const done = ch.lessonsCompleted.includes(t.key);
        const active = lesson === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setLesson(t.key)}
            style={{
              flex: '1 1 100px', padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
              background: active ? T.surface : done ? 'rgba(45,134,89,0.08)' : T.bgRaised,
              border: `1px solid ${active ? accent : done ? 'rgba(45,134,89,0.3)' : T.border}`,
              color: T.text, fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.16em', color: done ? T.green : T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
              {done ? '✓ Done' : `Lesson ${t.num}`}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function OverviewLesson({ content, onComplete }: { content: ChapterContent; onComplete: () => void }) {
  return (
    <div>
      <div style={{ ...CARD, padding: 32, marginBottom: 24 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
          Lesson 1 · Read the overview
        </div>
        {content.overview.map((p, i) => (
          <p key={i} style={{ fontSize: 16, color: T.textDim, lineHeight: 1.75, marginBottom: 16 }}>{p}</p>
        ))}
      </div>
      <button onClick={onComplete} style={{ ...BUTTON_3D.primary, width: '100%', padding: '16px 22px', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>
        I read it · continue to Lesson 2 →
      </button>
    </div>
  );
}

function ConceptsLesson({ content, accent, onComplete }: { content: ChapterContent; accent: string; onComplete: () => void }) {
  return (
    <div>
      <div style={{ ...CARD, padding: 32, marginBottom: 24 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
          Lesson 2 · Study the key concepts ({content.concepts.length} terms)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {content.concepts.map(k => (
            <div key={k.term} style={{ padding: 16, background: T.bgRaised, borderRadius: 8, borderLeft: `3px solid ${accent}` }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 6 }}>{k.term}</div>
              <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6 }}>{k.body}</p>
              {k.hawaiiNote && <p style={{ fontSize: 12, color: T.coralDark, marginTop: 6, fontStyle: 'italic' }}>Hawaii: {k.hawaiiNote}</p>}
            </div>
          ))}
        </div>
      </div>
      <button onClick={onComplete} style={{ ...BUTTON_3D.primary, width: '100%', padding: '16px 22px', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>
        I&apos;ve studied the concepts · continue to Quiz →
      </button>
    </div>
  );
}

function QuizLesson({ content, onComplete }: { content: ChapterContent; onComplete: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = content.practice.filter((q, i) => answers[i] === q.correctIndex).length;
  const total = content.practice.length;
  const pct = Math.round((correct / total) * 100);

  if (!submitted) {
    return (
      <div>
        <div style={{ ...CARD, padding: 32, marginBottom: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
            Lesson 3 · Chapter quiz · {total} questions · 70% to pass
          </div>
          {content.practice.map((q, i) => (
            <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: i < content.practice.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <p style={{ fontSize: 15, color: T.text, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
                Q{i + 1}. {q.q}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.options.map((o, idx) => {
                  const sel = answers[i] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setAnswers({ ...answers, [i]: idx })}
                      style={{
                        textAlign: 'left', padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                        background: sel ? T.surface : T.bgRaised,
                        border: `2px solid ${sel ? T.ocean : T.border}`,
                        color: T.text, fontSize: 14, fontFamily: 'inherit', lineHeight: 1.4,
                      }}
                    >
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", marginRight: 10, fontSize: 11, color: sel ? T.ocean : T.textMute, fontWeight: 700 }}>
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>{o}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < total} style={{
          ...BUTTON_3D.primary, width: '100%', padding: '16px 22px', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none',
          opacity: Object.keys(answers).length < total ? 0.5 : 1,
        }}>
          Submit quiz ({Object.keys(answers).length}/{total} answered)
        </button>
      </div>
    );
  }

  // Results view
  return (
    <div>
      <div style={{ ...CARD, padding: 32, marginBottom: 24, textAlign: 'center', borderTop: `4px solid ${pct >= 70 ? T.green : T.coral}` }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
          Quiz result
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 72, fontWeight: 900, color: pct >= 70 ? T.green : T.coral, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em' }}>
          {pct}%
        </div>
        <div style={{ fontSize: 14, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
          {correct} of {total} correct · {pct >= 70 ? 'PASSED' : 'BELOW 70%'}
        </div>
      </div>

      <div style={{ ...CARD, padding: 32, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 16 }}>Review your answers</h3>
        {content.practice.map((q, i) => {
          const userAns = answers[i];
          const isCorrect = userAns === q.correctIndex;
          return (
            <div key={i} style={{ marginBottom: 16, padding: 16, background: isCorrect ? 'rgba(45,134,89,0.06)' : 'rgba(193,70,40,0.06)', borderLeft: `3px solid ${isCorrect ? T.green : T.coral}`, borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginBottom: 6 }}>Q{i + 1}. {q.q}</div>
              <div style={{ fontSize: 12, color: T.textMute, marginBottom: 4 }}>Your answer: <b style={{ color: isCorrect ? T.green : T.coralDark }}>{q.options[userAns]}</b></div>
              {!isCorrect && <div style={{ fontSize: 12, color: T.textDim, marginBottom: 6 }}>Correct: <b style={{ color: T.green }}>{q.options[q.correctIndex]}</b></div>}
              <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.55, fontStyle: 'italic', marginTop: 6 }}>{q.explain}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => { setAnswers({}); setSubmitted(false); }} style={{ ...BUTTON_3D.secondary, flex: '1 1 200px', padding: '14px 22px', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
          Retake quiz
        </button>
        <button onClick={() => onComplete(pct)} style={{ ...BUTTON_3D.primary, flex: '1 1 200px', padding: '14px 22px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>
          Mark chapter complete →
        </button>
      </div>
    </div>
  );
}

function CompleteLesson({ next, onContinue }: { next: ReturnType<typeof neighbors>['next']; onContinue: () => void }) {
  return (
    <div style={{ ...CARD, padding: 56, textAlign: 'center', borderTop: `4px solid ${T.green}` }}>
      <div style={{ fontSize: 48, marginBottom: 16, color: T.green }}>✓</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: T.text, letterSpacing: '-0.025em', marginBottom: 16, lineHeight: 1.1 }}>
        Chapter complete.
      </h2>
      <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.55, maxWidth: 480, margin: '0 auto 28px' }}>
        {next ? `Up next: ${next.title}` : `That was the last chapter. Time for the full mock exam.`}
      </p>
      <button onClick={onContinue} style={{ ...BUTTON_3D.primary, padding: '16px 36px', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>
        {next ? `Start ${next.title} →` : 'Take the mock exam →'}
      </button>
    </div>
  );
}
