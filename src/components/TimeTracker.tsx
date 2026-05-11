'use client';

import { useEffect, useRef } from 'react';
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

let serverEnabled: boolean | null = null;

// Routes where the timer should not run (meta / nav-only / admin)
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
  // Last meaningful engagement (scroll, keydown, click, touchstart, audio play)
  const lastEngagement = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Probe server auth state once per page session
  useEffect(() => {
    if (serverEnabled !== null) return;
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { serverEnabled = !!data?.user; })
      .catch(() => { serverEnabled = false; });
  }, []);

  // Tick — accrue when engagement is recent AND tab is visible AND route counts
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (!isStudyPath(pathname)) return;
      const visible = document.visibilityState === 'visible';
      if (!visible) return;
      const idleSeconds = (Date.now() - lastEngagement.current) / 1000;
      if (idleSeconds > IDLE_THRESHOLD_SECONDS) return;

      // Local accrual (always)
      const next = addSeconds(loadLog(), pathname, TICK_SECONDS);
      saveLog(next);

      // Server sync (best effort, only when authenticated)
      if (serverEnabled) {
        try {
          const res = await fetch('/api/time/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: pathname, seconds: TICK_SECONDS }),
            keepalive: true,
          });
          if (res.status === 401 || res.status === 503) {
            serverEnabled = false;
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
