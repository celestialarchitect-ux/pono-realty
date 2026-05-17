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

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      passwordHash,
      ...(markVerified ? { emailVerifiedAt: new Date() } : {}),
    },
    create: {
      email: email.toLowerCase(),
      passwordHash,
      firstName: 'Zachariah',
      lastName: 'Kalahiki',
      name: 'Zachariah Kalahiki',
      isAdmin: true,
      roles: ['admin'],
      tier: 'plus',
      emailVerifiedAt: markVerified ? new Date() : null,
    },
    select: { id: true, email: true, name: true, tier: true, emailVerifiedAt: true, createdAt: true, isAdmin: true },
  });

  return NextResponse.json({
    ok: true,
    action: 'upserted',
    user,
  });
}
