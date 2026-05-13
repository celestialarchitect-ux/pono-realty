'use client';

// PWA installer + PIN lock + service worker registrar.
//
// Three behaviors stitched into one mount-once component, rendered from the
// root layout so it loads on every page:
//
//   1. Register the service worker on first run. Service worker is what
//      Chrome / Edge / Safari need to consider the site "installable".
//
//   2. Capture the `beforeinstallprompt` event so we can offer a styled
//      "Add to home screen" button at our own timing instead of relying
//      on the browser's default mini-infobar (which iOS doesn't show at
//      all and Chrome buries).
//
//   3. PIN-lock: optional 4-digit code, stored as bcrypt-hashed string in
//      localStorage. When set, app launches into a lock screen before the
//      profile renders. iOS-style numeric keypad UI. The PIN does NOT
//      protect the server-side auth session — it's a quick "don't show my
//      grades to a passenger glancing at my phone" gate, not a security
//      boundary.
//
// The component renders nothing visible by default; it injects a floating
// install button on /profile when an install prompt is available, and a
// full-screen lock when a PIN is set + the app is freshly launched.

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const PIN_HASH_KEY = 'rfa-pin-hash-v1';
const PIN_UNLOCKED_KEY = 'rfa-pin-unlocked-session';
const PIN_LAST_LOCK = 'rfa-pin-last-lock-at';
// Re-lock after 15 minutes of background time. Tuned so a student who
// puts the phone in their pocket between bus stops doesn't have to re-type.
const RELOCK_AFTER_MS = 15 * 60 * 1000;

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  // --- 1. Register service worker ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Defer registration off the critical path.
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 600));
    idle(() => {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* registration failed; site still works */ });
    });
  }, []);

  // --- 2. Capture install prompt ---
  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BIPEvent);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  // --- 3. PIN lock decision on mount + when window regains focus ---
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? localStorage.getItem(PIN_HASH_KEY) : null;
    const pinSet = !!hash;
    setHasPin(pinSet);
    if (!pinSet) return;

    // On fresh load: lock unless we have a valid unlocked-session flag set
    // within RELOCK_AFTER_MS.
    const unlockedAt = Number(sessionStorage.getItem(PIN_UNLOCKED_KEY) || '0');
    const lastLockAt = Number(localStorage.getItem(PIN_LAST_LOCK) || '0');
    const recentlyUnlocked = Date.now() - unlockedAt < RELOCK_AFTER_MS;
    const recentlyLocked = lastLockAt && (Date.now() - lastLockAt < RELOCK_AFTER_MS);
    if (!recentlyUnlocked && !recentlyLocked) {
      setShowLock(true);
    }

    // Re-lock when user backgrounds the tab/app for > RELOCK_AFTER_MS
    let bgAt: number | null = null;
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        bgAt = Date.now();
      } else if (bgAt && Date.now() - bgAt > RELOCK_AFTER_MS) {
        sessionStorage.removeItem(PIN_UNLOCKED_KEY);
        setShowLock(true);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const installApp = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallEvent(null);
    } else {
      setDismissed(true);
    }
  };

  const onPinUnlocked = () => {
    sessionStorage.setItem(PIN_UNLOCKED_KEY, String(Date.now()));
    setShowLock(false);
  };

  // Only show install pill on /profile (don't pester on every page).
  const showInstall = pathname?.startsWith('/profile') && installEvent && !dismissed;

  return (
    <>
      {showInstall && <InstallPill onInstall={installApp} onDismiss={() => setDismissed(true)} />}
      {showLock && <PinLockScreen onUnlock={onPinUnlocked} />}
      {/* PIN settings live in /profile via the SettingsCard there; we
          expose hasPin via a custom event for that component to read. */}
      <PinSettingsBridge hasPin={hasPin} />
    </>
  );
}

// Small bridge so /profile's SettingsCard can know whether a PIN is set
// without re-implementing the localStorage read. Listens for a custom
// `rfa-pin-query` event and responds via dispatched `rfa-pin-state`.
function PinSettingsBridge({ hasPin }: { hasPin: boolean }) {
  useEffect(() => {
    const onQuery = () => {
      window.dispatchEvent(new CustomEvent('rfa-pin-state', { detail: { hasPin } }));
    };
    window.addEventListener('rfa-pin-query', onQuery);
    return () => window.removeEventListener('rfa-pin-query', onQuery);
  }, [hasPin]);
  return null;
}

