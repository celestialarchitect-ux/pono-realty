// Client-side study time tracking — Hawaii state law requires 60 hours of
// pre-license study before a candidate is eligible to sit the PSI exam.
// Per-device tracking via localStorage until full account auth is wired.

export const STATE_LAW_HOURS_REQUIRED = 60;
export const STORAGE_KEY = 'rfs:time-log:v1';
export const IDLE_THRESHOLD_SECONDS = 120; // 2 min of no activity = idle
export const TICK_SECONDS = 5;

export interface TimeLog {
  totalSeconds: number;
  byPath: Record<string, number>;
  startedAt: string;   // ISO of first ever session
  lastSavedAt: string;
  deviceId: string;
  // Aggregated buckets for the profile view
  byBucket: {
    chapters: number;     // /course, /course/[slug], /free, /free/[slug]
    flashcards: number;   // /flashcards
    math: number;         // /math
    glossary: number;     // /glossary
    quizzes: number;      // /quizzes, /quizzes/[slug]
    tutor: number;        // /tutor
    practice: number;     // /practice
    other: number;
  };
}

export function emptyLog(): TimeLog {
  const now = new Date().toISOString();
  return {
    totalSeconds: 0,
    byPath: {},
    startedAt: now,
    lastSavedAt: now,
    deviceId: makeDeviceId(),
    byBucket: { chapters: 0, flashcards: 0, math: 0, glossary: 0, quizzes: 0, tutor: 0, practice: 0, other: 0 },
  };
}

function makeDeviceId(): string {
  // Short, stable per-device identifier; no PII
  const rand = () => Math.random().toString(36).slice(2, 10);
  return `dev_${Date.now().toString(36)}_${rand()}`;
}

export function loadLog(): TimeLog {
  if (typeof window === 'undefined') return emptyLog();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyLog();
    const parsed = JSON.parse(raw) as Partial<TimeLog>;
    return {
      totalSeconds: parsed.totalSeconds ?? 0,
      byPath: parsed.byPath ?? {},
      startedAt: parsed.startedAt ?? new Date().toISOString(),
      lastSavedAt: parsed.lastSavedAt ?? new Date().toISOString(),
      deviceId: parsed.deviceId ?? makeDeviceId(),
      byBucket: {
        chapters: parsed.byBucket?.chapters ?? 0,
        flashcards: parsed.byBucket?.flashcards ?? 0,
        math: parsed.byBucket?.math ?? 0,
        glossary: parsed.byBucket?.glossary ?? 0,
        quizzes: parsed.byBucket?.quizzes ?? 0,
        tutor: parsed.byBucket?.tutor ?? 0,
        practice: parsed.byBucket?.practice ?? 0,
        other: parsed.byBucket?.other ?? 0,
      },
    };
  } catch {
    return emptyLog();
  }
}

export function saveLog(log: TimeLog): void {
  if (typeof window === 'undefined') return;
  try {
    log.lastSavedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // localStorage may be full or disabled; silently no-op
  }
}

export function pathToBucket(path: string): keyof TimeLog['byBucket'] {
  if (path === '/free' || path.startsWith('/free/')) return 'chapters';
  if (path === '/course' || path.startsWith('/course/')) return 'chapters';
  if (path.startsWith('/flashcards')) return 'flashcards';
  if (path.startsWith('/math')) return 'math';
  if (path.startsWith('/glossary')) return 'glossary';
  if (path.startsWith('/quizzes')) return 'quizzes';
  if (path.startsWith('/tutor')) return 'tutor';
  if (path.startsWith('/practice')) return 'practice';
  return 'other';
}

export function addSeconds(log: TimeLog, path: string, seconds: number): TimeLog {
  const next: TimeLog = {
    ...log,
    totalSeconds: log.totalSeconds + seconds,
    byPath: { ...log.byPath, [path]: (log.byPath[path] ?? 0) + seconds },
    byBucket: { ...log.byBucket },
  };
  const bucket = pathToBucket(path);
  next.byBucket[bucket] = (log.byBucket[bucket] ?? 0) + seconds;
  return next;
}

export function formatDuration(totalSeconds: number, style: 'long' | 'short' = 'long'): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (style === 'short') {
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  }
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hour${h === 1 ? '' : 's'}`);
  if (m > 0) parts.push(`${m} min`);
  if (parts.length === 0) parts.push(`${s} sec`);
  return parts.join(' ');
}

export function hoursDecimal(totalSeconds: number): number {
  return Math.round((totalSeconds / 3600) * 10) / 10;
}

export function progressTo60(totalSeconds: number): { hours: number; pct: number; remainingSeconds: number; unlocked: boolean } {
  const hours = hoursDecimal(totalSeconds);
  const required = STATE_LAW_HOURS_REQUIRED * 3600;
  return {
    hours,
    pct: Math.min(100, Math.round((totalSeconds / required) * 1000) / 10),
    remainingSeconds: Math.max(0, required - totalSeconds),
    unlocked: totalSeconds >= required,
  };
}

// Dev/admin override — lets QA bypass the 60-hour gate by setting localStorage flag.
// Toggle in browser console: localStorage.setItem('rfs:unlock-override','1')
export function hasUnlockOverride(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('rfs:unlock-override') === '1';
  } catch {
    return false;
  }
}
