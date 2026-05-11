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
// localStorage (always — visitor or authenticated). When authenticated, also
// POSTs each tick to /api/time/heartbeat so the server has authoritative data
// for the 60-hour gate and admin reporting.
//
// Server failure modes (401, 503, network) downgrade gracefully — local
// tracking keeps working so the user never loses time.

let serverEnabled: boolean | null = null; // memoized after first probe per page session

export function TimeTracker() {
  const pathname = usePathname();
  const lastActivity = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Activity signal listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bump = () => { lastActivity.current = Date.now(); };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, bump, { passive: true }));
    return () => events.forEach(ev => window.removeEventListener(ev, bump));
  }, []);

  // Probe server auth status once
  useEffect(() => {
    if (serverEnabled !== null) return;
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { serverEnabled = !!data?.user; })
      .catch(() => { serverEnabled = false; });
  }, []);

  // Tick — accrue locally + (when authenticated) POST to server
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      const visible = document.visibilityState === 'visible';
      const idleSeconds = (Date.now() - lastActivity.current) / 1000;
      if (!visible || idleSeconds > IDLE_THRESHOLD_SECONDS) return;
      // Skip self-referential paths
      if (pathname.startsWith('/profile') || pathname.startsWith('/admin')) return;

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
            serverEnabled = false; // stop trying for the rest of this page session
          }
        } catch {
          // Network blip — keep local cache, retry on next tick
        }
      }
    }, TICK_SECONDS * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  return null;
}
