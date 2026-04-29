// Course progress tracking — localStorage-backed for now.
// Tracks which chapters/lessons are complete and which quiz scores.

export interface ChapterProgress {
  slug: string;
  startedAt?: number;
  completedAt?: number;
  lessonsCompleted: string[]; // 'overview' | 'concepts' | 'quiz'
  quizScore?: number;          // 0-100 last quiz attempt
  quizAttempts: number;
}

export interface CourseProgress {
  enrolledAt: number;
  lastChapter?: string;
  chapters: Record<string, ChapterProgress>;
}

const STORAGE_KEY = 'ralph-course-progress';

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
  return p.chapters[slug] || { slug, lessonsCompleted: [], quizAttempts: 0 };
}

export function markLessonComplete(slug: string, lesson: 'overview' | 'concepts' | 'quiz', extra?: { quizScore?: number }): CourseProgress {
  const p = loadProgress();
  const ch = getChapterProgress(p, slug);
  if (!ch.startedAt) ch.startedAt = Date.now();
  if (!ch.lessonsCompleted.includes(lesson)) ch.lessonsCompleted = [...ch.lessonsCompleted, lesson];
  if (lesson === 'quiz' && extra?.quizScore != null) {
    ch.quizScore = Math.max(ch.quizScore || 0, extra.quizScore);
    ch.quizAttempts = ch.quizAttempts + 1;
  }
  if (ch.lessonsCompleted.length >= 3 && !ch.completedAt) ch.completedAt = Date.now();
  p.chapters[slug] = ch;
  p.lastChapter = slug;
  saveProgress(p);
  return p;
}

export function isChapterComplete(p: CourseProgress, slug: string): boolean {
  const ch = p.chapters[slug];
  return !!ch?.completedAt;
}

export function chapterPct(p: CourseProgress, slug: string): number {
  const ch = p.chapters[slug];
  if (!ch) return 0;
  return Math.round((ch.lessonsCompleted.length / 3) * 100);
}

export function overallPct(p: CourseProgress, totalChapters: number): number {
  const completed = Object.values(p.chapters).filter(c => c.completedAt).length;
  return Math.round((completed / totalChapters) * 100);
}