// ---- Install pill -----------------------------------------------------

function InstallPill({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(20px + env(safe-area-inset-bottom))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9000,
      background: '#0e1a26',
      color: '#fbf7f0',
      borderRadius: 999,
      padding: '12px 14px 12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 13,
      fontWeight: 600,
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
      border: '1px solid rgba(232,201,137,0.35)',
      maxWidth: 'calc(100vw - 32px)',
    }}>
      <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden="true">📱</span>
      <span style={{ lineHeight: 1.3 }}>Save Ralph Foulger Academy to your home screen</span>
      <button onClick={onInstall} style={{
        background: '#14837b', color: '#fff', border: 'none',
        padding: '8px 16px', borderRadius: 999,
        fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
        cursor: 'pointer',
      }}>
        Install
      </button>
      <button onClick={onDismiss} aria-label="Dismiss" style={{
        background: 'transparent', color: 'rgba(251,247,240,0.6)',
        border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1,
        padding: '0 6px',
      }}>×</button>
    </div>
  );
}

// ---- PIN lock screen --------------------------------------------------

// Tiny hash for PIN comparison. NOT a security mechanism — see top-of-file
// comment. SubtleCrypto + a constant per-device salt; sufficient for a
// "don't show my grades to a passenger glancing at my phone" gate.
async function hashPin(pin: string): Promise<string> {
  const salt = 'rfa-pin-salt-v1';
  const buf = new TextEncoder().encode(pin + salt);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function PinLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const expectedRef = useRef<string | null>(null);

  useEffect(() => {
    expectedRef.current = localStorage.getItem(PIN_HASH_KEY);
  }, []);

  const submit = async (full: string) => {
    const got = await hashPin(full);
    if (got === expectedRef.current) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 500);
      // Tiny tactile cue on wrong PIN (mobile).
      if ('vibrate' in navigator) navigator.vibrate([12, 60, 12]);
    }
  };

  const press = (digit: string) => {
    setError(false);
    if (digit === 'del') {
      setPin(p => p.slice(0, -1));
      return;
    }
    const next = pin + digit;
    if (next.length > 4) return;
    setPin(next);
    if (next.length === 4) {
      // Defer the compare so the dot animation completes
      setTimeout(() => submit(next), 80);
    }
  };

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: '#0e1a26',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'env(safe-area-inset-top) 24px env(safe-area-inset-bottom)',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#fbf7f0',
    }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4, color: '#e8c989' }}>
        RF
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.24em', color: 'rgba(251,247,240,0.6)', textTransform: 'uppercase', marginBottom: 36 }}>
        Academy of Real Estate
      </div>
      <div style={{ fontSize: 14, color: 'rgba(251,247,240,0.7)', marginBottom: 24 }}>
        {error ? 'Incorrect PIN — try again.' : 'Enter your 4-digit PIN'}
      </div>
      <div style={{
        display: 'flex', gap: 18, marginBottom: 40,
        animation: shake ? 'rfa-shake 0.4s ease-in-out' : 'none',
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: '50%',
            background: i < pin.length ? '#e8c989' : 'transparent',
            border: `2px solid ${i < pin.length ? '#e8c989' : 'rgba(232,201,137,0.4)'}`,
            transition: 'background 0.1s',
          }} />
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 72px)',
        gap: 16,
      }}>
        {keys.map((k, i) => k === '' ? <div key={i} /> : (
          <button
            key={i}
            onClick={() => press(k)}
            aria-label={k === 'del' ? 'Delete' : k}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(251,247,240,0.06)',
              color: '#fbf7f0',
              border: '1px solid rgba(251,247,240,0.1)',
              fontSize: k === 'del' ? 22 : 28,
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              userSelect: 'none',
            }}>
            {k === 'del' ? '⌫' : k}
          </button>
        ))}
      </div>
      <style>{`
        @keyframes rfa-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}

// ---- Exported helpers for SettingsCard (set / clear PIN) --------------

export async function setPin(pin: string): Promise<void> {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits');
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
  sessionStorage.setItem(PIN_UNLOCKED_KEY, String(Date.now()));
}

export function clearPin(): void {
  localStorage.removeItem(PIN_HASH_KEY);
  sessionStorage.removeItem(PIN_UNLOCKED_KEY);
  localStorage.removeItem(PIN_LAST_LOCK);
}
