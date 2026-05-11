'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  sampleMockExam,
  EXAM_TOTAL,
  EXAM_NATIONAL,
  EXAM_STATE,
  EXAM_PASSING_PCT,
  EXAM_TIME_MINUTES,
  DIFFICULTY_META,
  type ExamDifficulty,
} from '@/lib/content/exam-bank';
import type { ExamItem } from '@/lib/content/exam-bank';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import {
  loadLog,
  progressTo60,
  hasUnlockOverride,
  formatDuration,
  STATE_LAW_HOURS_REQUIRED,
} from '@/lib/time-tracking';

type Phase = 'gate' | 'pick' | 'taking' | 'results';

const DIFFICULTY_ORDER: ExamDifficulty[] = ['standard', 'hard', 'gnarly'];

export default function PracticeExam() {
  const [phase, setPhase] = useState<Phase>('gate');
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('standard');
  const [questions, setQuestions] = useState<ExamItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_TIME_MINUTES * 60);
  const [unlocked, setUnlocked] = useState(false);
  const [studiedSeconds, setStudiedSeconds] = useState(0);

  // Check the 60-hour gate on mount — prefer server data when authenticated,
  // fall back to localStorage. Server is authoritative once auth is wired.
  useEffect(() => {
    const probe = async () => {
      let totalSeconds = 0;
      try {
        const res = await fetch('/api/time/summary', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          totalSeconds = data.totalSeconds ?? 0;
        } else {
          totalSeconds = loadLog().totalSeconds;
        }
      } catch {
        totalSeconds = loadLog().totalSeconds;
      }
      const p = progressTo60(totalSeconds);
      setStudiedSeconds(totalSeconds);
      if (p.unlocked || hasUnlockOverride()) {
        setUnlocked(true);
        setPhase('pick');
      }
    };
    probe();
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'taking') return;
    const id = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (phase === 'taking' && secondsLeft === 0) setPhase('results');
  }, [secondsLeft, phase]);

  const start = (d: ExamDifficulty) => {
    setDifficulty(d);
    setQuestions(sampleMockExam(Date.now(), d));
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
        <main style={{ padding: '48px 32px', maxWidth: 980, margin: '0 auto' }}>
          {phase === 'gate' && !unlocked && <Gate studiedSeconds={studiedSeconds} />}
          {phase === 'pick' && <PickDifficulty onStart={start} studiedSeconds={studiedSeconds} />}
          {phase === 'taking' && (
            <TakingExam
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              current={current}
              setCurrent={setCurrent}
              secondsLeft={secondsLeft}
              difficulty={difficulty}
              submit={() => setPhase('results')}
            />
          )}
          {phase === 'results' && (
            <Results
              score={score}
              questions={questions}
              answers={answers}
              difficulty={difficulty}
              restart={() => setPhase('pick')}
            />
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function Gate({ studiedSeconds }: { studiedSeconds: number }) {
  const p = progressTo60(studiedSeconds);
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 12 }}>
        Mock exams locked
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 60px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 20 }}>
        Hawaii law: <em style={{ color: T.ocean, fontStyle: 'italic' }}>60 study hours first.</em>
      </h1>
      <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.7, marginBottom: 28, maxWidth: 720 }}>
        Hawaii state law requires every pre-license candidate to complete <strong style={{ color: T.text }}>60 hours of approved coursework</strong> before sitting the PSI Salesperson Exam. Our mock exams unlock at exactly the same threshold &mdash; so the practice mirrors the real eligibility rule.
      </p>

      <div style={{ ...CARD, padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>Study time logged</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, letterSpacing: '-0.02em', color: T.text, lineHeight: 1 }}>
              {p.hours.toFixed(1)} <span style={{ fontSize: 22, color: T.textMute, fontWeight: 700 }}>hours</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>Remaining</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: T.coral, fontWeight: 700 }}>
              {formatDuration(p.remainingSeconds, 'short')}
            </div>
          </div>
        </div>
        <div style={{ height: 12, background: T.bgRaised, borderRadius: 999, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <div style={{
            height: '100%', width: `${p.pct}%`,
            background: `linear-gradient(90deg, ${T.ocean} 0%, ${T.oceanDark} 100%)`,
            transition: 'width 0.4s ease-out',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, letterSpacing: '0.08em' }}>
          <span>{p.pct.toFixed(1)}% of the way to {STATE_LAW_HOURS_REQUIRED}h</span>
          <span>{STATE_LAW_HOURS_REQUIRED}h required</span>
        </div>
      </div>

      <div style={{ ...CARD, padding: 24, marginBottom: 24, borderLeft: `3px solid ${T.ocean}` }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 10 }}>Why we enforce this</h3>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim, marginBottom: 10 }}>
          The core curriculum can be read in less than 60 hours of pure reading. The state-law minimum exists because <strong style={{ color: T.text }}>retention requires repetition</strong> &mdash; reviewing chapters, drilling flashcards, working math problems, and asking the AI tutor follow-up questions until the material is owned, not just seen.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim, margin: 0 }}>
          Time accrues while you&apos;re actively in the platform (visible tab, active mouse / keyboard). You can check your progress anytime on your <Link href="/profile" style={{ color: T.ocean, textDecoration: 'underline', fontWeight: 600 }}>profile page</Link>.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/course" style={{ ...BUTTON_3D.primary, padding: '14px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          Open the curriculum →
        </Link>
        <Link href="/profile" style={{ ...BUTTON_3D.secondary, padding: '14px 26px', borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          View my profile
        </Link>
      </div>
    </div>
  );
}

