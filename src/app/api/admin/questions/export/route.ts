// ABOUTME: Streams the full question bank as a CSV so admins can review variants offline (Excel / Sheets).
// ABOUTME: One row per VARIANT (not per question) so reviewers can flag specific variants by exact wording.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';
import { CURRICULUM } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { TOUGH_BANK } from '@/lib/content/exam-tough';
import { wrapAsVariantQuestions, mergeVariantPool } from '@/lib/content/question-variants';
import { VARIANT_POOL } from '@/lib/content/variant-pool';
import { applyOverrideToVariant } from '@/lib/content/effective-variants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Excel-safe CSV escape: wrap in double quotes, escape internal quotes by doubling.
function csv(field: string | number | boolean | null | undefined): string {
  if (field === null || field === undefined) return '';
  const s = String(field);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!authConfigured()) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!session.isAdmin && !hasRole(session, 'instructor') && !hasRole(session, 'content')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Pull every admin override once so the export reflects live state.
  // If db isn't available (auth-only mode), the map is empty and we fall
  // through to the static pool — same behavior as before.
  const overrideMap = new Map<string, { q: string; optionsJson: string; correctIndex: number; explain: string }>();
  if (db) {
    const rows = await db.questionVariantOverride.findMany({
      select: { questionId: true, variantIndex: true, q: true, optionsJson: true, correctIndex: true, explain: true },
    });
    for (const r of rows) overrideMap.set(`${r.questionId}#${r.variantIndex}`, r);
  }

  const lines: string[] = [];
  // Header row
  lines.push([
    'chapter_number', 'chapter_slug', 'chapter_title', 'portion',
    'question_id', 'variant_index', 'variant_kind',
    'question_text', 'option_a', 'option_b', 'option_c', 'option_d',
    'correct_letter', 'correct_text', 'explanation', 'edited',
  ].map(csv).join(','));

  for (const meta of CURRICULUM) {
    const content = [...NATIONAL_CONTENT, ...STATE_CONTENT].find(c => c.slug === meta.slug);
    if (!content) continue;
    const base = wrapAsVariantQuestions(content.practice, meta.slug);
    const expanded = mergeVariantPool(base, VARIANT_POOL);
    for (const vq of expanded) {
      vq.variants.forEach((v, i) => {
        const ov = overrideMap.get(`${vq.id}#${i}`);
        const effective = applyOverrideToVariant(v, ov);
        const correctLetter = ['A', 'B', 'C', 'D'][effective.correctIndex];
        lines.push([
          meta.number,
          meta.slug,
          meta.title,
          meta.portion,
          vq.id,
          i,
          i === 0 ? 'original' : 'generated',
          effective.q,
          effective.options[0],
          effective.options[1],
          effective.options[2],
          effective.options[3],
          correctLetter,
          effective.options[effective.correctIndex],
          effective.explain,
          ov ? 'yes' : '',
        ].map(csv).join(','));
      });
    }
  }

  // Tough bank — Hard/Gnarly mock-only items get their own rows
  const toughHash = (s: string): string => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) + s.charCodeAt(i);
      h |= 0;
    }
    return `tough-${Math.abs(h).toString(36).slice(0, 7)}`;
  };
  for (const t of TOUGH_BANK) {
    const tid = toughHash(t.q);
    const ov = overrideMap.get(`${tid}#0`);
    const eff = applyOverrideToVariant({ q: t.q, options: t.options as unknown as string[], correctIndex: t.correctIndex, explain: t.explain }, ov);
    const correctLetter = ['A', 'B', 'C', 'D'][eff.correctIndex];
    lines.push([
      0, // chapter_number 0 = tough bank
      t.chapterSlug,
      `Tough Bank · ${t.portion === 'state' ? 'Hawaii' : 'National'} · ${t.difficulty}`,
      t.portion,
      tid,
      0,
      `tough-${t.difficulty}`,
      eff.q,
      eff.options[0],
      eff.options[1],
      eff.options[2],
      eff.options[3],
      correctLetter,
      eff.options[eff.correctIndex],
      eff.explain,
      ov ? 'yes' : '',
    ].map(csv).join(','));
  }

  const body = lines.join('\r\n') + '\r\n';
  const filename = `rfa-question-bank-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
