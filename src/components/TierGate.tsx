'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { T } from '@/lib/theme';

type Requirement = 'auth' | 'paid' | 'admin';

interface AuthMeUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  tier: string;
  emailVerified?: boolean;
}

interface AuthMeResponse {
  user: AuthMeUser | null;
  authConfigured: boolean;
}

const PAID_TIERS = new Set(['standard', 'plus', 'solo']);

interface TierGateProps {
  require: Requirement;
  children: React.ReactNode;
}

// Client-side enforcement that complements the edge middleware. Middleware
// catches anonymous hits at the perimeter; TierGate catches free-tier users
// trying to access paid content and admin-attempt by non-admin users.
//
// When the API returns auth_unavailable (no DB / SESSION_SECRET yet), the
// gate falls open in 'auth' mode so the per-device fallback still works
// during pre-launch QA.
export function TierGate({ require, children }: TierGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        // Bust every possible cache layer — the tier can change at any
        // moment (admin promote/demote, Stripe webhook, manual edit) and
        // we want the next page-visit or tab-focus to reflect that.
        const res = await fetch(`/api/auth/me?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
        });
        const data = (await res.json()) as AuthMeResponse;

        // Auth not yet provisioned — fall open for 'auth' so the marketing demo
        // and per-device-only flows still work. Paid/admin always denied here.
        if (!data.authConfigured) {
          if (require === 'auth') {
            if (!cancelled) setState('allowed');
          } else {
            if (!cancelled) {
              setState('denied');
              router.push('/pricing?reason=unprovisioned');
            }
          }
          return;
        }

        if (!data.user) {
          if (cancelled) return;
          setState('denied');
          router.push(`/signup?next=${encodeURIComponent(pathname)}`);
          return;
        }

        if (require === 'admin' && !data.user.isAdmin) {
          if (cancelled) return;
          setState('denied');
          router.push('/profile');
          return;
        }

        if (require === 'paid' && !PAID_TIERS.has(data.user.tier)) {
          if (cancelled) return;
          setState('denied');
          router.push(`/pricing?reason=upgrade&next=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!cancelled) setState('allowed');
      } catch {
        // Network blip — fall open in 'auth' mode, deny otherwise.
        if (!cancelled) setState(require === 'auth' ? 'allowed' : 'denied');
      }
    };
    check();

    // Re-validate when the user returns to a stale tab — covers the case
    // where they edited their own tier in /admin/users on another tab and
    // then came back to a course page that was already rendered with the
    // old tier. Without this, the only escape was a hard reload.
    const onFocus = () => { void check(); };
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    // Cross-tab signal fired by /admin/users after a user edit.
    const onStorage = (e: StorageEvent) => { if (e.key === 'rfs:auth-bump') void check(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('storage', onStorage);
    };
  }, [require, router, pathname]);

  if (state === 'checking') {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center', color: T.textMute, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.textMute }}>
          Checking access…
        </div>
      </div>
    );
  }
  if (state === 'denied') return null;
  return <>{children}</>;
}
