'use client';

// ABOUTME: Admin · Question Bank + Analytics. The single source of truth for every question, every variant,
// ABOUTME: every attempt — combines the old /admin/quizzes analytics dossier into one unified surface.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { T, CARD } from '@/lib/theme';

interface OverrideMeta {
  editorName: string | null;
  reason: string | null;
  updatedAt: string;
}
interface VariantOut {
  index: number;
  q: string;
  options: string[];
  correctIndex: number;
  explain: string;
  attempts: number;
  correctCount: number;
  override?: OverrideMeta | null;
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
  attemptCount?: number;
  uniqueStudents?: number;
  averageScorePct?: number;
  passRatePct?: number;
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
interface HotSpot {
  questionId: string;
  concept: string;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  attempts: number;
  wrongPct: number;
}
interface MockStat {
  difficulty: 'standard' | 'hard' | 'gnarly';
  attempts: number;
  uniqueStudents: number;
  averageScorePct: number;
  passRatePct: number;
  lastAttemptAt: string | null;
  trickiestQuestions: Array<{ questionId: string; concept: string; attempts: number; wrongPct: number }>;
}
interface DbResponse {
  totals: {
    totalQuestions: number;
    totalVariants: number;
    totalAttempts: number;
    quizRunCount: number;
    uniqueStudents: number;
    averageScorePct: number;
    passRatePct: number;
  };
  chapters: ChapterGroup[];
  toughBank: ToughGroup;
  hotSpots: HotSpot[];
  mockExams: MockStat[];
}

export default function QuestionDatabasePage() {
  const [data, setData] = useState<DbResponse | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch('/api/admin/questions', { cache: 'no-store' });
        if (r.ok && mounted) setData(await r.json() as DbResponse);
      } catch { /* ignore */ }
    };
    load();
    return () => { mounted = false; };
  }, [reloadKey]);

  const allGroups: Array<ChapterGroup | ToughGroup> = useMemo(() => {
    if (!data) return [];
    return [...data.chapters, data.toughBank];
  }, [data]);

  const overrideCount = useMemo(() => {
    if (!data) return 0;
    let n = 0;
    for (const g of allGroups) for (const q of g.questions) for (const v of q.variants) if (v.override) n++;
    return n;
  }, [allGroups, data]);

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
    <main style={{ padding: '40px clamp(14px, 3.5vw, 32px) 64px', maxWidth: 1300, margin: '0 auto', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Admin · Question bank + analytics
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, margin: 0 }}>
            Every question, every <em style={{ color: T.ocean, fontStyle: 'italic' }}>variant.</em>
          </h1>
          <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6, marginTop: 10, maxWidth: 760 }}>
            One surface for the whole question pool — analytics, hot spots, per-chapter pass rates, full variant text, and inline editing. Search any term, expand any chapter or question to drill in. Click <strong style={{ color: T.text }}>Edit</strong> on a variant to rewrite it; edits reach students immediately.
          </p>
        </div>
        <a
          href="/api/admin/questions/export"
          download
          style={{
            padding: '10px 18px', borderRadius: 10,
            background: T.bgRaised, border: `1px solid ${T.border}`,
            color: T.text, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: "'JetBrains Mono', monospace",
            display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
          ⬇ Export CSV
        </a>
      </div>

      {!data && <p style={{ color: T.textMute }}>Loading question database…</p>}

      {data && (
        <>
          {/* TOP KPI BAND — bank size on the left, performance on the right.
              All eight cards reflow into 2-3 columns on iPad / iPhone. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 22 }}>
            <Kpi label="Quiz attempts" value={data.totals.quizRunCount.toLocaleString()} sub="chapter quiz runs (all-time)" />
            <Kpi label="Unique students" value={data.totals.uniqueStudents.toLocaleString()} sub="took at least one quiz" />
            <Kpi label="Average score" value={`${data.totals.averageScorePct}%`} sub="across all attempts" accent={data.totals.averageScorePct >= 70 ? 'ocean' : data.totals.quizRunCount === 0 ? 'default' : 'coral'} />
            <Kpi label="Pass rate" value={`${data.totals.passRatePct}%`} sub="attempts ≥ 70%" accent={data.totals.passRatePct >= 70 ? 'ocean' : data.totals.quizRunCount === 0 ? 'default' : 'coral'} />
            <Kpi label="Question bank" value={data.totals.totalVariants.toLocaleString()} sub={`${data.totals.totalQuestions.toLocaleString()} concepts · ${data.totals.totalVariants.toLocaleString()} variants`} accent="ocean" />
            <Kpi label="Answers recorded" value={data.totals.totalAttempts.toLocaleString()} sub="QuizAnswer rows (per-Q)" />
            <Kpi label="Live edits" value={overrideCount.toLocaleString()} sub="admin overrides applied" accent={overrideCount > 0 ? 'coral' : 'default'} />
          </div>

          {/* HOT SPOTS — the trickiest questions across the whole academy. */}
          {data.hotSpots.length > 0 && (
            <div style={{ ...CARD, padding: 'clamp(18px, 3vw, 28px)', marginBottom: 22, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Hot spots</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: T.text, margin: 0 }}>Top 10 trickiest questions</h2>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, letterSpacing: '0.1em' }}>
                  ≥3 attempts · ranked by wrong %
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.hotSpots.map((h, i) => (
                  <HotSpotRow
                    key={h.questionId}
                    h={h}
                    rank={i + 1}
                    onJump={() => {
                      setQuery('');
                      setSelectedChapter(h.chapterSlug);
                      setOpenId(h.questionId);
                      requestAnimationFrame(() => {
                        document.getElementById(`q-${h.questionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* MOCK EXAM DOSSIER — three difficulty tiers side by side. */}
          {data.mockExams && data.mockExams.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Mock exams</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: T.text, margin: 0 }}>The three final mocks</h2>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, letterSpacing: '0.1em' }}>
                  pass bar 75% · 100 questions
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {data.mockExams.map(m => <MockExamCard key={m.difficulty} m={m} />)}
              </div>
            </div>
          )}

          {/* PER-CHAPTER ANALYTICS BAND — shows when "All chapters" is
              selected, replaced by a single chapter card otherwise. */}
          <ChapterAnalyticsBand
            chapters={data.chapters}
            toughBank={data.toughBank}
            selectedSlug={selectedChapter}
            onSelect={slug => setSelectedChapter(slug)}
          />

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
                onChange={() => setReloadKey(k => k + 1)}
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

function QuestionRow({ question, open, onToggle, onChange }: { question: QuestionOut; open: boolean; onToggle: () => void; onChange: () => void }) {
  const portionColor = question.portion === 'state' ? T.coral : T.ocean;
  const wrongTone = question.totalAttempts === 0 ? T.textMute
    : question.wrongPct >= 60 ? T.coral
    : question.wrongPct >= 40 ? T.amber
    : T.green;
  const editedVariantCount = question.variants.filter(v => v.override).length;

  return (
    <div id={`q-${question.id}`} style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', scrollMarginTop: 80 }}>
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
            {editedVariantCount > 0 && (
              <span style={{ marginLeft: 8, display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: 'rgba(232,93,60,0.12)', color: T.coral, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, verticalAlign: 'middle' }}>
                {editedVariantCount} edited
              </span>
            )}
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
          {question.variants.map(v => <VariantBlock key={v.index} v={v} questionId={question.id} onChange={onChange} />)}
        </div>
      )}
    </div>
  );
}

function VariantBlock({ v, questionId, onChange }: { v: VariantOut; questionId: string; onChange: () => void }) {
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

  // Inline editor state
  const [editing, setEditing] = useState(false);
  const [editQ, setEditQ] = useState(v.q);
  const [editOpts, setEditOpts] = useState<string[]>([...v.options]);
  const [editCorrect, setEditCorrect] = useState(v.correctIndex);
  const [editExplain, setEditExplain] = useState(v.explain);
  const [editReason, setEditReason] = useState('');
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const openEditor = () => {
    setEditQ(v.q);
    setEditOpts([...v.options]);
    setEditCorrect(v.correctIndex);
    setEditExplain(v.explain);
    setEditReason('');
    setSaveErr(null);
    setEditing(true);
  };

  const submitFlag = async () => {
    setFlagBusy(true);
    try {
      const r = await fetch('/api/admin/flag-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId, variantIndex: v.index, questionText: v.q,
          category: flagCategory, notes: flagNotes,
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

  const saveEdit = async () => {
    setSaveBusy(true); setSaveErr(null);
    try {
      const r = await fetch('/api/admin/variant-override', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId, variantIndex: v.index,
          q: editQ, options: editOpts, correctIndex: editCorrect,
          explain: editExplain, reason: editReason || undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setSaveErr(j.message || j.error || 'Save failed.');
      } else {
        setEditing(false);
        onChange(); // refetch admin data → override badge appears
      }
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setSaveBusy(false);
    }
  };

  const revertEdit = async () => {
    if (!confirm('Revert this variant to the original? The override will be deleted and students will see the original question on their next attempt.')) return;
    setSaveBusy(true); setSaveErr(null);
    try {
      const r = await fetch('/api/admin/variant-override', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, variantIndex: v.index }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setSaveErr(j.message || j.error || 'Revert failed.');
      } else {
        onChange();
      }
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setSaveBusy(false);
    }
  };

  const overrideBorder = v.override ? T.coral : tone;

  return (
    <div style={{ padding: '14px 16px', marginTop: 10, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, borderLeftWidth: 3, borderLeftColor: overrideBorder }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 999, background: v.index === 0 ? 'rgba(20,131,123,0.10)' : 'rgba(192,138,46,0.14)', color: v.index === 0 ? T.ocean : T.amber, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
            {v.index === 0 ? 'Original' : `Variant ${v.index}`}
          </span>
          {v.override && (
            <span title={v.override.reason ? `Reason: ${v.override.reason}` : 'Edited by admin'} style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 999, background: 'rgba(232,93,60,0.14)', color: T.coral, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              Edited · {v.override.editorName || 'admin'}
            </span>
          )}
          <span style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
            {v.attempts} attempt{v.attempts === 1 ? '' : 's'} · {v.attempts > 0 ? `${wrongPct}% wrong` : 'no attempts yet'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {v.override && !editing && (
            <button onClick={revertEdit} disabled={saveBusy} style={{
              padding: '4px 10px', borderRadius: 6,
              background: 'transparent', border: `1px solid ${T.textMute}`, color: T.textDim,
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
              textTransform: 'uppercase', fontWeight: 700, cursor: saveBusy ? 'wait' : 'pointer',
              opacity: saveBusy ? 0.5 : 1,
            }}>
              Revert
            </button>
          )}
          {!editing && (
            <button onClick={openEditor} style={{
              padding: '4px 10px', borderRadius: 6,
              background: 'transparent', border: `1px solid ${T.ocean}`, color: T.ocean,
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
              textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer',
            }}>
              Edit
            </button>
          )}
          {!editing && (
            <button
              onClick={() => setFlagOpen(!flagOpen)}
              style={{
                padding: '4px 10px', borderRadius: 6,
                background: 'transparent', border: `1px solid ${T.coral}`, color: T.coral,
                fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
                textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer',
              }}>
              {flagOpen ? 'Cancel flag' : 'Flag'}
            </button>
          )}
        </div>
      </div>

      {!editing && (
        <>
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

          {v.override?.reason && (
            <p style={{ fontSize: 11, color: T.coral, marginTop: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', lineHeight: 1.6 }}>
              <strong>Edit note:</strong> {v.override.reason}
            </p>
          )}
        </>
      )}

      {editing && (
        <div style={{ padding: '14px 16px', background: 'rgba(20,131,123,0.05)', border: `1px solid ${T.ocean}33`, borderRadius: 8, marginTop: 4 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
            Edit variant {v.index === 0 ? '(original)' : `${v.index}`}
          </div>

          <label style={fieldLabel}>Question text</label>
          <textarea
            value={editQ}
            onChange={(e) => setEditQ(e.target.value)}
            rows={3}
            style={{ ...fieldInput, fontSize: 14, fontWeight: 600 }}
          />

          <label style={{ ...fieldLabel, marginTop: 14 }}>Options · click radio to mark correct</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {editOpts.map((opt, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 10, alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`correct-${questionId}-${v.index}`}
                    checked={editCorrect === i}
                    onChange={() => setEditCorrect(i)}
                  />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12, color: editCorrect === i ? T.green : T.textMute }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                </label>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...editOpts];
                    next[i] = e.target.value;
                    setEditOpts(next);
                  }}
                  style={{ ...fieldInput, marginBottom: 0 }}
                />
              </div>
            ))}
          </div>

          <label style={{ ...fieldLabel, marginTop: 14 }}>Explanation</label>
          <textarea
            value={editExplain}
            onChange={(e) => setEditExplain(e.target.value)}
            rows={3}
            style={fieldInput}
          />

          <label style={{ ...fieldLabel, marginTop: 14 }}>Reason for change (optional, visible to other admins)</label>
          <input
            type="text"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
            placeholder="e.g., fixed typo / clarified ambiguous wording / option B was also correct"
            style={fieldInput}
          />

          {saveErr && (
            <p style={{ fontSize: 12, color: T.coral, marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              {saveErr}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button
              onClick={() => setEditing(false)}
              disabled={saveBusy}
              style={{
                padding: '8px 16px', borderRadius: 6,
                background: 'transparent', color: T.textDim,
                border: `1px solid ${T.border}`, cursor: saveBusy ? 'wait' : 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'inherit',
              }}>
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={saveBusy}
              style={{
                padding: '8px 16px', borderRadius: 6,
                background: T.ocean, color: '#fff',
                border: 'none', cursor: saveBusy ? 'wait' : 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'inherit',
                opacity: saveBusy ? 0.6 : 1,
              }}>
              {saveBusy ? 'Saving…' : v.override ? 'Update edit' : 'Save edit'}
            </button>
          </div>

          <p style={{ fontSize: 10, color: T.textMute, lineHeight: 1.55, marginTop: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
            Edits reach students on their next quiz attempt. Historical analytics (attempts on prior wording) are preserved unchanged.
          </p>
        </div>
      )}

      {flagOpen && !editing && (
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

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
  color: T.textDim, marginBottom: 6,
};

const fieldInput: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 6,
  border: `1px solid ${T.border}`, background: T.bg, color: T.text,
  fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
  resize: 'vertical', boxSizing: 'border-box', marginBottom: 0,
};

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

// One of the three mock-exam analytics cards (Standard / Hard / Gnarly).
function MockExamCard({ m }: { m: MockStat }) {
  const tone = m.difficulty === 'gnarly' ? T.coral
    : m.difficulty === 'hard' ? T.amber
    : T.ocean;
  const passColor = m.attempts === 0 ? T.textMute : m.passRatePct >= 70 ? T.green : T.coral;
  const label = m.difficulty.charAt(0).toUpperCase() + m.difficulty.slice(1);
  return (
    <div style={{ ...CARD, padding: 'clamp(16px, 3vw, 22px)', borderTopWidth: 4, borderTopStyle: 'solid', borderTopColor: tone, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: tone, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
            {label}
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.1, margin: 0 }}>
            Mock · {label}
          </h3>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, letterSpacing: '0.06em', textAlign: 'right' }}>
          {m.lastAttemptAt
            ? `Last: ${new Date(m.lastAttemptAt).toLocaleDateString()}`
            : 'No attempts yet'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <MiniStat label="Attempts" value={m.attempts.toString()} />
        <MiniStat label="Students" value={m.uniqueStudents.toString()} />
        <MiniStat label="Avg score" value={m.attempts === 0 ? '—' : `${m.averageScorePct}%`} accent={m.attempts === 0 ? 'default' : m.averageScorePct >= 75 ? 'ocean' : 'coral'} />
        <MiniStat label="Pass rate" value={m.attempts === 0 ? '—' : `${m.passRatePct}%`} accent={m.attempts === 0 ? 'default' : m.passRatePct >= 70 ? 'ocean' : 'coral'} />
      </div>

      {m.trickiestQuestions.length > 0 ? (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
            Top trickiest on this tier
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {m.trickiestQuestions.slice(0, 5).map(q => {
              const t = q.wrongPct >= 60 ? T.coral : q.wrongPct >= 40 ? T.amber : T.green;
              return (
                <div key={q.questionId} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'baseline', padding: '6px 8px', borderRadius: 6, background: T.bgRaised, border: `1px solid ${T.border}`, borderLeftWidth: 3, borderLeftColor: t }}>
                  <span style={{ fontSize: 12, color: T.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.concept}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 800, color: t }}>
                    {q.wrongPct}%
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.textMute }}>
                    {q.attempts}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: passColor, fontStyle: 'italic', margin: 0 }}>
          {m.attempts === 0 ? 'No mock attempts yet at this difficulty.' : 'Not enough data for per-question stats (need ≥2 attempts per question).'}
        </p>
      )}
    </div>
  );
}

// One row in the Hot Spots panel. Clicking jumps the list below to the
// question (sets chapter filter + opens the row + scrolls into view).
function HotSpotRow({ h, rank, onJump }: { h: HotSpot; rank: number; onJump: () => void }) {
  const tone = h.wrongPct >= 60 ? T.coral : h.wrongPct >= 40 ? T.amber : T.green;
  return (
    <button
      onClick={onJump}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(36px, auto) 1fr minmax(70px, auto) minmax(60px, auto)',
        gap: 12, alignItems: 'center',
        padding: '10px 14px', borderRadius: 10, background: T.bgRaised, border: `1px solid ${T.border}`,
        borderLeftWidth: 4, borderLeftColor: tone,
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
      }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 800, color: T.textMute }}>
        #{rank}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, color: T.text, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {h.concept}
        </span>
        <span style={{ display: 'block', fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginTop: 2 }}>
          {h.chapterNumber > 0 ? `Ch. ${h.chapterNumber} · ` : ''}{h.chapterTitle}
        </span>
      </span>
      <span style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 800, color: tone, letterSpacing: '-0.01em' }}>
        {h.wrongPct}%
        <span style={{ display: 'block', fontSize: 9, color: T.textMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>wrong</span>
      </span>
      <span style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textDim }}>
        {h.attempts} {h.attempts === 1 ? 'try' : 'tries'}
      </span>
    </button>
  );
}

// Per-chapter analytics band. When "all" is selected, renders a scrollable
// row of mini cards (one per chapter + tough bank). When a single chapter
// is selected, renders one big detail card for that chapter.
function ChapterAnalyticsBand({
  chapters, toughBank, selectedSlug, onSelect,
}: {
  chapters: ChapterGroup[];
  toughBank: ToughGroup;
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  if (selectedSlug !== 'all') {
    const ch = [...chapters, toughBank].find(g => g.slug === selectedSlug);
    if (!ch) return null;
    const isTough = ch.slug === 'tough-bank';
    const isChapter = !isTough;
    const detail = isChapter ? ch as ChapterGroup : null;
    return (
      <div style={{ ...CARD, padding: 'clamp(18px, 3vw, 24px)', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700 }}>
            {isChapter ? `Chapter ${(ch as ChapterGroup).number}` : 'Tough bank'}
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: T.text, margin: 0 }}>
            {ch.title}
          </h3>
          <button onClick={() => onSelect('all')} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: T.ocean, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>
            ← All chapters
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <MiniStat label="Questions" value={ch.questionCount.toLocaleString()} />
          <MiniStat label="Variants" value={ch.variantCount.toLocaleString()} accent="ocean" />
          {detail && <MiniStat label="Quiz runs" value={(detail.attemptCount ?? 0).toLocaleString()} />}
          {detail && <MiniStat label="Students" value={(detail.uniqueStudents ?? 0).toLocaleString()} />}
          {detail && <MiniStat label="Avg score" value={detail.attemptCount ? `${detail.averageScorePct}%` : '—'} accent={detail.attemptCount && (detail.averageScorePct ?? 0) >= 70 ? 'ocean' : detail.attemptCount ? 'coral' : 'default'} />}
          {detail && <MiniStat label="Pass rate" value={detail.attemptCount ? `${detail.passRatePct}%` : '—'} accent={detail.attemptCount && (detail.passRatePct ?? 0) >= 70 ? 'ocean' : detail.attemptCount ? 'coral' : 'default'} />}
        </div>
      </div>
    );
  }

  // 'all' — render the per-chapter band as a responsive grid that wraps
  // naturally on every breakpoint (iPhone → 1 col, iPad → 2-3 cols,
  // desktop → 4-5 cols). The earlier horizontal-scroll strip didn't
  // scroll reliably on touch devices and clipped content on small screens.
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700 }}>
          By chapter · tap a card to filter
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.06em', color: T.textMute }}>
          {chapters.length + 1} cards total
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 10,
      }}>
        {chapters.map(c => (
          <ChapterMiniCard key={c.slug} chapter={c} onClick={() => onSelect(c.slug)} />
        ))}
        <ChapterMiniCard chapter={toughBank} onClick={() => onSelect(toughBank.slug)} />
      </div>
    </div>
  );
}

function ChapterMiniCard({ chapter, onClick }: { chapter: ChapterGroup | ToughGroup; onClick: () => void }) {
  const isChapter = 'attemptCount' in chapter && chapter.slug !== 'tough-bank';
  const ch = chapter as ChapterGroup;
  const noAttempts = !isChapter || (ch.attemptCount ?? 0) === 0;
  const passColor = noAttempts ? T.textMute : (ch.passRatePct ?? 0) >= 70 ? T.green : T.coral;
  const portionColor = isChapter
    ? (ch.portion === 'state' ? T.coral : T.ocean)
    : T.amber;
  return (
    <button
      onClick={onClick}
      style={{
        // Grid cell fills the column — no fixed width.
        width: '100%', minWidth: 0,
        background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 10,
        padding: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: 8,
        minHeight: 96, boxSizing: 'border-box',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: portionColor, color: '#fff', fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
          {isChapter ? ch.number : '★'}
        </span>
        <span style={{
          fontSize: 12, color: T.text, fontWeight: 700, lineHeight: 1.3,
          minWidth: 0, overflow: 'hidden',
          // Two-line clamp so longer chapter titles wrap nicely on phone.
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {chapter.title}
        </span>
      </div>
      {isChapter && !noAttempts ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textDim }}>
            {ch.attemptCount} runs
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 800, color: passColor }}>
            {ch.passRatePct}% pass
          </span>
        </div>
      ) : (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute }}>
          {chapter.questionCount} questions · {chapter.variantCount} variants
        </div>
      )}
    </button>
  );
}

function MiniStat({ label, value, accent = 'default' }: { label: string; value: string; accent?: 'default' | 'ocean' | 'coral' }) {
  const c: Record<string, string> = { default: T.text, ocean: T.ocean, coral: T.coral };
  return (
    <div style={{ padding: '10px 12px', borderRadius: 8, background: T.bgRaised, border: `1px solid ${T.border}` }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: c[accent], letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
    </div>
  );
}
