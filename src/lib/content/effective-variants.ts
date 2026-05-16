// ABOUTME: Server-only helper. Returns the static variant pool merged with DB-level admin overrides.
// ABOUTME: Used by /api/quiz/variants (student-facing) and /api/admin/questions (admin dossier).

import type { PrismaClient } from '@prisma/client';
import type { VariantQ } from './question-variants';
import { wrapAsVariantQuestions, mergeVariantPool } from './question-variants';
import { VARIANT_POOL } from './variant-pool';
import { NATIONAL_CONTENT } from './national';
import { STATE_CONTENT } from './state';
import { CURRICULUM } from '../curriculum';

export interface OverrideInfo {
  questionId: string;
  variantIndex: number;
  editedById: string;
  editorName: string | null;
  reason: string | null;
  updatedAt: string;
}

export interface EffectiveVariantsResult {
  questions: VariantQ[];
  // Overrides discovered for this chapter — admin dossier uses them to
  // render the 'edited' badge next to variants that have been changed.
  overrides: OverrideInfo[];
}

// Returns variants for a single chapter slug, with overrides applied.
// Overrides are keyed by (questionId, variantIndex). When an override
// exists, the variant at that position in the array is REPLACED — the
// variantIndex stays the same so historical QuizAnswer rows still resolve.
export async function getEffectiveVariantsForChapter(
  db: PrismaClient,
  chapterSlug: string,
): Promise<EffectiveVariantsResult> {
  const content = [...NATIONAL_CONTENT, ...STATE_CONTENT].find(c => c.slug === chapterSlug);
  if (!content) return { questions: [], overrides: [] };

  // Build the static merged pool (originals + variant-pool.ts entries).
  const base = wrapAsVariantQuestions(content.practice, chapterSlug);
  const merged = mergeVariantPool(base, VARIANT_POOL);

  // Pull every override row for this chapter's questions in one query.
  const questionIds = merged.map(vq => vq.id);
  const overrides = await db.questionVariantOverride.findMany({
    where: { questionId: { in: questionIds } },
    include: {
      editor: { select: { name: true, firstName: true } },
    },
  });

  // Build a (questionId#variantIndex) → override lookup
  const overrideByKey = new Map<string, typeof overrides[number]>();
  for (const o of overrides) overrideByKey.set(`${o.questionId}#${o.variantIndex}`, o);

  // Apply overrides in place. We keep the array shape (same length, same
  // variantIndex positions) so picked-variant indices remain stable for
  // historical analytics.
  const applied: VariantQ[] = merged.map(vq => ({
    ...vq,
    variants: vq.variants.map((v, i) => {
      const o = overrideByKey.get(`${vq.id}#${i}`);
      if (!o) return v;
      let options: [string, string, string, string];
      try {
        const parsed = JSON.parse(o.optionsJson);
        if (Array.isArray(parsed) && parsed.length === 4 && parsed.every(x => typeof x === 'string')) {
          options = parsed as [string, string, string, string];
        } else {
          return v; // malformed override JSON — fall back to original
        }
      } catch {
        return v;
      }
      return {
        q: o.q,
        options,
        correctIndex: (o.correctIndex >= 0 && o.correctIndex <= 3 ? o.correctIndex : v.correctIndex) as 0 | 1 | 2 | 3,
        explain: o.explain,
      };
    }),
  }));

  return {
    questions: applied,
    overrides: overrides.map(o => ({
      questionId: o.questionId,
      variantIndex: o.variantIndex,
      editedById: o.editedById,
      editorName: o.editor.name || o.editor.firstName || null,
      reason: o.reason,
      updatedAt: o.updatedAt.toISOString(),
    })),
  };
}

// Same idea but returns a flat lookup map of overrides keyed by
// (questionId, variantIndex). Used by /api/admin/questions to attach
// override metadata to every variant in the response.
export async function getAllOverrides(db: PrismaClient): Promise<Map<string, OverrideInfo>> {
  const overrides = await db.questionVariantOverride.findMany({
    include: { editor: { select: { name: true, firstName: true } } },
  });
  const m = new Map<string, OverrideInfo>();
  for (const o of overrides) {
    m.set(`${o.questionId}#${o.variantIndex}`, {
      questionId: o.questionId,
      variantIndex: o.variantIndex,
      editedById: o.editedById,
      editorName: o.editor.name || o.editor.firstName || null,
      reason: o.reason,
      updatedAt: o.updatedAt.toISOString(),
    });
  }
  return m;
}

// Apply an override on top of a single variant — used inline by the
// quiz history resolver and other code paths that already have the
// override map in hand.
export function applyOverrideToVariant(
  variant: { q: string; options: readonly [string, string, string, string] | string[]; correctIndex: number; explain: string },
  override: { q: string; optionsJson: string; correctIndex: number; explain: string } | undefined,
): typeof variant {
  if (!override) return variant;
  try {
    const opts = JSON.parse(override.optionsJson);
    if (Array.isArray(opts) && opts.length === 4 && opts.every(x => typeof x === 'string')) {
      return {
        q: override.q,
        options: opts,
        correctIndex: override.correctIndex,
        explain: override.explain,
      };
    }
  } catch { /* fall through */ }
  return variant;
}

// Reuse the same logic for the curriculum-wide admin export
export { CURRICULUM };
