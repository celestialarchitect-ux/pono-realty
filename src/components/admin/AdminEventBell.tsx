'use client';

import { useEffect, useRef, useState } from 'react';
import { T, CARD } from '@/lib/theme';
import { playSignupSound, playPaymentSound } from './sounds';

// Live signup + payment notifier. Mounted in the admin layout, runs on
// every admin page. Polls /api/admin/events every 6 seconds. When new
// events arrive, fires a retro sound (unless muted) and stacks toast cards
// in the bottom-left for a few seconds each.
//
// Per-device mute setting persists in localStorage. Web Audio needs a user
// gesture to start producing sound, so the very first click anywhere
// after page load implicitly "arms" the context — that's expected browser
// behavior, not a bug.

interface SignupEvent {
  type: 'signup';
  id: string;
  at: string;
  user: { id: string; name?: string; email?: string; firstName?: string; tier?: string };
}
interface PaymentEvent {
  type: 'payment';
  id: string;
  at: string;
  user: { id: string; name?: string; email?: string; firstName?: string };
  amountCents: number;
  currency: string;
  tier: string;
}
type Event = SignupEvent | PaymentEvent;

const MUTE_KEY = 'rfs:admin-mute:v1';
const POLL_MS = 6_000;
const TOAST_TTL_MS = 9_000;

export function AdminEventBell() {
  const [toasts, setToasts] = useState<Event[]>([]);
  const [muted, setMuted] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Load mute preference once
  useEffect(() => {
    try { setMuted(localStorage.getItem(MUTE_KEY) === '1'); } catch {/* ignore */}
  }, []);

  // Poll loop
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      try {
        const qs = cursorRef.current ? `?since=${encodeURIComponent(cursorRef.current)}` : '';
        const res = await fetch(`/api/admin/events${qs}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data: { events: Event[]; cursor: string } = await res.json();
        cursorRef.current = data.cursor;
        const fresh = data.events.filter(e => !seenIdsRef.current.has(e.id));
        if (fresh.length > 0) {
          fresh.forEach(e => seenIdsRef.current.add(e.id));
          // Stagger sound playback so two events don't collide
          if (!muted) {
            fresh.forEach((e, i) => {
              setTimeout(() => {
                if (e.type === 'signup') playSignupSound();
                else playPaymentSound();
              }, i * 600);
            });
          }
          // Toasts: keep max 5 visible at a time
          setToasts(curr => [...fresh, ...curr].slice(0, 5));
          // Auto-dismiss each after TTL
          fresh.forEach(e => {
            setTimeout(() => {
              setToasts(curr => curr.filter(t => t.id !== e.id));
            }, TOAST_TTL_MS);
          });
        }
      } catch {/* network blip, ignore */}
    };
    const id = setInterval(tick, POLL_MS);
    // Fire one immediately too
    tick();
    return () => { cancelled = true; clearInterval(id); };
  }, [muted]);

  const toggleMute = () => {
    setMuted(m => {
      const next = !m;
      try { localStorage.setItem(MUTE_KEY, next ? '1' : '0'); } catch {/* ignore */}
      return next;
    });
  };

  return (
    <>
      {/* Mute toggle pill — fixed top-right of viewport */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute notifications' : 'Mute notifications'}
        title={muted ? 'Notifications muted (click to unmute)' : 'Notifications on (click to mute)'}
        style={{
          position: 'fixed',
          top: 'max(74px, env(safe-area-inset-top))',
          right: 'max(16px, env(safe-area-inset-right))',
          zIndex: 95,
          width: 42, height: 42,
          borderRadius: '50%',
          border: `1px solid ${T.border}`,
          background: muted ? T.bgRaised : T.white,
          color: muted ? T.textMute : T.ocean,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'inherit',
          boxShadow: '0 4px 16px rgba(45,55,72,0.10)',
        }}
      >
        {muted ? <BellOffIcon /> : <BellIcon />}
      </button>

      {/* Toast stack — fixed bottom-left */}
      <div
        style={{
          position: 'fixed',
          left: 'max(16px, env(safe-area-inset-left))',
          bottom: 'max(16px, env(safe-area-inset-bottom))',
          zIndex: 95,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 10,
          maxWidth: 340,
          pointerEvents: 'none',
        }}
      >
        <style>{`
          @keyframes rfs-toast-in { from { opacity: 0; transform: translateX(-12px) scale(0.96) } to { opacity: 1; transform: translateX(0) scale(1) } }
        `}</style>
        {toasts.map(t => (
          <Toast key={t.id} event={t} onClose={() => setToasts(curr => curr.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </>
  );
}

function Toast({ event, onClose }: { event: Event; onClose: () => void }) {
  const isPayment = event.type === 'payment';
  const accent = isPayment ? T.coral : T.ocean;
  const bg = isPayment ? 'rgba(232,93,60,0.06)' : 'rgba(20,131,123,0.06)';
  const name = event.user.firstName || event.user.name || event.user.email || 'Someone';
  const tier = isPayment ? event.tier : event.user.tier;
  const amount = isPayment
    ? `$${Math.round(event.amountCents / 100).toLocaleString()}`
    : null;

  return (
    <div
      role="status"
      style={{
        ...CARD,
        pointerEvents: 'auto',
        padding: '14px 16px',
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: accent,
        background: bg,
        animation: 'rfs-toast-in 0.28s ease-out',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ flexShrink: 0, color: accent, marginTop: 2 }}>
        {isPayment ? <CashIcon /> : <SparkIcon />}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
          {isPayment ? `Payment · ${amount}` : 'New signup'}
        </div>
        <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}{tier && tier !== 'free' ? ` · ${tier}` : ''}
        </div>
        {event.user.email && (
          <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.user.email}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: T.textMute, lineHeight: 1, padding: 0, flexShrink: 0 }}
      >×</button>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
function BellOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 11.5V8a6 6 0 0 0-10-4.6" />
      <path d="M6 8c0 7-3 9-3 9h13" />
      <path d="M10 21a2 2 0 0 0 4 0" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
function CashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="3" />
      <path d="M5 9.5h.01M19 15.5h.01" />
    </svg>
  );
}
