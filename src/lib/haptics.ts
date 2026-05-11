// Haptic + click-tone feedback for learner interactions.
//
// On supported devices (most Android, some iOS) navigator.vibrate fires
// a millisecond-scale buzz. Where vibration isn't supported (desktop,
// iOS Safari), a near-inaudible Web Audio "tick" gives a similar
// "this clicked" feel. Both can be disabled per-device via localStorage
// (toggle in /profile settings).

const STORAGE_KEY = 'rfs:haptics-enabled:v1';

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioCtx) return audioCtx;
  type W = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
  const AC = (window as W).AudioContext ?? (window as W).webkitAudioContext;
  if (!AC) return null;
  audioCtx = new AC();
  return audioCtx;
}

export function isHapticsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return true; // default ON
    return stored === '1';
  } catch {
    return true;
  }
}

export function setHapticsEnabled(on: boolean): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, on ? '1' : '0'); } catch {/* ignore */}
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try { navigator.vibrate(pattern); } catch {/* ignore */}
}

function tick(freq: number, durationSeconds = 0.04, volume = 0.06, type: OscillatorType = 'sine') {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);
  const t = c.currentTime;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + durationSeconds);
  osc.start(t);
  osc.stop(t + durationSeconds);
}

// Light feedback — e.g. clicking a nav link, flipping a flashcard.
export function tap(): void {
  if (!isHapticsEnabled()) return;
  vibrate(8);
  tick(2200, 0.03, 0.05, 'sine');
}

// Distinct feedback — completing an action like submitting an answer.
export function success(): void {
  if (!isHapticsEnabled()) return;
  vibrate([12, 30, 14]);
  // Two-note up
  tick(1568, 0.05, 0.06, 'triangle');
  setTimeout(() => tick(2349, 0.07, 0.05, 'triangle'), 50);
}

// Subtle "selected" feel — checkboxes, radios.
export function select(): void {
  if (!isHapticsEnabled()) return;
  vibrate(6);
  tick(1760, 0.025, 0.04, 'sine');
}
