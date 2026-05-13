'use client';

// ABOUTME: Admin · Question Database. Every question, every variant, full text + per-variant stats.
// ABOUTME: Sidebar by chapter, search across all chapters, expand to drill into variants.

import { useEffect, useMemo, useState } from 'react';
import { T, CARD } from '@/lib/theme';

interface VariantOut {
  index: number;
  q: string;
  options: string[];
  correctIndex: number;
  explain: string;
  attempts: number;
  correctCount: number;
}
interface QuestionOut {
  id: string;
  concept: string;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  portion: 'national' | 'state';
  variants: VariantOut[];
  totalAttempts: number;
  totalCorrect: number;
  wrongPct: number;
}
interface ChapterGroup {
  slug: string;
  number: number;
  title: string;
  portion: 'national' | 'state';
  questionCount: number;
  variantCount: number;
  attempts: number;
  averageWrongPct: number;
  questions: QuestionOut[];
}
interface ToughGroup {
  slug: 'tough-bank';
  title: string;
  questionCount: number;
  variantCount: number;
  attempts: number;
  averageWrongPct: number;
  questions: QuestionOut[];
}
interface DbResponse {
  totals: { totalQuestions: number; totalVariants: number; totalAttempts: number };
  chapters: ChapterGroup[];
  toughBank: ToughGroup;
}

