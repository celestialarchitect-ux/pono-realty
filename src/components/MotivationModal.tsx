'use client';

import { useEffect, useState } from 'react';
import { T, BUTTON_3D } from '@/lib/theme';

const STORAGE_KEY = 'ralph-school-commitment-acknowledged';

export function MotivationModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const acknowledge = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(14, 26, 38, 0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', overflowY: 'auto',
      }}
    >
      <div style={{
        maxWidth: 640, width: '100%', background: T.bg, borderRadius: 24,
        padding: 'clamp(32px, 5vw, 56px)', position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
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
          letterSpacing: '0.28em', color: T.coral, textTransform: 'uppercase',
          fontWeight: 700, marginBottom: 16, textAlign: 'center',
        }}>
          Before You Begin · Read This
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(32px, 4.8vw, 48px)', fontWeight: 900,
          letterSpacing: '-0.025em', lineHeight: 1.05,
          color: T.text, marginBottom: 24, textAlign: 'center',
        }}>
          Your future is in <em style={{ color: T.ocean, fontStyle: 'italic' }}>your hands.</em>
        </h2>

        <div style={{ fontSize: 16, lineHeight: 1.8, color: T.textDim, marginBottom: 18 }}>
          <p style={{ marginBottom: 14 }}>
            What you&apos;re about to enter is real. The Hawaii Real Estate Salesperson Exam is real.
            The clients you will one day represent are real. The hundreds of thousands of dollars
            that will move because of your signature on a contract &mdash; <strong style={{ color: T.text }}>that is real.</strong>
          </p>
          <p style={{ marginBottom: 14 }}>
            We have built every tool we know how to build to help you pass the first time:
            audiobook narration, math drills, adaptive review, an AI study companion. We bet on you because
            we believe in you. <strong style={{ color: T.text }}>But we cannot do the work for you.</strong>
          </p>
          <p style={{ marginBottom: 14 }}>
            Skipping chapters won&apos;t fool the exam. Memorizing answers without
            understanding won&apos;t fool real clients. Cheating yourself only delays the moment
            you face a test that doesn&apos;t care about shortcuts.
          </p>
          <p style={{
            marginBottom: 8, padding: '18px 22px', borderRadius: 12,
            background: T.bgRaised, borderLeft: `3px solid ${T.coral}`,
            fontStyle: 'italic', color: T.text, fontSize: 17, lineHeight: 1.7,
          }}>
            Show up. Do the reading. Listen to the audio. Take the quizzes seriously.
            Wrestle with the math until it makes sense. Earn this license honestly &mdash; and
            you will walk into your career with something no shortcut can ever give you:
            <strong> the actual ability to do the work.</strong>
          </p>
        </div>

        <button
          onClick={acknowledge}
          style={{
            ...BUTTON_3D.primary,
            width: '100%',
            padding: '16px 24px',
            borderRadius: 14,
            fontSize: 15, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            cursor: 'pointer', marginTop: 8,
            border: 'none',
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
