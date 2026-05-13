// ABOUTME: Record a quiz submission — one QuizAttempt row + N QuizAnswer rows.
// ABOUTME: Powers both the admin analytics dossier and the composite student grade.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured, getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AnswerPayload {
  questionId: string;
  variantIndex: number;
  selectedIndex: number;
  correct: boolean;
  correctIndex: number;
}

interface AttemptPayload {
  kind?: 'chapter' | 'mock';
  context: string;           // chapter slug OR 'mock-national' etc.
  answers: AnswerPayload[];
}

export async function POST(req: NextRequest) {
  if (!authConfigured() || !db) return NextResponse.json({ error: 'auth_unavailable' }, { status: 503 });
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: AttemptPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const kind = body.kind === 'mock' ? 'mock' : 'chapter';
  const context = typeof body.context === 'string' ? body.context : '';
  const answers = Array.isArray(body.answers) ? body.answers : [];
  if (!context || answers.length === 0) {
    return NextResponse.json({ error: 'invalid_payload', message: 'context and answers required' }, { status: 400 });
  }
  if (answers.length > 200) {
    return NextResponse.json({ error: 'too_many_answers' }, { status: 400 });
  }

  // Validate each answer is shaped correctly + within sane bounds.
  const cleanAnswers: AnswerPayload[] = [];
  for (const a of answers) {
    if (
      !a || typeof a !== 'object' ||
      typeof a.questionId !== 'string' || a.questionId.length === 0 || a.questionId.length > 80 ||
      typeof a.variantIndex !== 'number' || a.variantIndex < 0 || a.variantIndex > 49 ||
      typeof a.selectedIndex !== 'number' || a.selectedIndex < 0 || a.selectedIndex > 3 ||
      typeof a.correctIndex !== 'number' || a.correctIndex < 0 || a.correctIndex > 3 ||
      typeof a.correct !== 'boolean'
    ) {
      return NextResponse.json({ error: 'invalid_answer_row' }, { status: 400 });
    }
    cleanAnswers.push({
      questionId: a.questionId,
      variantIndex: Math.floor(a.variantIndex),
      selectedIndex: Math.floor(a.selectedIndex),
      correctIndex: Math.floor(a.correctIndex),
      correct: a.correct,
    });
  }

  const totalQuestions = cleanAnswers.length;
  const correctCount = cleanAnswers.filter(a => a.correct).length;
  const scorePct = Math.round((correctCount / totalQuestions) * 100);

  // One QuizAttempt + N QuizAnswer rows in a single transaction so the
  // analytics dossier never sees a half-recorded attempt.
  const attempt = await db.quizAttempt.create({
    data: {
      userId: session.id,
      kind,
      context,
      totalQuestions,
      correctCount,
      scorePct,
      answers: {
        create: cleanAnswers.map(a => ({
          questionId: a.questionId,
          variantIndex: a.variantIndex,
          selectedIndex: a.selectedIndex,
          correct: a.correct,
          correctIndex: a.correctIndex,
        })),
      },
    },
    select: { id: true, scorePct: true, correctCount: true, totalQuestions: true },
  });

  return NextResponse.json({
    ok: true,
    attempt,
  });
}
