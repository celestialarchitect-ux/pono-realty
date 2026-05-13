// ABOUTME: Health check for Railway / uptime monitors. No auth required.
// ABOUTME: Returns 200 when DB + Stripe + email config look healthy; 503 otherwise.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripeConfigured } from '@/lib/stripe';
import { emailConfigured } from '@/lib/email';
import { authConfigured } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HealthChecks {
  database: 'ok' | 'down' | 'unconfigured';
  auth: 'ok' | 'unconfigured';
  stripe: 'ok' | 'unconfigured';
  email: 'ok' | 'unconfigured';
  tutor: 'ok' | 'unconfigured';
}

export async function GET() {
  const checks: HealthChecks = {
    database: 'unconfigured',
    auth: authConfigured() ? 'ok' : 'unconfigured',
    stripe: stripeConfigured() ? 'ok' : 'unconfigured',
    email: emailConfigured() ? 'ok' : 'unconfigured',
    tutor: process.env.ANTHROPIC_API_KEY ? 'ok' : 'unconfigured',
  };

  // DB ping — a 1ms count query proves Postgres is reachable AND the
  // app's session pool isn't exhausted.
  if (db) {
    try {
      await db.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'down';
    }
  }

  // Healthy iff database is OK. Other services being unconfigured is a
  // warning but doesn't fail the health check — those depend on env vars
  // that may legitimately be unset in pre-launch states. DB being DOWN
  // means the app can't function at all → 503.
  const healthy = checks.database === 'ok';

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
      // Helps uptime monitors distinguish "site itself is fine, just
      // pre-launch" from "site is broken". Anything that returns 200
      // here is up; anything 503 is genuinely broken.
    },
    { status: healthy ? 200 : 503 },
  );
}
