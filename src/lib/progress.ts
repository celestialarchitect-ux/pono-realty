// Course progress tracking — localStorage-backed.
// Two phases: reading (Phase 1) and quizzing (Phase 2).

export interface ChapterProgress {
  slug: string;
  startedAt?: number;
  readCompletedAt?: number;     // finished reading the chapter
  quizCompletedAt?: number;     // passed the chapter quiz
  quizScore?: number;            // best quiz score 0-100
  quizAttempts: number;
}

export interface CourseProgress {
  enrolledAt: number;
  lastReadChapter?: string;
  lastQuizChapter?: string;
  chapters: Record<string, ChapterProgress>;
}

const STORAGE_KEY = 'ralph-course-progress-v2';

export function loadProgress(): CourseProgress {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return emptyProgress();
}

export function saveProgress(p: CourseProgress): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

export function emptyProgress(): CourseProgress {
  return { enrolledAt: Date.now(), chapters: {} };
}

export function getChapterProgress(p: CourseProgress, slug: string): ChapterProgress {
  return p.chapters[slug] || { slug, quizAttempts: 0 };
}

export function markChapterRead(slug: string): CourseProgress {
  const p = loadProgress();
  const ch = getChapterProgress(p, slug);
  if (!ch.startedAt) ch.startedAt = Date.now();
  ch.readCompletedAt = Date.now();
  p.chapters[slug] = ch;
  p.lastReadChapter = slug;
  saveProgress(p);
  return p;
}

export function markQuizComplete(slug: string, score: number): CourseProgress {
  const p = loadProgress();
  const ch = getChapterProgress(p, slug);
  ch.quizScore = Math.max(ch.quizScore || 0, score);
  ch.quizAttempts = ch.quizAttempts + 1;
  if (score >= 70 && !ch.quizCompletedAt) ch.quizCompletedAt = Date.now();
  p.chapters[slug] = ch;
  p.lastQuizChapter = slug;
  saveProgress(p);
  return p;
}

export function isChapterRead(p: CourseProgress, slug: string): boolean {
  return !!p.chapters[slug]?.readCompletedAt;
}

export function isQuizPassed(p: CourseProgress, slug: string): boolean {
  return !!p.chapters[slug]?.quizCompletedAt;
}

export function readingPct(p: CourseProgress, totalChapters: number): number {
  const completed = Object.values(p.chapters).filter(c => c.readCompletedAt).length;
  return Math.round((completed / totalChapters) * 100);
}

export function quizzingPct(p: CourseProgress, totalChapters: number): number {
  const completed = Object.values(p.chapters).filter(c => c.quizCompletedAt).length;
  return Math.round((completed / totalChapters) * 100);
}
