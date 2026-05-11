// Tiny retro tones via Web Audio API — no audio files needed.
//
// AudioContext is lazy-created on first play() (browsers require a user
// gesture before audio works; first admin click activates it). Subsequent
// notifications use the same context.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  type WindowWithWebkit = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
  const w = window as WindowWithWebkit;
  const AC = w.AudioContext ?? w.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function note(freq: number, start: number, duration: number, volume = 0.12, type: OscillatorType = 'square') {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);
  const t = c.currentTime + start;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

// 8-bit ascending chirp — friendly, ~0.25s, used on new signups.
export function playSignupSound() {
  const c = getCtx();
  if (!c) return;
  // Try to resume in case the tab was backgrounded
  if (c.state === 'suspended') c.resume().catch(() => {});
  // C5 E5 G5 — major triad ascending arpeggio
  note(523.25, 0,    0.12, 0.10, 'square');
  note(659.25, 0.08, 0.12, 0.10, 'square');
  note(783.99, 0.16, 0.20, 0.12, 'square');
}

// Cha-ching / coins falling — used on actual Stripe payments.
export function playPaymentSound() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  // 1. Bell ding (high sine)
  note(1567.98, 0,    0.30, 0.18, 'sine');     // G6
  note(2093.00, 0.02, 0.25, 0.10, 'sine');     // C7 (harmonic)
  // 2. Coin tumble (descending triangle)
  note(1318.51, 0.18, 0.10, 0.14, 'triangle'); // E6
  note(1108.73, 0.26, 0.10, 0.13, 'triangle'); // C#6
  note(987.77,  0.34, 0.10, 0.12, 'triangle'); // B5
  note(880.00,  0.42, 0.14, 0.11, 'triangle'); // A5
  // 3. Closing tap (low square click)
  note(440.00,  0.56, 0.06, 0.10, 'square');   // A4
}

// Soft "click" used when the bell is muted but you still want a visual+haptic
// notification confirmation. Currently unused but kept for future feedback.
export function playClickSound() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  note(880, 0, 0.06, 0.08, 'sine');
}
