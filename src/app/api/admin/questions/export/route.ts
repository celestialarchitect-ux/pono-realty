// ABOUTME: Streams the full question bank as a CSV so admins can review variants offline (Excel / Sheets).
// ABOUTME: One row per VARIANT (not per question) so reviewers can flag specific variants by exact wording.

import { NextResponse } from 'next/server';
import { authConfigured, getSessionUser, hasRole } from '@/lib/auth';
import { CURRICULUM } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { TOUGH_BANK } from '@/lib/content/exam-tough';
import { wrapAsVariantQuestions, mergeVariantPool } from '@/lib/content/question-variants';
import { VARIANT_POOL } from '@/lib/content/variant-pool';

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

  const lines: string[] = [];
  // Header row
  lines.push([
    'chapter_number', 'chapter_slug', 'chapter_title', 'portion',
    'question_id', 'variant_index', 'variant_kind',
    'question_text', 'option_a', 'option_b', 'option_c', 'option_d',
    'correct_letter', 'correct_text', 'explanation',
  ].map(csv).join(','));

  for (const meta of CURRICULUM) {
    const content = [...NATIONAL_CONTENT, ...STATE_CONTENT].find(c => c.slug === meta.slug);
    if (!content) continue;
    const base = wrapAsVariantQuestions(content.practice, meta.slug);
    const expanded = mergeVariantPool(base, VARIANT_POOL);
    for (const vq of expanded) {
      vq.variants.forEach((v, i) => {
        const correctLetter = ['A', 'B', 'C', 'D'][v.correctIndex];
        lines.push([
          meta.number,
          meta.slug,
          meta.title,
          meta.portion,
          vq.id,
          i,
          i === 0 ? 'original' : 'generated',
          v.q,
          v.options[0],
          v.options[1],
          v.options[2],
          v.options[3],
          correctLetter,
          v.options[v.correctIndex],
          v.explain,
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
    const correctLetter = ['A', 'B', 'C', 'D'][t.correctIndex];
    lines.push([
      0, // chapter_number 0 = tough bank
      t.chapterSlug,
      `Tough Bank · ${t.portion === 'state' ? 'Hawaii' : 'National'} · ${t.difficulty}`,
      t.portion,
      toughHash(t.q),
      0,
      `tough-${t.difficulty}`,
      t.q,
      t.options[0],
      t.options[1],
      t.options[2],
      t.options[3],
      correctLetter,
      t.options[t.correctIndex],
      t.explain,
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
