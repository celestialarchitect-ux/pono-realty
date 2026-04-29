'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRICULUM, getChapter, neighbors } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { loadProgress, markQuizComplete, getChapterProgress } from '@/lib/progress';
import type { ChapterContent } from '@/lib/content/national';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function ChapterQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const meta = getChapter(slug);
  const content: ChapterContent | undefined = [...NATIONAL_CONTENT, ...STATE_CONTENT].find(c => c.slug === slug);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, [slug]);

  if (!loaded || !meta || !content) {
    return <div style={{ padding: 64, textAlign: 'center', fontFamily: 'Inter, sans-serif', color: T.text }}>Loading…</div>;
  }

  const accent = meta.portion === 'national' ? T.ocean : T.coral;
  const total = content.practice.length;
  const correct = content.practice.filter((q, i) => answers[i] === q.correctIndex).length;
  const pct = Math.round((correct / total) * 100);
  const { next } = neighbors(slug);

  const finalize = () => {
    markQuizComplete(slug, pct);
    if (next) router.push(`/quizzes/${next.slug}`);
    else router.push('/practice');
  };

  if (!submitted) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Backgrounds />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Header active="/quizzes" />
          <main style={{ padding: '32px 32px 48px', maxWidth: 880, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <Link href="/quizzes" style={{ color: T.textMute, fontSize: 13, textDecoration: 'none' }}>← All quizzes</Link>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>
                Ch. {meta.number.toString().padStart(2, '0')} · Quiz · {total} questions
              </span>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 8 }}>
              {meta.title}
            </h1>
            <p style={{ fontSize: 14, color: T.textMute, marginBottom: 32, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
              70% to pass · unlimited retakes · best score saves
            </p>

            <div style={{ ...CARD, padding: 32, marginBottom: 24 }}>
              {content.practice.map((q, i) => (
                <div key={i} style={{ marginBottom: i < total - 1 ? 24 : 0, paddingBottom: i < total - 1 ? 24 : 0, borderBottom: i < total - 1 ? `1px solid ${T.border}` : 'none' }}>
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
                            border: `2px solid ${sel ? accent : T.border}`,
                            color: T.text, fontSize: 14, fontFamily: 'inherit', lineHeight: 1.4,
                          }}
                        >
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", marginRight: 10, fontSize: 11, color: sel ? accent : T.textMute, fontWeight: 700 }}>
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>{o}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < total}
              style={{
                ...BUTTON_3D.primary, width: '100%', padding: '16px 22px', fontSize: 15, fontWeight: 700,
                letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                opacity: Object.keys(answers).length < total ? 0.5 : 1,
              }}
            >
              Submit quiz · {Object.keys(answers).length} / {total} answered
            </button>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Results view
  const passed = pct >= 70;
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/quizzes" />
        <main style={{ padding: '32px 32px 48px', maxWidth: 880, margin: '0 auto' }}>
          <Link href="/quizzes" style={{ color: T.textMute, fontSize: 13, textDecoration: 'none' }}>← All quizzes</Link>

          <div style={{ ...CARD, padding: 40, marginTop: 16, marginBottom: 24, textAlign: 'center', borderTop: `4px solid ${passed ? T.green : T.coral}` }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
              Ch. {meta.number} · {meta.title}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 80, fontWeight: 900, color: passed ? T.green : T.coral, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em' }}>
              {pct}%
            </div>
            <div style={{ fontSize: 14, color: T.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
              {correct} of {total} correct · {passed ? 'PASSED' : 'BELOW 70% — retry to pass'}
            </div>
          </div>

          <div style={{ ...CARD, padding: 32, marginBottom: 24 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 16 }}>Review your answers</h3>
            {content.practice.map((q, i) => {
              const userAns = answers[i];
              const isCorrect = userAns === q.correctIndex;
              return (
                <div key={i} style={{ marginBottom: 14, padding: 16, background: isCorrect ? 'rgba(45,134,89,0.06)' : 'rgba(193,70,40,0.06)', borderLeft: `3px solid ${isCorrect ? T.green : T.coral}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginBottom: 6 }}>Q{i + 1}. {q.q}</div>
                  <div style={{ fontSize: 12, color: T.textMute, marginBottom: 4 }}>Your answer: <b style={{ color: isCorrect ? T.green : T.coralDark }}>{q.options[userAns]}</b></div>
                  {!isCorrect && <div style={{ fontSize: 12, color: T.textDim, marginBottom: 6 }}>Correct: <b style={{ color: T.green }}>{q.options[q.correctIndex]}</b></div>}
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.55, fontStyle: 'italic', marginTop: 6 }}>{q.explain}</p>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setAnswers({}); setSubmitted(false); }}
              style={{ ...BUTTON_3D.secondary, flex: '1 1 200px', padding: '14px 22px', fontSize: 14, fontWeight: 600, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Retake quiz
            </button>
            <button
              onClick={finalize}
              style={{ ...BUTTON_3D.primary, flex: '1 1 200px', padding: '14px 22px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}
            >
              {next ? `Save & next quiz →` : `Save & take mock exam →`}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
