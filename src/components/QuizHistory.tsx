'use client';

// Profile · Quiz History card. Lists the student's most recent quiz
// attempts; clicking one expands to show every question + the answer
// they picked vs the correct one + the explanation. Wrong-answer rows
// are emphasized with the coral accent so review is fast.

import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Icon } from '@/components/Icon';

interface AttemptRow {
  id: string;
  kind: 'chapter' | 'mock';
  context: string;
  contextLabel: string;
  portion: 'national' | 'state' | null;
  totalQuestions: number;
  correctCount: number;
  scorePct: number;
  completedAt: string;
  passed: boolean;
}

interface AnswerDetail {
  questionId: string;
  variantIndex: number;
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  q: string;
  options: string[];
  explain: string;
}

export function QuizHistory() {
  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, { answers: AnswerDetail[] } | 'loading' | 'error'>>({});
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch('/api/quiz/history', { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        if (mounted) setAttempts(j.attempts ?? []);
      } catch { /* ignore */ }
    };
    load();
    // Refresh after the student submits a new quiz somewhere else.
    const id = setInterval(load, 60_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (!attempts) return null;
  if (attempts.length === 0) {
    return (
      <div style={{ ...CARD, padding: 22, marginBottom: 22, borderLeft: `3px solid ${T.textMute}` }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
          Quiz history
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>
          No quizzes taken yet.
        </h3>
        <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.55, margin: '8px 0 0' }}>
          Finish a chapter, take its quiz, and your attempts will show up here. Retake any quiz to get a fresh set of variant questions.
        </p>
      </div>
    );
  }

  const onToggle = async (a: AttemptRow) => {
    if (openId === a.id) {
      setOpenId(null);
      return;
    }
    setOpenId(a.id);
    if (detail[a.id] && detail[a.id] !== 'loading' && detail[a.id] !== 'error') return;
    setDetail(d => ({ ...d, [a.id]: 'loading' }));
    try {
      const r = await fetch(`/api/quiz/history/${a.id}`, { cache: 'no-store' });
      if (!r.ok) {
        setDetail(d => ({ ...d, [a.id]: 'error' }));
        return;
      }
      const j = await r.json();
      setDetail(d => ({ ...d, [a.id]: { answers: j.answers as AnswerDetail[] } }));
    } catch {
      setDetail(d => ({ ...d, [a.id]: 'error' }));
    }
  };

  // Aggregate stats above the list
  const total = attempts.length;
  const passes = attempts.filter(a => a.passed).length;
  const avgScore = Math.round(attempts.reduce((s, a) => s + a.scorePct, 0) / total);

  return (
    <div style={{ ...CARD, padding: 24, marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Quiz history
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>
            Every quiz, every question.
          </h2>
          <p style={{ fontSize: 12, color: T.textMute, margin: '6px 0 0', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
            Tap any attempt to review the questions you missed.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Stat label="Attempts" value={total.toString()} />
          <Stat label="Pass rate" value={`${Math.round((passes / total) * 100)}%`} color={passes / total >= 0.7 ? T.green : T.coral} />
          <Stat label="Avg score" value={`${avgScore}%`} color={avgScore >= 70 ? T.green : T.coral} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {attempts.map(a => {
          const isOpen = openId === a.id;
          const tone = a.passed ? T.green : T.coral;
          const date = new Date(a.completedAt);
          const rel = relative(date);
          return (
            <div key={a.id} style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', borderLeftWidth: 3, borderLeftColor: tone }}>
              <button
                onClick={() => onToggle(a)}
                style={{
                  width: '100%', display: 'grid',
                  gridTemplateColumns: '1fr auto auto 28px',
                  gap: 12, alignItems: 'center',
                  padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: T.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.contextLabel}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", marginTop: 3, letterSpacing: '0.06em' }}>
                    {rel} · {a.correctCount} / {a.totalQuestions} correct
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: a.passed ? 'rgba(45,134,89,0.12)' : 'rgba(232,93,60,0.12)',
                  color: a.passed ? T.green : T.coral,
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
                  textTransform: 'uppercase', fontWeight: 700,
                }}>
                  {a.passed ? 'PASS' : 'RETAKE'}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: tone, letterSpacing: '-0.02em' }}>
                  {a.scorePct}%
                </span>
                <span style={{ color: T.textMute, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, textAlign: 'center' }}>
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: '4px 16px 16px' }}>
                  {detail[a.id] === 'loading' && (
                    <p style={{ fontSize: 13, color: T.textMute, padding: 10 }}>Loading questions…</p>
                  )}
                  {detail[a.id] === 'error' && (
                    <p style={{ fontSize: 13, color: T.coral, padding: 10 }}>Couldn&apos;t load this attempt&apos;s details.</p>
                  )}
                  {typeof detail[a.id] === 'object' && detail[a.id] !== 'loading' && detail[a.id] !== 'error' && (
                    <>
                      {/* filter toggle */}
                      <div style={{ display: 'flex', gap: 4, marginBottom: 10, padding: 4, background: T.bg, borderRadius: 8, border: `1px solid ${T.border}`, width: 'fit-content' }}>
                        {(['all', 'wrong'] as const).map(f => (
                          <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '6px 12px', borderRadius: 6,
                            background: filter === f ? T.ocean : 'transparent',
                            color: filter === f ? '#fff' : T.text,
                            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                          }}>
                            {f === 'all' ? `All ${a.totalQuestions}` : `Wrong only (${a.totalQuestions - a.correctCount})`}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(detail[a.id] as { answers: AnswerDetail[] }).answers
                          .filter(ans => filter === 'all' || !ans.correct)
                          .map((ans, i) => (
                            <AnswerRow key={i} index={i} ans={ans} />
                          ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color = T.text }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 800, color, letterSpacing: '-0.01em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4, fontWeight: 700 }}>
        {label}
      </div>
    </div>
  );
}

function AnswerRow({ index, ans }: { index: number; ans: AnswerDetail }) {
  const tone = ans.correct ? T.green : T.coral;
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 10,
      background: ans.correct ? 'rgba(45,134,89,0.06)' : 'rgba(232,93,60,0.06)',
      border: `1px solid ${ans.correct ? 'rgba(45,134,89,0.18)' : 'rgba(232,93,60,0.20)'}`,
      borderLeftWidth: 3, borderLeftColor: tone,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: T.text, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>
          Q{index + 1}. {ans.q}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: tone, fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
          <Icon kind={ans.correct ? 'shield' : 'no-cheat'} size={14} strokeWidth={2} />
          {ans.correct ? 'CORRECT' : 'MISSED'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ans.options.map((o, idx) => {
          const isUser = idx === ans.selectedIndex;
          const isRight = idx === ans.correctIndex;
          const bg = isRight ? 'rgba(45,134,89,0.18)' : isUser ? 'rgba(232,93,60,0.16)' : 'transparent';
          const labelColor = isRight ? T.green : isUser && !isRight ? T.coral : T.textMute;
          return (
            <div key={idx} style={{
              display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 8, alignItems: 'center',
              padding: '6px 10px', borderRadius: 6,
              background: bg,
              fontSize: 12, color: T.text,
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: labelColor }}>
                {['A','B','C','D'][idx]}
              </span>
              <span style={{ lineHeight: 1.4 }}>{o}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: labelColor, letterSpacing: '0.08em', fontWeight: 700 }}>
                {isUser && isRight ? 'YOUR ANSWER · RIGHT'
                  : isUser ? 'YOUR ANSWER'
                  : isRight ? 'CORRECT'
                  : ''}
              </span>
            </div>
          );
        })}
      </div>
      {ans.explain && (
        <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6, marginTop: 10, fontStyle: 'italic' }}>
          {ans.explain}
        </p>
      )}
    </div>
  );
}

function relative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
