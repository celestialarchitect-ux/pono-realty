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

// Mounted once in the root layout. Counts active study time per pathname into
// localStorage. Respects the Page Visibility API and a sliding idle window —
// time only accrues while the tab is visible AND the user has been recently
// active (mouse/keyboard/scroll within IDLE_THRESHOLD_SECONDS).
export function TimeTracker() {
  const pathname = usePathname();
  const lastActivity = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track activity signals
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bump = () => { lastActivity.current = Date.now(); };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, bump, { passive: true }));
    return () => events.forEach(ev => window.removeEventListener(ev, bump));
  }, []);

  // Tick — accrue time only when active + visible
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    // Reset tick interval on path change
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const visible = document.visibilityState === 'visible';
      const idleSeconds = (Date.now() - lastActivity.current) / 1000;
      if (!visible || idleSeconds > IDLE_THRESHOLD_SECONDS) return;
      // Skip tracking these routes (admin/profile shouldn't pad your study time)
      if (pathname.startsWith('/profile') || pathname.startsWith('/admin')) return;
      const next = addSeconds(loadLog(), pathname, TICK_SECONDS);
      saveLog(next);
    }, TICK_SECONDS * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  return null;
}
