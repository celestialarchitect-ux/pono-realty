// ABOUTME: Variant infrastructure — same concept, different wording per attempt.
// ABOUTME: Wraps existing PracticeQ objects as single-variant entries; serves random variants on retake.

import type { PracticeQ } from './national';

// A stable identifier for a question concept. Same value across all variants
// of "what is the maximum security deposit in Hawaii?". Used for analytics
// rollups in the admin dossier — "33% of students get hi-deposit-cap wrong"
// is meaningful only when variants are grouped.
export type QuestionId = string;

// A single variant of a question. Same shape as PracticeQ.
export type Variant = PracticeQ;

// A question that may have one or many variants. Backward-compatible —
// the existing question banks are migrated by wrapping each PracticeQ in
// a single-element variants array. Variant generation populates 4-9 more.
export interface VariantQ {
  id: QuestionId;
  // Concept label for the admin analytics view ("Encroachment basics",
  // "Joint tenancy survivorship", etc.). Optional; defaults to the
  // truncated original question text if not provided.
  concept?: string;
  variants: Variant[];
}

// Deterministic pick: given a user + attempt number + question, returns
// the same variant for the same (user, question, attempt) tuple — so a
// student can refresh during a quiz without the questions changing under
// them, but a NEW attempt gives a different variant.
//
// Why string-hash instead of Math.random()? Stable across page reloads
// and re-mounts (no flicker), trivially reproducible for analytics, and
// guarantees variant exposure spreads across the variant pool as attempts
// accumulate.
export function pickVariant(q: VariantQ, attemptSalt: string): { variantIndex: number; variant: Variant } {
  if (q.variants.length === 0) {
    throw new Error(`VariantQ ${q.id} has no variants`);
  }
  if (q.variants.length === 1) {
    return { variantIndex: 0, variant: q.variants[0] };
  }
  const idx = stableHash(`${q.id}:${attemptSalt}`) % q.variants.length;
  return { variantIndex: idx, variant: q.variants[idx] };
}

// Simple djb2 hash → unsigned int. Good enough for variant selection.
function stableHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
    h |= 0; // force 32-bit
  }
  return Math.abs(h);
}

// Generate a stable question ID from chapter slug + question index, for
// auto-migration of existing PracticeQ[] arrays. Format: "<slug>-q<NN>".
export function autoQuestionId(chapterSlug: string, questionIndex: number): QuestionId {
  return `${chapterSlug}-q${questionIndex.toString().padStart(2, '0')}`;
}

// Convert a plain PracticeQ[] (legacy shape) to VariantQ[] (one variant each).
// Lets the quiz page and analytics treat all questions uniformly.
export function wrapAsVariantQuestions(
  practice: PracticeQ[],
  chapterSlug: string,
): VariantQ[] {
  return practice.map((p, i) => ({
    id: autoQuestionId(chapterSlug, i),
    concept: truncate(p.q, 60),
    variants: [p],
  }));
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

// Add additional variants to a question by ID. Used by the variant-pool
// data file (added in a follow-up commit) to expand questions to 5-10
// variants each without touching the original chapter files.
//
// Variants are merged in order — original variant always stays at index 0
// for stability. If the same question ID appears in the variant pool
// multiple times, all variants are concatenated.
export function mergeVariantPool(
  base: VariantQ[],
  pool: Record<QuestionId, Variant[]>,
): VariantQ[] {
  return base.map(q => {
    const extra = pool[q.id];
    if (!extra || extra.length === 0) return q;
    return { ...q, variants: [...q.variants, ...extra] };
  });
}