export default function QuestionDatabasePage() {
  const [data, setData] = useState<DbResponse | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch('/api/admin/questions', { cache: 'no-store' });
        if (r.ok && mounted) setData(await r.json() as DbResponse);
      } catch { /* ignore */ }
    };
    load();
  }, []);

  // Combined source list: every chapter + the tough bank as one extra "group"
  const allGroups: Array<ChapterGroup | ToughGroup> = useMemo(() => {
    if (!data) return [];
    return [...data.chapters, data.toughBank];
  }, [data]);

  // Filter by chapter selection + by search query (matches across variant text,
  // not just the original concept — so a search for "littoral" finds the
  // variant that uses that word even if the original didn't).
  const visibleQuestions = useMemo(() => {
    if (!data) return [];
    const groups = selectedChapter === 'all'
      ? allGroups
      : allGroups.filter(g => g.slug === selectedChapter);
    const q = query.trim().toLowerCase();
    const all: QuestionOut[] = groups.flatMap(g => g.questions);
    if (!q) return all;
    return all.filter(qu => {
      if (qu.concept.toLowerCase().includes(q)) return true;
      if (qu.id.toLowerCase().includes(q)) return true;
      for (const v of qu.variants) {
        if (v.q.toLowerCase().includes(q)) return true;
        if (v.explain.toLowerCase().includes(q)) return true;
        if (v.options.some(o => o.toLowerCase().includes(q))) return true;
      }
      return false;
    });
  }, [data, selectedChapter, query, allGroups]);

  return (
    <main style={{ padding: '40px 32px 64px', maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          Admin · Question database
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, margin: 0 }}>
          Every question, every <em style={{ color: T.ocean, fontStyle: 'italic' }}>variant.</em>
        </h1>
        <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6, marginTop: 10, maxWidth: 720 }}>
          The full pool that powers chapter quizzes + mock exams. Search any term, expand any question to see all variants with their answer key, explanation, and per-variant attempt stats.
        </p>
      </div>

      {!data && <p style={{ color: T.textMute }}>Loading question database…</p>}

      {data && (
        <>
          {/* HEADER KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
            <Kpi label="Unique questions" value={data.totals.totalQuestions.toLocaleString()} sub="concepts in the pool" />
            <Kpi label="Total variants" value={data.totals.totalVariants.toLocaleString()} sub="variants across all questions" accent="ocean" />
            <Kpi label="Avg variants / question" value={(data.totals.totalVariants / Math.max(1, data.totals.totalQuestions)).toFixed(1)} sub="originals + generated" />
            <Kpi label="Attempts recorded" value={data.totals.totalAttempts.toLocaleString()} sub="QuizAnswer rows" accent="coral" />
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search across question text, options, explanations…"
              style={{
                flex: '1 1 320px', minWidth: 240,
                padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.bgRaised, color: T.text,
                fontFamily: 'inherit', fontSize: 14, lineHeight: 1.3,
              }}
            />
            <select
              value={selectedChapter}
              onChange={e => setSelectedChapter(e.target.value)}
              style={{
                padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.bgRaised, color: T.text,
                fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
              }}>
              <option value="all">All chapters ({allGroups.reduce((s, g) => s + g.questionCount, 0)} questions)</option>
              {data.chapters.map(c => (
                <option key={c.slug} value={c.slug}>Ch. {c.number} · {c.title} ({c.questionCount})</option>
              ))}
              <option value={data.toughBank.slug}>{data.toughBank.title} ({data.toughBank.questionCount})</option>
            </select>
          </div>

          {/* QUESTION LIST */}
          <div style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginBottom: 12 }}>
            Showing {visibleQuestions.length} question{visibleQuestions.length === 1 ? '' : 's'}
            {query && ` matching "${query}"`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visibleQuestions.map(qu => (
              <QuestionRow
                key={qu.id}
                question={qu}
                open={openId === qu.id}
                onToggle={() => setOpenId(openId === qu.id ? null : qu.id)}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function Kpi({ label, value, sub, accent = 'default' }: { label: string; value: string; sub: string; accent?: 'default' | 'ocean' | 'coral' }) {
  const c: Record<string, string> = { default: T.text, ocean: T.ocean, coral: T.coral };
  return (
    <div style={{ ...CARD, padding: 18 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: c[accent], letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{sub}</div>
    </div>
  );
}

function QuestionRow({ question, open, onToggle }: { question: QuestionOut; open: boolean; onToggle: () => void }) {
  const portionColor = question.portion === 'state' ? T.coral : T.ocean;
  const wrongTone = question.totalAttempts === 0 ? T.textMute
    : question.wrongPct >= 60 ? T.coral
    : question.wrongPct >= 40 ? T.amber
    : T.green;

  return (
    <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'grid',
        gridTemplateColumns: '32px 1fr 80px 90px 80px 28px',
        gap: 14, alignItems: 'center',
        padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
        textAlign: 'left', fontFamily: 'inherit',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: portionColor, color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
          {question.chapterNumber > 0 ? question.chapterNumber : '★'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {question.concept}
          </div>
          <div style={{ fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginTop: 3 }}>
            <strong style={{ color: T.textDim }}>{question.id}</strong> · {question.chapterTitle}
          </div>
        </div>
        <Pill label="variants" value={question.variants.length.toString()} />
        <Pill label="attempts" value={question.totalAttempts.toString()} />
        <Pill label="wrong %" value={question.totalAttempts === 0 ? '—' : `${question.wrongPct}%`} color={wrongTone} />
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: T.textMute, textAlign: 'center' }}>{open ? '−' : '+'}</div>
      </button>

      {open && (
        <div style={{ padding: '4px 16px 18px', borderTop: `1px solid ${T.border}` }}>
          {question.variants.map(v => <VariantBlock key={v.index} v={v} questionId={question.id} />)}
        </div>
      )}
    </div>
  );
}

function VariantBlock({ v, questionId }: { v: VariantOut; questionId: string }) {
  const wrongPct = v.attempts > 0 ? Math.round(((v.attempts - v.correctCount) / v.attempts) * 100) : 0;
  const tone = v.attempts === 0 ? T.textMute
    : wrongPct >= 60 ? T.coral
    : wrongPct >= 40 ? T.amber
    : T.green;

  const [flagOpen, setFlagOpen] = useState(false);
  const [flagCategory, setFlagCategory] = useState<string>('wording');
  const [flagNotes, setFlagNotes] = useState('');
  const [flagBusy, setFlagBusy] = useState(false);
  const [flagDone, setFlagDone] = useState<'created' | 'updated' | null>(null);

  const submitFlag = async () => {
    setFlagBusy(true);
    try {
      const r = await fetch('/api/admin/flag-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          variantIndex: v.index,
          questionText: v.q,
          category: flagCategory,
          notes: flagNotes,
        }),
      });
      const j = await r.json();
      if (r.ok) {
        setFlagDone(j.created ? 'created' : 'updated');
        setTimeout(() => { setFlagOpen(false); setFlagNotes(''); setFlagDone(null); }, 1500);
      }
    } finally {
      setFlagBusy(false);
    }
  };

  return (
    <div style={{ padding: '14px 16px', marginTop: 10, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, borderLeftWidth: 3, borderLeftColor: tone }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div>
          <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 999, background: v.index === 0 ? 'rgba(20,131,123,0.10)' : 'rgba(192,138,46,0.14)', color: v.index === 0 ? T.ocean : T.amber, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginRight: 8 }}>
            {v.index === 0 ? 'Original' : `Variant ${v.index}`}
          </span>
          <span style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
            {v.attempts} attempt{v.attempts === 1 ? '' : 's'} · {v.attempts > 0 ? `${wrongPct}% wrong` : 'no attempts yet'}
          </span>
        </div>
        <button
          onClick={() => setFlagOpen(!flagOpen)}
          style={{
            padding: '4px 10px', borderRadius: 6,
            background: 'transparent', border: `1px solid ${T.coral}`, color: T.coral,
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
            textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer',
          }}>
          {flagOpen ? 'Cancel' : 'Flag for review'}
        </button>
      </div>

      <p style={{ fontSize: 14, color: T.text, fontWeight: 600, lineHeight: 1.55, margin: '0 0 12px' }}>
        {v.q}
      </p>

      <ol type="A" style={{ listStyle: 'none', counterReset: 'opt', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {v.options.map((opt, i) => {
          const isCorrect = i === v.correctIndex;
          return (
            <li key={i} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center',
              padding: '8px 12px', borderRadius: 6,
              background: isCorrect ? 'rgba(45,134,89,0.10)' : 'transparent',
              border: isCorrect ? `1px solid rgba(45,134,89,0.28)` : `1px solid ${T.border}`,
              fontSize: 13, color: T.text, lineHeight: 1.4,
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: isCorrect ? T.green : T.textMute }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
              {isCorrect && (
                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: T.green, fontWeight: 700, textTransform: 'uppercase' }}>
                  Correct
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.65, marginTop: 12, fontStyle: 'italic', padding: '8px 12px', background: T.bgRaised, borderRadius: 6, border: `1px solid ${T.border}` }}>
        <strong style={{ color: T.text, fontStyle: 'normal' }}>Explanation:</strong> {v.explain}
      </p>

      {flagOpen && (
        <div style={{ marginTop: 12, padding: '14px 16px', background: 'rgba(232,93,60,0.06)', border: `1px solid ${T.coral}33`, borderRadius: 8 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            Flag this variant for review
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {[
              { v: 'wording', label: 'Confusing wording' },
              { v: 'wrong-answer', label: 'Wrong answer key' },
              { v: 'distractor', label: 'Bad distractor' },
              { v: 'typo', label: 'Typo' },
              { v: 'other', label: 'Other' },
            ].map(c => (
              <button key={c.v} onClick={() => setFlagCategory(c.v)} style={{
                padding: '5px 10px', borderRadius: 6,
                background: flagCategory === c.v ? T.coral : 'transparent',
                color: flagCategory === c.v ? '#fff' : T.text,
                border: `1px solid ${flagCategory === c.v ? T.coralDark : T.border}`,
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {c.label}
              </button>
            ))}
          </div>
          <textarea
            value={flagNotes}
            onChange={(e) => setFlagNotes(e.target.value)}
            placeholder="What's wrong? Optional notes — e.g., 'option C is also technically correct'"
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 6,
              border: `1px solid ${T.border}`, background: T.bg, color: T.text,
              fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
              resize: 'vertical', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 10 }}>
            {flagDone && (
              <span style={{ fontSize: 11, color: T.green, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', fontWeight: 700 }}>
                {flagDone === 'created' ? '✓ Ticket created' : '✓ Ticket updated'}
              </span>
            )}
            <button
              onClick={submitFlag}
              disabled={flagBusy}
              style={{
                padding: '8px 16px', borderRadius: 6,
                background: T.coral, color: '#fff',
                border: 'none', cursor: flagBusy ? 'wait' : 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'inherit',
                opacity: flagBusy ? 0.6 : 1,
              }}>
              {flagBusy ? 'Saving…' : 'Save flag'}
            </button>
          </div>
          <p style={{ fontSize: 10, color: T.textMute, lineHeight: 1.55, marginTop: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
            Creates a support ticket in /admin/support. Resaving the same flag updates the same ticket instead of duplicating.
          </p>
        </div>
      )}
    </div>
  );
}

function Pill({ label, value, color = T.text }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 800, color, letterSpacing: '-0.01em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
