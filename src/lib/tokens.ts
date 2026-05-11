// Secure single-use email tokens for verify + reset flows.
// Tokens are returned in plaintext to the caller (for emailing) but stored as
// SHA-256 hashes in the DB so a DB leak yields no live tokens.

import { randomBytes, createHash } from 'crypto';
import { db } from './db';

export type TokenPurpose = 'verify' | 'reset';

const TTL_MS: Record<TokenPurpose, number> = {
  verify: 24 * 60 * 60 * 1000, // 24 hours
  reset:  60 * 60 * 1000,      // 1 hour
};

export function generateToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createEmailToken(userId: string, purpose: TokenPurpose): Promise<{ token: string } | null> {
  if (!db) return null;
  const { token, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + TTL_MS[purpose]);
  // Invalidate any prior un-used token of the same purpose for this user
  await db.emailToken.updateMany({
    where: { userId, purpose, usedAt: null },
    data: { usedAt: new Date() },
  });
  await db.emailToken.create({
    data: { userId, purpose, tokenHash, expiresAt },
  });
  return { token };
}

export async function consumeEmailToken(token: string, purpose: TokenPurpose): Promise<{ userId: string } | null> {
  if (!db) return null;
  const tokenHash = hashToken(token);
  const record = await db.emailToken.findUnique({ where: { tokenHash } });
  if (!record) return null;
  if (record.purpose !== purpose) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;
  await db.emailToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  return { userId: record.userId };
}
