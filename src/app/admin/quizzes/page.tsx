'use client';

// Admin · Quiz Analytics Dossier
// Per-chapter pass-rate + per-question right/wrong %. Hot-spot panel at
// the top surfaces the 10 trickiest questions across the academy.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { T, CARD } from '@/lib/theme';

interface QuestionRow {
  questionId: string;
  concept: string;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  attempts: number;
  correctCount: number;
  wrongPct: number;
  variantsAvailable: number;
}

interface ChapterRow {
  slug: string;
  number: number;
  title: string;
  portion: 'national' | 'state';
  attempts: number;
  uniqueStudents: number;
  averageScorePct: number;
  passRatePct: number;
  questions: QuestionRow[];
}

interface Totals {
  totalAttempts: number;
  uniqueStudents: number;
  averageScorePct: number;
  totalQuestions: number;
}

interface DossierData {
  totals: Totals;
  hotSpots: QuestionRow[];
  chapters: ChapterRow[];
}

export default function QuizDossierPage() {
  const [data, setData] = useState<DossierData | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch('/api/admin/quiz-analytics', { cache: 'no-store' });
        if (r.ok && mounted) {
          setData(await r.json() as DossierData);
        }
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <main style={{ padding: '40px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          Admin · Quiz dossier
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, margin: 0 }}>
          What students <em style={{ color: T.ocean, fontStyle: 'italic' }}>struggle</em> with.
        </h1>
        <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6, marginTop: 10, maxWidth: 720 }}>
          Per-question right/wrong percentages across every chapter quiz. Trickiest questions float to the top so you can rewrite a confusing distractor, add an explanation, or surface a topic for office hours.
        </p>
      </div>

      {!data && <p style={{ color: T.textMute, marginTop: 24 }}>Loading dossier…</p>}

      {data && (
        <>
          {/* SITE-WIDE TOTALS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
            <Kpi label="Quiz attempts" value={data.totals.totalAttempts.toLocaleString()} sub="all-time across all chapters" />
            <Kpi label="Unique students" value={data.totals.uniqueStudents.toLocaleString()} sub="took at least one quiz" />
            <Kpi label="Average score" value={`${data.totals.averageScorePct}%`} sub="70% to pass any quiz" accent={data.totals.averageScorePct >= 70 ? 'ocean' : 'coral'} />
            <Kpi label="Question bank" value={data.totals.totalQuestions.toLocaleString()} sub="unique concepts tested" />
          </div>

          {/* HOT SPOTS */}
          {data.hotSpots.length > 0 && (
            <div style={{ ...CARD, padding: 28, marginBottom: 22, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Hot spots</div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Top 10 trickiest questions</h2>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, letterSpacing: '0.1em' }}>
                  ≥3 attempts · ranked by wrong %
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.hotSpots.map((q, i) => <HotSpotRow key={q.questionId} q={q} rank={i + 1} />)}
              </div>
            </div>
          )}

          {/* PER-CHAPTER BREAKDOWN */}
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 14 }}>
            By chapter
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.chapters.map(c => (
              <ChapterDossier
                key={c.slug}
                chapter={c}
                expanded={expanded === c.slug}
                onToggle={() => setExpanded(expanded === c.slug ? null : c.slug)}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function Kpi({ label, value, sub, accent = 'default' }: { label: string; value: string; sub: string; accent?: 'default' | 'ocean' | 'coral' }) {
  const accentColor: Record<string, string> = { default: T.text, ocean: T.ocean, coral: T.coral };
  return (
    <div style={{ ...CARD, padding: 18 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: accentColor[accent], letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{sub}</div>
    </div>
  );
}

function HotSpotRow({ q, rank }: { q: QuestionRow; rank: number }) {
  const tone = q.wrongPct >= 60 ? T.coral : q.wrongPct >= 40 ? T.amber : T.green;
  return (
    <Link href={`/quizzes/${q.chapterSlug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '36px 1fr 90px 90px', gap: 14, alignItems: 'center',
        padding: '12px 16px', borderRadius: 10, background: T.bgRaised, border: `1px solid ${T.border}`,
        borderLeftWidth: 4, borderLeftColor: tone,
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 800, color: T.textMute, letterSpacing: '-0.02em' }}>
          #{rank}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, color: T.text, fontWeight: 600, lineHeight: 1.4 }}>{q.concept}</div>
          <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", marginTop: 2, letterSpacing: '0.04em' }}>
            Ch. {q.chapterNumber} · {q.chapterTitle}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: tone, letterSpacing: '-0.02em' }}>
            {q.wrongPct}%
          </div>
          <div style={{ fontSize: 9, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>wrong</div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textDim }}>
          {q.attempts} {q.attempts === 1 ? 'try' : 'tries'}
        </div>
      </div>
    </Link>
  );
}

function ChapterDossier({ chapter, expanded, onToggle }: { chapter: ChapterRow; expanded: boolean; onToggle: () => void }) {
  const portionColor = chapter.portion === 'state' ? T.coral : T.ocean;
  const passColor = chapter.attempts === 0 ? T.textMute : chapter.passRatePct >= 70 ? T.green : T.coral;
  return (
    <div style={{ background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'grid', gridTemplateColumns: '36px 1fr auto auto auto 32px',
        gap: 14, alignItems: 'center', padding: '14px 18px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        textAlign: 'left', fontFamily: 'inherit',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: portionColor, color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
          {chapter.number}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, color: T.text, fontWeight: 700 }}>{chapter.title}</div>
          <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {chapter.portion} · {chapter.questions.length} questions
          </div>
        </div>
        <Pill label="attempts" value={chapter.attempts.toLocaleString()} />
        <Pill label="avg score" value={chapter.attempts === 0 ? '—' : `${chapter.averageScorePct}%`} color={chapter.averageScorePct >= 70 ? T.green : chapter.attempts === 0 ? T.textMute : T.coral} />
        <Pill label="pass rate" value={chapter.attempts === 0 ? '—' : `${chapter.passRatePct}%`} color={passColor} />
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: T.textMute, textAlign: 'center' }}>{expanded ? '−' : '+'}</div>
      </button>

      {expanded && (
        <div style={{ padding: '0 18px 16px' }}>
          {chapter.questions.length === 0 && (
            <div style={{ fontSize: 13, color: T.textMute, padding: 12 }}>No questions found for this chapter.</div>
          )}
          {chapter.questions.map((q, i) => {
            const tone = q.attempts === 0 ? T.textMute
              : q.wrongPct >= 60 ? T.coral
              : q.wrongPct >= 40 ? T.amber
              : T.green;
            return (
              <div key={q.questionId} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr 80px 80px 90px', gap: 12,
                alignItems: 'center',
                padding: '10px 12px', borderTop: i === 0 ? `1px solid ${T.border}` : `1px solid ${T.border}`,
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, fontWeight: 700 }}>
                  Q{(i + 1).toString().padStart(2, '0')}
                </div>
                <div style={{ minWidth: 0, fontSize: 13, color: T.text, lineHeight: 1.4 }}>
                  {q.concept}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, textAlign: 'right' }}>
                  {q.variantsAvailable} {q.variantsAvailable === 1 ? 'variant' : 'variants'}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textDim, textAlign: 'right' }}>
                  {q.attempts} {q.attempts === 1 ? 'try' : 'tries'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 800, color: tone, letterSpacing: '-0.01em' }}>
                    {q.attempts === 0 ? '—' : `${q.wrongPct}% wrong`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({ label, value, color = T.text }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 800, color, letterSpacing: '-0.01em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
