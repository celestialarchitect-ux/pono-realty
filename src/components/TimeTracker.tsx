'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  loadLog,
  saveLog,
  addSeconds,
  TICK_SECONDS,
  IDLE_THRESHOLD_SECONDS,
} from '@/lib/time-tracking';

// Hawaii state-law-compliant study time tracker.
//
// Time accrues only when ALL of these are true on each tick:
//  1. Tab is visible (Page Visibility API)
//  2. User has done an ENGAGEMENT action (scroll, keystroke, click, or touch)
//     within the last IDLE_THRESHOLD_SECONDS — mousemove alone is not enough,
//     because mouse-jigglers and idle hovering are common ways to fake hours.
//  3. The route is a study route (skips /profile, /admin, etc.)
//
// When authenticated, each tick POSTs to /api/time/heartbeat where the server
// enforces a per-day cap and re-derives the bucket from the path.
//
// Local accrual always runs as a per-device cache; server is authoritative
// when wired.

// Routes where the timer should NOT run — admin chrome, account flows,
// purely navigational pages. Admins still track on study pages like every
// other student (Zach explicitly asked for this).
const NON_STUDY_PREFIXES = [
  '/profile',
  '/admin',
  '/signup',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/checkout',
];

function isStudyPath(path: string): boolean {
  return !NON_STUDY_PREFIXES.some(p => path === p || path.startsWith(p + '/'));
}

export function TimeTracker() {
  const pathname = usePathname();
  // Last meaningful engagement (scroll, keydown, click, touchstart, audio play).
  const lastEngagement = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Auth state lives in a component-level ref (NOT a module-level singleton
  // like the previous implementation). The old design had a single `let
  // serverEnabled` shared across the whole module — once any visit set it to
  // false (e.g., anonymous page view before sign-up), the entire tab stopped
  // syncing for the rest of the session even after the user authenticated.
  // That explains why some students had a handful of TimeEvent rows total:
  // their first page was anonymous, the flag stuck at false, and nothing
  // ever shipped to /api/time/heartbeat afterward.
  //
  // We also re-probe whenever the pathname changes so a fresh sign-in is
  // detected within seconds, not at the next full page reload.
  const serverEnabled = useRef<boolean | null>(null);
  const [authProbeKey, setAuthProbeKey] = useState(0);

  // Engagement listeners — these signals are the gate. Pure mousemove does
  // NOT count because it's the cheapest signal to fake.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bump = () => { lastEngagement.current = Date.now(); };
    const events = ['scroll', 'keydown', 'click', 'touchstart', 'wheel'] as const;
    events.forEach(ev => window.addEventListener(ev, bump, { passive: true }));

    // Audio playback (Web Speech API or <audio>) counts as engagement so
    // listening to the audiobook with focus elsewhere on the page still tracks.
    const onPlay = () => { lastEngagement.current = Date.now(); };
    document.addEventListener('play', onPlay, true);

    // Seed an initial timestamp so we don't insta-idle when the user first
    // lands on a page from /signup (which is a non-study path).
    lastEngagement.current = Date.now();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, bump));
      document.removeEventListener('play', onPlay, true);
    };
  }, []);

  // Probe auth on mount and whenever the URL changes. Re-probing on
  // pathname change catches the after-signup / after-login state without
  // requiring a full reload.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => { if (!cancelled) serverEnabled.current = !!data?.user; })
      .catch(() => { if (!cancelled) serverEnabled.current = null; });
    return () => { cancelled = true; };
  }, [pathname, authProbeKey]);

  // Tick — accrue when engagement is recent AND tab is visible AND route counts.
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (!isStudyPath(pathname)) return;
      const visible = document.visibilityState === 'visible';
      if (!visible) return;
      const idleSeconds = (Date.now() - lastEngagement.current) / 1000;
      if (idleSeconds > IDLE_THRESHOLD_SECONDS) return;

      // Local accrual (always — per-device cache for anon visitors)
      const next = addSeconds(loadLog(), pathname, TICK_SECONDS);
      saveLog(next);

      // Server sync — try whenever auth state is unknown (null) or known to
      // be active (true). We only short-circuit when we're sure the user is
      // anonymous (false). A 401/503 doesn't permanently disable; instead
      // we trigger a re-probe so the next tick re-evaluates auth state. A
      // session cookie that hasn't propagated yet, a deploy mid-session, or
      // a stale tab no longer takes the user offline for the whole session.
      if (serverEnabled.current !== false) {
        try {
          const res = await fetch('/api/time/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: pathname, seconds: TICK_SECONDS }),
            keepalive: true,
          });
          if (res.ok) {
            serverEnabled.current = true;
          } else if (res.status === 401 || res.status === 503) {
            // Auth disappeared — re-probe instead of giving up.
            serverEnabled.current = null;
            setAuthProbeKey(k => k + 1);
          }
          // 429 = daily cap hit; UI will surface this via the next summary fetch.
        } catch {
          // Network blip — local cache continues, retry next tick.
        }
      }
    }, TICK_SECONDS * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  return null;
}