function PickDifficulty({ onStart, studiedSeconds }: { onStart: (d: ExamDifficulty) => void; studiedSeconds: number }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 12 }}>
        Eligible · {(studiedSeconds / 3600).toFixed(1)} hours logged
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 60px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
        Three mock exams. <em style={{ color: T.ocean, fontStyle: 'italic' }}>Pick your difficulty.</em>
      </h1>
      <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.6, marginBottom: 32, maxWidth: 760 }}>
        Same {EXAM_TOTAL} questions ({EXAM_NATIONAL} national + {EXAM_STATE} state). Same {EXAM_TIME_MINUTES}-minute timer. Same {EXAM_PASSING_PCT}% threshold on each portion. The difference is <strong style={{ color: T.text }}>how the questions are written</strong>.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 32 }} data-stack-mobile="true">
        {DIFFICULTY_ORDER.map((d, idx) => {
          const meta = DIFFICULTY_META[d];
          const accents: Record<ExamDifficulty, string> = {
            standard: T.ocean,
            hard: T.sand,
            gnarly: T.coral,
          };
          const accent = accents[d];
          const featured = d === 'hard';
          return (
            <div key={d} style={{
              ...CARD,
              padding: '26px 24px',
              borderRadius: 16,
              borderColor: featured ? accent : undefined,
              borderWidth: featured ? 2 : 1,
              position: 'relative',
            }}>
              {featured && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: accent, color: T.white, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 6, fontWeight: 700 }}>
                  Recommended next
                </div>
              )}
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: accent, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                Mock {idx + 1} · {meta.name}
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: 10 }}>
                {meta.tagline}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: T.textDim, marginBottom: 22 }}>
                {meta.description}
              </p>
              <button
                onClick={() => onStart(d)}
                style={{
                  ...(featured ? BUTTON_3D.primary : BUTTON_3D.secondary),
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: featured ? 'none' : undefined,
                }}
              >
                Start Mock {idx + 1} →
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ ...CARD, padding: 22, borderLeft: `3px solid ${T.ocean}` }}>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textDim, margin: 0 }}>
          <strong style={{ color: T.text }}>Hawaii exam reputation:</strong> the real PSI Hawaii Salesperson Exam is known for unusual phrasing &mdash; double negatives, two technically-correct options where you pick the &ldquo;best&rdquo; one, scenarios with red-herring data, and HRS-specific edge cases. The Hard and Gnarly tiers lean into that style so the real exam doesn&apos;t catch you off-guard.
        </p>
      </div>
    </div>
  );
}

function TakingExam({ questions, answers, setAnswers, current, setCurrent, secondsLeft, difficulty, submit }: {
  questions: ExamItem[]; answers: Record<number, number>; setAnswers: (a: Record<number, number>) => void;
  current: number; setCurrent: (n: number) => void; secondsLeft: number; difficulty: ExamDifficulty; submit: () => void;
}) {
  const q = questions[current];
  if (!q) return null;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const answered = Object.keys(answers).length;
  const meta = DIFFICULTY_META[difficulty];

  return (
    <div>
      <div style={{ position: 'sticky', top: 80, background: T.bg, padding: '12px 0', marginBottom: 16, borderBottom: `1px solid ${T.border}`, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.text, fontWeight: 600 }}>
          {meta.name} · Q{current + 1} / {questions.length} · {answered} answered · <span style={{ color: q.portion === 'state' ? T.coral : T.ocean, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 11 }}>{q.portion}</span>
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

function Results({ score, questions, answers, difficulty, restart }: {
  score: { nat: number; st: number; natPct: number; stPct: number; passed: boolean };
  questions: ExamItem[]; answers: Record<number, number>;
  difficulty: ExamDifficulty;
  restart: () => void;
}) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
        Result · {meta.name} mock
      </div>
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

      <button onClick={restart} style={{ ...BUTTON_3D.primary, padding: '14px 28px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>
        Pick another mock exam
      </button>
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
