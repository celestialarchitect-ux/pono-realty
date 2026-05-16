// ABOUTME: Rich per-section progress dossier for the student's /profile.
// ABOUTME: Returns time spent, sessions, best/avg quiz scores, and "usage rating" per section.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { CURRICULUM } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { GLOSSARY } from '@/lib/content/glossary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SectionProgress {
  key: string;
  label: string;
  href: string;
  // What the section contains — surfaced in the UI so the student sees
  // the scope ("180 cards", "200 quiz questions", etc.).
  inventory: string;
  // How much time spent in this section, in seconds.
  totalSeconds: number;
  // Distinct study sessions (events grouped into ~5 min runs).
  sessions: number;
  // For quiz-heavy sections: best score, avg score, attempt count.
  bestScorePct: number | null;
  averageScorePct: number | null;
  attempts: number;
  // "Usage rating" — 0-100 percentage of how complete the student's
  // engagement is with this section's content. Drives the progress bar
  // on each card.
  usagePct: number;
  // Human-readable status: how this section ranks relative to its target.
  status: 'not-started' | 'getting-started' | 'making-progress' | 'on-track' | 'mastered';
}

export async function GET() {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const [timeEvents, quizAttempts] = await Promise.all([
    db.timeEvent.findMany({
      where: { userId: session.id },
      select: { seconds: true, bucket: true, path: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    db.quizAttempt.findMany({
      where: { userId: session.id },
      select: { kind: true, context: true, scorePct: true, completedAt: true },
      orderBy: { completedAt: 'desc' },
    }),
  ]);

  // Aggregate seconds + session count per bucket.
  const bucketSeconds = new Map<string, number>();
  const bucketSessions = new Map<string, number>();
  const SESSION_GAP_MS = 5 * 60 * 1000;
  type Cur = { bucket: string; lastAt: number } | null;
  let cur: Cur = null;
  for (const e of timeEvents) {
    bucketSeconds.set(e.bucket, (bucketSeconds.get(e.bucket) ?? 0) + e.seconds);
    const t = e.createdAt.getTime();
    if (!cur || cur.bucket !== e.bucket || t - cur.lastAt > SESSION_GAP_MS) {
      bucketSessions.set(e.bucket, (bucketSessions.get(e.bucket) ?? 0) + 1);
    }
    cur = { bucket: e.bucket, lastAt: t };
  }

  // Best + avg + count of quiz attempts, segmented by kind.
  const chapterAttempts = quizAttempts.filter(a => a.kind === 'chapter');
  const mockAttempts    = quizAttempts.filter(a => a.kind === 'mock');

  // For chapter quizzes: best per chapter (matches the grade formula).
  const bestPerChapter = new Map<string, number>();
  for (const a of chapterAttempts) {
    const cur = bestPerChapter.get(a.context) ?? -1;
    if (a.scorePct > cur) bestPerChapter.set(a.context, a.scorePct);
  }

  // Inventory counts for the "scope" badge on each card.
  const totalChapters = CURRICULUM.length;
  const nationalChapters = [...NATIONAL_CONTENT].length;
  const stateChapters = [...STATE_CONTENT].length;
  const totalQuizQuestions = [...NATIONAL_CONTENT, ...STATE_CONTENT]
    .reduce((s, c) => s + c.practice.length, 0);
  const totalFlashcards = GLOSSARY.length;
  const flashcardCategories = new Set(GLOSSARY.map(g => g.category)).size;

  // Build per-section rows.
  const sections: SectionProgress[] = [
    // CHAPTERS — usage = % of chapters with ≥10 min logged
    sectionRow({
      key: 'chapters', label: 'Chapter readings', href: '/course',
      inventory: `${totalChapters} chapters · ${nationalChapters} national + ${stateChapters} Hawaii`,
      totalSeconds: bucketSeconds.get('chapters') ?? 0,
      sessions: bucketSessions.get('chapters') ?? 0,
      // "Chapter touched" = ≥10 min on /course/<slug> or /free/<slug>
      usagePct: chapterUsage(timeEvents, totalChapters),
    }),
    // QUIZZES — usage = % of chapters with a passing quiz attempt + avg score
    quizSectionRow({
      key: 'quizzes', label: 'Chapter quizzes', href: '/quizzes',
      inventory: `${totalQuizQuestions} questions across ${totalChapters} quizzes`,
      totalSeconds: bucketSeconds.get('quizzes') ?? 0,
      sessions: bucketSessions.get('quizzes') ?? 0,
      bestPerChapter, allAttempts: chapterAttempts, totalChapters,
    }),
    // FLASHCARDS
    sectionRow({
      key: 'flashcards', label: 'Flashcards', href: '/flashcards',
      inventory: `${totalFlashcards} terms · ${flashcardCategories} categories`,
      totalSeconds: bucketSeconds.get('flashcards') ?? 0,
      sessions: bucketSessions.get('flashcards') ?? 0,
      // Usage = minutes spent ÷ 90-minute "deep familiarity" target.
      usagePct: Math.min(100, Math.round(((bucketSeconds.get('flashcards') ?? 0) / (90 * 60)) * 100)),
    }),
    // MATH DRILLS
    sectionRow({
      key: 'math', label: 'Math drills', href: '/math',
      inventory: 'Proration, commission, area, LTV, cap rate',
      totalSeconds: bucketSeconds.get('math') ?? 0,
      sessions: bucketSessions.get('math') ?? 0,
      // 45 min target for math fluency.
      usagePct: Math.min(100, Math.round(((bucketSeconds.get('math') ?? 0) / (45 * 60)) * 100)),
    }),
    // GLOSSARY
    sectionRow({
      key: 'glossary', label: 'Glossary', href: '/glossary',
      inventory: `${totalFlashcards} indexed terms · Hawaii flagged`,
      totalSeconds: bucketSeconds.get('glossary') ?? 0,
      sessions: bucketSessions.get('glossary') ?? 0,
      usagePct: Math.min(100, Math.round(((bucketSeconds.get('glossary') ?? 0) / (60 * 60)) * 100)),
    }),
    // TUTOR
    sectionRow({
      key: 'tutor', label: 'AI tutor', href: '/tutor',
      inventory: 'Claude Haiku · Hawaii-trained · 60 questions/hr',
      totalSeconds: bucketSeconds.get('tutor') ?? 0,
      sessions: bucketSessions.get('tutor') ?? 0,
      usagePct: Math.min(100, Math.round((bucketSessions.get('tutor') ?? 0) / 10 * 100)),
    }),
    // MOCK EXAM — usage = highest mock score ÷ 100, but also factors attempts
    mockSectionRow({
      key: 'mock', label: 'Mock exam', href: '/practice',
      inventory: '3 difficulties · 130 questions · PSI-formatted',
      totalSeconds: bucketSeconds.get('practice') ?? 0,
      sessions: bucketSessions.get('practice') ?? 0,
      attempts: mockAttempts,
    }),
  ];

  // Overall composite — average usagePct weighted by section importance.
  const totalUsagePct = Math.round(
    (sections[0].usagePct * 0.30) +  // chapters
    (sections[1].usagePct * 0.30) +  // quizzes
    (sections[6].usagePct * 0.20) +  // mock
    (sections[2].usagePct * 0.08) +  // flashcards
    (sections[3].usagePct * 0.05) +  // math
    (sections[4].usagePct * 0.04) +  // glossary
    (sections[5].usagePct * 0.03)    // tutor
  );

  return NextResponse.json({
    sections,
    totalUsagePct,
    overall: {
      totalSeconds: timeEvents.reduce((s, e) => s + e.seconds, 0),
      sessions: Array.from(bucketSessions.values()).reduce((s, v) => s + v, 0),
      chapterQuizAttempts: chapterAttempts.length,
      mockAttempts: mockAttempts.length,
    },
  });
}

// ── Helpers ────────────────────────────────────────────────────────────

function statusFromUsage(pct: number): SectionProgress['status'] {
  if (pct === 0) return 'not-started';
  if (pct < 20)  return 'getting-started';
  if (pct < 50)  return 'making-progress';
  if (pct < 80)  return 'on-track';
  return 'mastered';
}

function sectionRow(opts: {
  key: string; label: string; href: string; inventory: string;
  totalSeconds: number; sessions: number; usagePct: number;
}): SectionProgress {
  const pct = Math.max(0, Math.min(100, Math.round(opts.usagePct)));
  return {
    ...opts,
    bestScorePct: null,
    averageScorePct: null,
    attempts: 0,
    usagePct: pct,
    status: statusFromUsage(pct),
  };
}

function quizSectionRow(opts: {
  key: string; label: string; href: string; inventory: string;
  totalSeconds: number; sessions: number;
  bestPerChapter: Map<string, number>;
  allAttempts: Array<{ scorePct: number }>;
  totalChapters: number;
}): SectionProgress {
  const bestValues = Array.from(opts.bestPerChapter.values());
  const bestScorePct = bestValues.length > 0 ? Math.max(...bestValues) : null;
  const averageScorePct = bestValues.length > 0
    ? Math.round(bestValues.reduce((s, v) => s + v, 0) / bestValues.length)
    : null;
  // Usage = (chapters quizzed and ≥70%) ÷ total chapters.
  const passedChapters = bestValues.filter(v => v >= 70).length;
  const usagePct = opts.totalChapters > 0 ? Math.round((passedChapters / opts.totalChapters) * 100) : 0;
  return {
    key: opts.key, label: opts.label, href: opts.href, inventory: opts.inventory,
    totalSeconds: opts.totalSeconds,
    sessions: opts.sessions,
    bestScorePct,
    averageScorePct,
    attempts: opts.allAttempts.length,
    usagePct,
    status: statusFromUsage(usagePct),
  };
}

function mockSectionRow(opts: {
  key: string; label: string; href: string; inventory: string;
  totalSeconds: number; sessions: number;
  attempts: Array<{ scorePct: number }>;
}): SectionProgress {
  const scores = opts.attempts.map(a => a.scorePct);
  const best = scores.length > 0 ? Math.max(...scores) : null;
  const avg  = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null;
  // Usage = best mock score / 100 (PSI bar is 75%; 75 score → 75% "usage").
  // If they've taken no mocks, usage = 0 even if they've spent time.
  const usagePct = best ?? 0;
  return {
    key: opts.key, label: opts.label, href: opts.href, inventory: opts.inventory,
    totalSeconds: opts.totalSeconds,
    sessions: opts.sessions,
    bestScorePct: best,
    averageScorePct: avg,
    attempts: opts.attempts.length,
    usagePct,
    status: statusFromUsage(usagePct),
  };
}

// % of chapters where the student has logged ≥10 minutes
function chapterUsage(events: Array<{ path: string; seconds: number }>, totalChapters: number): number {
  const perChapter = new Map<string, number>();
  for (const e of events) {
    // Match either /course/<slug> or /free/<slug>; ignore non-chapter paths.
    const m = e.path.match(/^\/(?:course|free)\/([a-z0-9-]+)/);
    if (!m) continue;
    perChapter.set(m[1], (perChapter.get(m[1]) ?? 0) + e.seconds);
  }
  const touched = Array.from(perChapter.values()).filter(s => s >= 10 * 60).length;
  return totalChapters > 0 ? Math.round((touched / totalChapters) * 100) : 0;
}
