'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { sampleMockExam, EXAM_TOTAL, EXAM_NATIONAL, EXAM_STATE, EXAM_PASSING_PCT, EXAM_TIME_MINUTES } from '@/lib/content/exam-bank';
import type { ExamItem } from '@/lib/content/exam-bank';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

type Phase = 'intro' | 'taking' | 'results';

export default function PracticeExam() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<ExamItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_TIME_MINUTES * 60);

  useEffect(() => {
    if (phase !== 'taking') return;
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'taking' && secondsLeft === 0) setPhase('results');
  }, [secondsLeft, phase]);

  const start = () => {
    setQuestions(sampleMockExam(Date.now()));
    setAnswers({});
    setCurrent(0);
    setSecondsLeft(EXAM_TIME_MINUTES * 60);
    setPhase('taking');
  };

  const score = useMemo(() => {
    let nat = 0, st = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) {
        if (q.portion === 'national') nat++;
        else st++;
      }
    });
    const natPct = (nat / EXAM_NATIONAL) * 100;
    const stPct = (st / EXAM_STATE) * 100;
    return { nat, st, natPct, stPct, passed: natPct >= EXAM_PASSING_PCT && stPct >= EXAM_PASSING_PCT };
  }, [answers, questions]);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/practice" />
        <main style={{ padding: '48px 32px', maxWidth: 880, margin: '0 auto' }}>
          {phase === 'intro' && <Intro start={start} />}
          {phase === 'taking' && (
            <TakingExam
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              current={current}
              setCurrent={setCurrent}
              secondsLeft={secondsLeft}
              submit={() => setPhase('results')}
            />
          )}
          {phase === 'results' && <Results score={score} questions={questions} answers={answers} restart={() => setPhase('intro')} />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Intro({ start }: { start: () => void }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Practice Exam</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 24 }}>
        Mock the real thing.
      </h1>
      <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.6, marginBottom: 32 }}>
        {EXAM_TOTAL} questions · {EXAM_NATIONAL} national + {EXAM_STATE} state · {EXAM_TIME_MINUTES} minutes · {EXAM_PASSING_PCT}% to pass each portion.
        Same format as the actual PSI exam.
      </p>
      <div style={{ ...CARD, padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 14 }}>Before you start</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Find a quiet 4-hour block', 'Have a calculator ready (math = 7-10 questions)', 'No reference material — just like the real thing', 'You can navigate freely between questions', 'Your score breaks out national vs state — both must hit 70%'].map(t => (
            <li key={t} style={{ fontSize: 14, color: T.textDim, display: 'flex', gap: 10 }}>
              <span style={{ color: T.ocean, fontWeight: 700 }}>✓</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={start} style={{ ...BUTTON_3D.primary, padding: '18px 40px', fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>
        Start mock exam →
      </button>
    </div>
  );
}

function TakingExam({ questions, answers, setAnswers, current, setCurrent, secondsLeft, submit }: {
  questions: ExamItem[]; answers: Record<number, number>; setAnswers: (a: Record<number, number>) => void;
  current: number; setCurrent: (n: number) => void; secondsLeft: number; submit: () => void;
}) {
  const q = questions[current];
  if (!q) return null;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const answered = Object.keys(answers).length;

  return (
    <div>
      <div style={{ position: 'sticky', top: 80, background: T.bg, padding: '12px 0', marginBottom: 16, borderBottom: `1px solid ${T.border}`, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.text, fontWeight: 600 }}>
          Q{current + 1} / {questions.length} · {answered} answered · <span style={{ color: q.portion === 'state' ? T.coral : T.ocean, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11 }}>{q.portion}</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: secondsLeft < 600 ? T.red : T.text, fontWeight: 700, letterSpacing: '0.04em' }}>
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      <div style={{ ...CARD, padding: 32, marginBottom: 20 }}>
        <p style={{ fontSize: 17, color: T.text, lineHeight: 1.55, marginBottom: 24, fontWeight: 500 }}>{q.q}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((o, idx) => {
            const selected = answers[current] === idx;
            return (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [current]: idx })}
                style={{
                  textAlign: 'left', padding: '14px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                  background: selected ? T.surface : T.bgRaised,
                  border: `2px solid ${selected ? T.ocean : T.border}`,
                  color: T.text, fontSize: 15, lineHeight: 1.4,
                }}
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace", marginRight: 12, fontSize: 12, fontWeight: 700, color: selected ? T.ocean : T.textMute }}>
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} style={{ ...BUTTON_3D.secondary, padding: '12px 20px', fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', opacity: current === 0 ? 0.4 : 1 }}>← Previous</button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(current + 1)} style={{ ...BUTTON_3D.primary, padding: '12px 20px', fontSize: 13, fontWeight: 700, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>Next →</button>
        ) : (
          <button onClick={submit} style={{ ...BUTTON_3D.primary, padding: '12px 24px', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>Submit exam</button>
        )}
      </div>
    </div>
  );
}

function Results({ score, questions, answers, restart }: { score: { nat: number; st: number; natPct: number; stPct: number; passed: boolean }; questions: ExamItem[]; answers: Record<number, number>; restart: () => void }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Result</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(48px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.025em', color: score.passed ? T.green : T.coral, lineHeight: 1.1, marginBottom: 24 }}>
        {score.passed ? 'You passed!' : 'Not yet — review and retry.'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <ScoreCard label="National" pct={score.natPct} correct={score.nat} total={EXAM_NATIONAL} accent={T.ocean} />
        <ScoreCard label="State" pct={score.stPct} correct={score.st} total={EXAM_STATE} accent={T.coral} />
      </div>

      <div style={{ ...CARD, padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 14 }}>Review missed questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {questions.map((q, i) => {
            const userAns = answers[i];
            const correct = userAns === q.correctIndex;
            if (correct) return null;
            return (
              <div key={i} style={{ padding: 16, background: T.bgRaised, borderRadius: 8, borderLeft: `3px solid ${T.coral}` }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 600, marginBottom: 8 }}>Q{i + 1}. {q.q}</div>
                <div style={{ fontSize: 12, color: T.textMute, marginBottom: 6 }}>
                  Your answer: <b style={{ color: T.coralDark }}>{userAns != null ? q.options[userAns] : '(skipped)'}</b>
                </div>
                <div style={{ fontSize: 12, color: T.textDim, marginBottom: 8 }}>
                  Correct: <b style={{ color: T.green }}>{q.options[q.correctIndex]}</b>
                </div>
                <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6, fontStyle: 'italic' }}>{q.explain}</p>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={restart} style={{ ...BUTTON_3D.primary, padding: '14px 28px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>Take another mock exam</button>
    </div>
  );
}

function ScoreCard({ label, pct, correct, total, accent }: { label: string; pct: number; correct: number; total: number; accent: string }) {
  const passed = pct >= EXAM_PASSING_PCT;
  return (
    <div style={{ ...CARD, padding: 24, borderTop: `4px solid ${accent}` }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 900, color: passed ? T.green : T.coral, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {pct.toFixed(0)}%
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textMute, marginTop: 6 }}>
        {correct} / {total} correct · {passed ? 'PASSED' : 'BELOW 70%'}
      </div>
    </div>
  );
}
