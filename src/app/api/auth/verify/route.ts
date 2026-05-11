import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authConfigured } from '@/lib/auth';
import { consumeEmailToken } from '@/lib/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET-based confirm — link from email lands here. Redirects to /verify-email
// with status query so the page can render success / failure.
export async function GET(req: NextRequest) {
  if (!authConfigured() || !db) {
    return NextResponse.redirect(new URL('/verify-email?status=unavailable', req.url));
  }
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/verify-email?status=missing', req.url));

  const consumed = await consumeEmailToken(token, 'verify');
  if (!consumed) {
    return NextResponse.redirect(new URL('/verify-email?status=invalid', req.url));
  }
  await db.user.update({
    where: { id: consumed.userId },
    data: { emailVerifiedAt: new Date() },
  });
  return NextResponse.redirect(new URL('/verify-email?status=ok', req.url));
}
