// Prisma client singleton. Lazy DB connection — never crash at import time
// if DATABASE_URL is missing (per project deployment rules). Routes that
// need the DB call dbAvailable() first and return a graceful 503 otherwise.

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __rfsPrisma: PrismaClient | undefined;
}

function makeClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const db: PrismaClient | null =
  globalThis.__rfsPrisma ?? makeClient();

if (process.env.NODE_ENV !== 'production' && db) {
  globalThis.__rfsPrisma = db;
}

export function dbAvailable(): boolean {
  return db !== null;
}
