'use client';

import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';

type Category = 'bug' | 'typo' | 'confusing' | 'feature' | 'billing' | 'other';

const CATEGORY_LABEL: Record<Category, string> = {
  bug: 'Something is broken',
  typo: 'Typo or wrong info',
  confusing: 'Something is confusing',
  feature: 'Feature request',
  billing: 'Billing / payment issue',
  other: 'Other',
};

interface ReportProblemModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReportProblemModal({ open, onClose }: ReportProblemModalProps) {
  const [category, setCategory] = useState<Category>('bug');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [identityPrefilled, setIdentityPrefilled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lock background scroll while open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Try to prefill name/email from the signed-in user
  useEffect(() => {
    if (!open || identityPrefilled) return;
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data?.user) {
          setReporterName(data.user.name ?? '');
          setReporterEmail(data.user.email ?? '');
          setIdentityPrefilled(true);
        }
      })
      .catch(() => {/* anonymous */});
  }, [open, identityPrefilled]);

  // Reset state when closed
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setDescription('');
      setDone(null);
      setError(null);
    }, 300);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const page = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
      const url = typeof window !== 'undefined' ? window.location.href : '';
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const res = await fetch('/api/support/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description: description.trim(),
          page, url, userAgent,
          reporterEmail: reporterEmail || undefined,
          reporterName: reporterName || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 503) setError('Support isn\'t fully wired yet. Please email support@ralphfoulger.com.');
        else if (res.status === 429) setError(body.message ?? 'Too many reports — try again in an hour.');
        else setError(body.message ?? 'Could not send your report. Please try again.');
        return;
      }
      setDone({ id: body.id });
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report a problem"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(14,26,38,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 18,
        animation: 'rfs-fade-in 0.15s ease-out',
      }}
    >
      <style>{`
        @keyframes rfs-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes rfs-slide-up { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...CARD,
          maxWidth: 520, width: '100%',
          padding: 28,
          borderRadius: 18,
          maxHeight: '90vh', overflow: 'auto',
          animation: 'rfs-slide-up 0.22s ease-out',
        }}
      >
        {done ? (
          <SuccessView ticketId={done.id} onClose={onClose} />
        ) : (
          <form onSubmit={submit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                  Report a problem
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.01em', margin: 0, lineHeight: 1.15 }}>
                  What went wrong?
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  width: 32, height: 32, borderRadius: 8, color: T.textMute,
                  fontSize: 22, fontFamily: 'inherit', lineHeight: 1, flexShrink: 0,
                }}
              >×</button>
            </div>

            <Field label="Category">
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                style={inputStyle}
              >
                {(Object.keys(CATEGORY_LABEL) as Category[]).map(c => (
                  <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </Field>

            <Field label="Describe it (the more detail the better)">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="The button on the lesson page doesn't do anything when I click it…"
                rows={5}
                maxLength={4000}
                required
                style={{ ...inputStyle, resize: 'vertical', minHeight: 110, fontFamily: 'inherit' }}
              />
              <div style={{ fontSize: 11, color: T.textGhost, marginTop: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                {description.length} / 4000 · 10+ characters required
              </div>
            </Field>

            {!identityPrefilled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} data-stack-mobile="true">
                <Field label="Your name (optional)">
                  <input value={reporterName} onChange={e => setReporterName(e.target.value)} placeholder="Kalani" style={inputStyle} />
                </Field>
                <Field label="Your email (optional)">
                  <input type="email" value={reporterEmail} onChange={e => setReporterEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
                </Field>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(193,70,40,0.08)', border: `1px solid rgba(193,70,40,0.32)`, color: T.coralDark, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ ...BUTTON_3D.ghost, padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}
              >Cancel</button>
              <button
                type="submit"
                disabled={description.trim().length < 10 || submitting}
                style={{
                  ...BUTTON_3D.primary,
                  padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                  cursor: description.trim().length < 10 || submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', border: 'none',
                  opacity: description.trim().length < 10 || submitting ? 0.5 : 1,
                }}
              >
                {submitting ? 'Sending…' : 'Send report'}
              </button>
            </div>

            <p style={{ fontSize: 11, color: T.textGhost, marginTop: 16, lineHeight: 1.6 }}>
              Your report lands in the academy admin queue with the page URL and your browser info attached. We&apos;ll triage and follow up if needed.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function SuccessView({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.green, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
        Report received
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.01em', marginBottom: 12, lineHeight: 1.15 }}>
        Thanks &mdash; we have it.
      </h2>
      <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, marginBottom: 16 }}>
        Your report is in the admin queue. If you provided an email we may follow up; otherwise we&apos;ll quietly fix it.
      </p>
      <p style={{ fontSize: 11, color: T.textGhost, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginBottom: 18 }}>
        Reference: RF-{ticketId.slice(0, 8)}
      </p>
      <button
        type="button"
        onClick={onClose}
        style={{ ...BUTTON_3D.primary, padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}
      >Close</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.textMute, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.white,
  color: T.text,
  fontFamily: 'inherit',
  fontSize: 15,
  lineHeight: 1.4,
};
