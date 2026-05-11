'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { T, BUTTON_3D } from '@/lib/theme';

// Sticky bottom-right "I'm ready to begin" CTA. Lets readers jump from any
// content page directly to enrollment without scrolling back through the
// long landing/free-course/curriculum pages. Per Ralph's feedback.
//
// Smart routing:
//   - anonymous → /signup
//   - signed in, free tier → /pricing#plus (upgrade)
//   - signed in, paid tier → /course (continue learning)
//
// Suppressed on the routes where it would be noise: auth flows, admin,
// the example-website iframe content, and the marketing pricing page
// (those already have prominent CTAs).

const HIDDEN_PREFIXES = [
  '/signup',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/checkout',
  '/admin',
  '/example-website',
  '/pricing',
];

interface User { tier?: string }

export function GetStartedFab() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [dismissed, setDismissed] = useState(false);

  // Probe auth state once. The CTA routes differently depending.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (!cancelled) setUser(d?.user ?? null); })
      .catch(() => { if (!cancelled) setUser(null); });
    return () => { cancelled = true; };
  }, []);

  // Per-session dismiss — reader can hide it for the current tab if it's in
  // the way. Refreshes on navigation since usePathname() changes.
  useEffect(() => { setDismissed(false); }, [pathname]);

  if (!pathname) return null;
  if (HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) return null;
  if (dismissed) return null;
  if (user === undefined) return null; // still loading — don't flash CTA

  const paidTiers = new Set(['standard', 'plus', 'solo']);
  const isPaid = !!user && paidTiers.has(user.tier ?? '');

  let href: string;
  let label: string;
  if (!user) { href = '/signup'; label = "I'm ready to begin"; }
  else if (isPaid) { href = '/course'; label = 'Continue my course'; }
  else { href = '/pricing#plus'; label = 'Take me to enrollment'; }

  return (
    <div
      style={{
        position: 'fixed',
        right: 'max(20px, env(safe-area-inset-right))',
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        animation: 'rfs-fab-in 0.4s ease-out',
      }}
    >
      <style>{`
        @keyframes rfs-fab-in { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
      <Link
        href={href}
        style={{
          ...BUTTON_3D.primary,
          padding: '14px 22px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.03em',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 28px rgba(20,131,123,0.32), 0 2px 6px rgba(20,131,123,0.18)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8l5 4-5 4z" fill="currentColor" />
        </svg>
        {label}
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          border: `1px solid ${T.border}`,
          background: T.white,
          cursor: 'pointer',
          color: T.textMute,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontFamily: 'inherit',
          lineHeight: 1,
          boxShadow: '0 2px 8px rgba(45,55,72,0.12)',
        }}
        title="Hide for this tab"
      >×</button>
    </div>
  );
}
