// ABOUTME: Returns the effective variant pool for one chapter — static + DB overrides.
// ABOUTME: Quiz page calls this on mount so admin edits land for students immediately.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';
import { getEffectiveVariantsForChapter } from '@/lib/content/effective-variants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug || !/^[a-z][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ error: 'invalid_slug' }, { status: 400 });
  }

  const { questions } = await getEffectiveVariantsForChapter(db, slug);
  if (questions.length === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json({
    chapterSlug: slug,
    questions: questions.map(q => ({
      id: q.id,
      concept: q.concept,
      variants: q.variants.map((v, i) => ({
        index: i,
        q: v.q,
        options: v.options,
        correctIndex: v.correctIndex,
        explain: v.explain,
      })),
    })),
  });
}
