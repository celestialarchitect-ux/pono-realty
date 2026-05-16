// ONE-SHOT ADMIN PASSWORD RESET — remove this file after use
// Auth via ADMIN_RESET_KEY env var, restricted to emails in ADMIN_EMAILS
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-reset-key');
  const expected = process.env.ADMIN_RESET_KEY;

  if (!expected || !secret || secret !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { email?: string; newPassword?: string; markVerified?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const { email, newPassword, markVerified } = body;
  if (!email || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'missing email or password (min 8 chars)' }, { status: 400 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase());
  if (!adminEmails.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'email not in ADMIN_EMAILS allowlist' }, { status: 403 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'no account with that email — sign up first' }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: {
      passwordHash,
      ...(markVerified && !existing.emailVerifiedAt ? { emailVerifiedAt: new Date() } : {}),
    },
    select: { id: true, email: true, name: true, tier: true, emailVerifiedAt: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    action: 'updated',
    user: updated,
  });
}
