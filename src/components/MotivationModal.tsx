'use client';

import { useEffect, useState } from 'react';
import { T, BUTTON_3D } from '@/lib/theme';

const ACKED_KEY = 'ralph-school-commitment-acknowledged';
// Set by the signup page right after a successful account creation. The
// modal looks for this flag, shows itself once, then clears the flag so
// it never reappears.
export const SHOW_AFTER_SIGNUP_KEY = 'rfs:show-welcome-modal:v1';

export function MotivationModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const acked = localStorage.getItem(ACKED_KEY);
    if (acked) return; // already seen + acknowledged at any point — never show again
    const shouldShow = localStorage.getItem(SHOW_AFTER_SIGNUP_KEY) === '1';
    if (!shouldShow) return;
    // Small delay so the /profile page paints first, then the modal lands.
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(ACKED_KEY, new Date().toISOString());
      localStorage.removeItem(SHOW_AFTER_SIGNUP_KEY);
    } catch {/* ignore */}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(14, 26, 38, 0.94)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'env(safe-area-inset-top, 24px) 24px env(safe-area-inset-bottom, 24px)',
        overflowY: 'auto',
      }}
    >
      <div style={{
        maxWidth: 660, width: '100%', background: T.bg, borderRadius: 24,
        padding: 'clamp(28px, 5vw, 56px)', position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
        animation: 'modalIn 0.5s ease-out',
      }}>
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(20px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div style={{
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.3em', color: T.coral, textTransform: 'uppercase',
          fontWeight: 700, marginBottom: 18, textAlign: 'center',
        }}>
          A word before you begin
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 900,
          letterSpacing: '-0.025em', lineHeight: 1.02,
          color: T.text, marginBottom: 28, textAlign: 'center',
        }}>
          Your future is in <em style={{ color: T.ocean, fontStyle: 'italic' }}>your hands.</em>
        </h2>

        <div style={{ fontSize: 16, lineHeight: 1.85, color: T.textDim }}>
          <p style={{ marginBottom: 18, fontSize: 17, color: T.text, fontWeight: 500 }}>
            What waits for you is real.
          </p>

          <p style={{ marginBottom: 18 }}>
            The exam is real. The clients you&apos;ll one day stand beside &mdash;
            guiding them through the biggest financial decision of their lives &mdash;
            are real. The contracts your signature will move are real.
            The trust placed in your hands will be real.
          </p>

          <p style={{ marginBottom: 18 }}>
            We&apos;ve built every tool we know how to build to put you in position to win.
            Audiobook narration for the days you can&apos;t sit still. Math drills calibrated
            to where students actually fall. An AI tutor that knows the Hawaii curriculum
            cold. Adaptive review that fights for your weak spots so you don&apos;t have to.
          </p>

          <p style={{ marginBottom: 18 }}>
            We bet on you because <strong style={{ color: T.text }}>we believe in you.</strong>
            {' '}But betting isn&apos;t the same as carrying. We cannot sit in the exam seat
            for you. We cannot move the pen.
          </p>

          <p style={{
            marginBottom: 22, padding: '20px 24px', borderRadius: 12,
            background: T.bgRaised, borderLeft: `3px solid ${T.coral}`,
            color: T.text, fontSize: 16, lineHeight: 1.75,
          }}>
            Shortcuts feel clever &mdash; right up until the moment you face a test
            that doesn&apos;t care. The exam doesn&apos;t reward memorization without
            understanding. Clients don&apos;t tolerate confidence without competence.
            Cheating yourself isn&apos;t getting away with anything. It&apos;s postponing
            the bill, with interest.
          </p>

          <p style={{ marginBottom: 14, fontSize: 17, color: T.text, fontWeight: 500 }}>
            So show up.
          </p>

          <p style={{ marginBottom: 22 }}>
            Do the reading. Listen to the audio. Wrestle with the math until it gives.
            Take the quizzes seriously enough that your wrong answers teach you something.
          </p>

          <p style={{
            marginBottom: 8, fontSize: 19, fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic', color: T.text, lineHeight: 1.5, textAlign: 'center',
          }}>
            Earn this license honestly &mdash; and walk into your career with the
            one thing no shortcut ever gives you:
          </p>
          <p style={{
            marginBottom: 28, fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800, color: T.ocean, lineHeight: 1.3, textAlign: 'center',
            letterSpacing: '-0.01em',
          }}>
            the actual ability to do the work.
          </p>
        </div>

        <button
          onClick={acknowledge}
          style={{
            ...BUTTON_3D.primary,
            width: '100%',
            padding: '18px 24px',
            borderRadius: 14,
            fontSize: 15, fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            cursor: 'pointer', marginTop: 4,
            border: 'none', minHeight: 56,
          }}
        >
          I&apos;m ready to do the work →
        </button>
        <div style={{
          fontSize: 12, color: T.textMute, textAlign: 'center', marginTop: 14,
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
        }}>
          You&apos;ll only see this once.
        </div>
      </div>
    </div>
  );
}
