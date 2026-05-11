// Session auth — JWT in httpOnly cookie. No NextAuth dependency.
// Designed to fail closed: if SESSION_SECRET is missing, every protected route
// returns 503 rather than silently issuing forgeable tokens.

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { db } from './db';

const COOKIE_NAME = 'rfs_session';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const JWT_ALG = 'HS256';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  tier: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

function getSecret(): Uint8Array | null {
  const raw = process.env.SESSION_SECRET;
  if (!raw || raw.length < 24) return null;
  return new TextEncoder().encode(raw);
}

export function authConfigured(): boolean {
  return getSecret() !== null && db !== null;
}

// Password helpers
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 12);
}
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

// JWT helpers
async function sign(payload: { sub: string; email: string }): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error('SESSION_SECRET not set');
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

async function verify(token: string): Promise<JwtPayload | null> {
  try {
    const secret = getSecret();
    if (!secret) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string, email: string): Promise<void> {
  const token = await sign({ sub: userId, email });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!authConfigured() || !db) return null;
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = await verify(token);
    if (!payload?.sub) return null;
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, isAdmin: true, tier: true },
    });
    return user;
  } catch {
    return null;
  }
}

// Bump lastSeenAt; cheap, no error if it fails.
export async function touchLastSeen(userId: string): Promise<void> {
  if (!db) return;
  try {
    await db.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
  } catch {
    /* swallow */
  }
}

// Admin gate: if ADMIN_EMAILS env var lists the user's email at signup,
// they get isAdmin = true on creation.
export function isBootstrapAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  return list.includes(email.toLowerCase());
}
