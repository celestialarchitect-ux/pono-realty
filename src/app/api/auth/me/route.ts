import { NextResponse } from 'next/server';
import { getSessionUser, authConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!authConfigured()) {
    return NextResponse.json({ user: null, authConfigured: false }, { status: 200 });
  }
  const user = await getSessionUser();
  return NextResponse.json({ user, authConfigured: true });
}
