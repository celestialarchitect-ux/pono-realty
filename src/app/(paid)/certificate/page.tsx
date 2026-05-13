'use client';

// ABOUTME: Course-completion certificate page. Shows the certificate when eligible; otherwise lists what's still required.
// ABOUTME: Printable layout — every browser's Print > Save-as-PDF outputs a clean letter-sized cert.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

interface CertResponse {
  eligible: boolean;
  user: { id: string; name: string; firstName: string; lastName: string; enrolledAt: string };
  progress: { hoursStudied: number; hoursRequired: number; hoursRemaining: number; hoursOk: boolean };
  mockExam: { attempts: number; bestScorePct: number; mockOk: boolean; passingThreshold: number };
  completedAt: string | null;
  verificationCode: string | null;
}

export default function CertificatePage() {
  const [data, setData] = useState<CertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/certificate', { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) {
          if (mounted) setError(r.status === 401 ? 'Sign in to view your certificate.' : 'Could not load certificate.');
          return;
        }
        const j = await r.json();
        if (mounted) setData(j);
      })
      .catch(() => { if (mounted) setError('Network error.'); });
    return () => { mounted = false; };
  }, []);

  if (error) return <Shell><p style={{ color: T.coral, fontSize: 14 }}>{error}</p></Shell>;
  if (!data) return <Shell><p style={{ color: T.textMute }}>Loading…</p></Shell>;

  if (!data.eligible) return <Shell><NotYet data={data} /></Shell>;

  return <Shell><Certificate data={data} /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '48px 32px', maxWidth: 980, margin: '0 auto' }}>
          {children}
        </main>
        <Footer />
      </div>
      {/* Print: hide everything except the cert itself */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .rfa-cert, .rfa-cert * { visibility: visible; }
          .rfa-cert { position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

function NotYet({ data }: { data: CertResponse }) {
  const hourPct = Math.min(100, (data.progress.hoursStudied / data.progress.hoursRequired) * 100);
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
        Course completion certificate
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 14 }}>
        Almost there.
      </h1>
      <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.65, marginBottom: 28, maxWidth: 640 }}>
        Your course-completion certificate unlocks automatically once you&rsquo;ve hit two milestones. Here&rsquo;s where you stand:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        <Requirement
          done={data.progress.hoursOk}
          title={`${data.progress.hoursRequired} hours of documented study`}
          detail={data.progress.hoursOk
            ? `Logged ${data.progress.hoursStudied} hours — met the state-law minimum.`
            : `${data.progress.hoursStudied} of ${data.progress.hoursRequired} hours logged. ${data.progress.hoursRemaining} more to go.`}
          progress={hourPct}
        />
        <Requirement
          done={data.mockExam.mockOk}
          title={`Pass a mock exam at ${data.mockExam.passingThreshold}%+`}
          detail={data.mockExam.attempts === 0
            ? `No mock attempts yet. Once you cross 60 hours, the mock unlocks.`
            : data.mockExam.mockOk
              ? `Passed (best: ${data.mockExam.bestScorePct}%). Locked in.`
              : `${data.mockExam.attempts} attempt${data.mockExam.attempts === 1 ? '' : 's'} so far (best: ${data.mockExam.bestScorePct}%). Hit ${data.mockExam.passingThreshold}%+ on any run to unlock the certificate.`}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/course" style={{ ...BUTTON_3D.primary, padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          Open the curriculum →
        </Link>
        <Link href="/practice" style={{ ...BUTTON_3D.secondary, padding: '14px 26px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          Take a mock exam
        </Link>
      </div>

      <div style={{ ...CARD, padding: 18, marginTop: 28, borderLeft: `3px solid ${T.ocean}`, fontSize: 13, color: T.textDim, lineHeight: 1.65 }}>
        <strong style={{ color: T.text }}>Why this gating?</strong> Hawaii REC requires 60 documented study hours to be exam-eligible, and our school final-exam threshold (70% on a full mock) is the same bar the PSI exam uses for the real thing. We don&rsquo;t issue a course-completion certificate to anyone who hasn&rsquo;t cleared both.
      </div>
    </div>
  );
}

function Requirement({ done, title, detail, progress }: { done: boolean; title: string; detail: string; progress?: number }) {
  return (
    <div style={{ ...CARD, padding: 22, borderLeft: `4px solid ${done ? T.green : T.coral}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: done ? T.green : T.bgRaised, color: done ? '#fff' : T.textMute, flexShrink: 0 }}>
          {done ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-12" /></svg>
          ) : (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.coral }} />
          )}
        </span>
        <span style={{ fontSize: 16, color: T.text, fontWeight: 700 }}>{title}</span>
      </div>
      <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.55, margin: '0 0 0 40px' }}>{detail}</p>
      {typeof progress === 'number' && !done && (
        <div style={{ marginLeft: 40, marginTop: 8, height: 4, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: T.ocean, transition: 'width 0.4s' }} />
        </div>
      )}
    </div>
  );
}

function Certificate({ data }: { data: CertResponse }) {
  const issued = data.completedAt ? new Date(data.completedAt) : new Date();
  const formattedDate = issued.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      {/* Top action bar — hidden in print */}
      <div className="rfa-cert-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.green, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
            Course completion · Issued
          </div>
          <p style={{ fontSize: 13, color: T.textDim, margin: 0, lineHeight: 1.5 }}>
            Your certificate is below. Use your browser&rsquo;s Print &rarr; Save as PDF for a copy.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>
          Print / Save PDF
        </button>
      </div>

      {/* THE CERTIFICATE — printable area */}
      <div className="rfa-cert" style={{
        background: '#fbf7f0',
        border: '16px solid #0e1a26',
        position: 'relative',
        padding: '64px 56px 72px',
        textAlign: 'center',
        // Letter-paper aspect when printed; flexible on screen.
        aspectRatio: '11 / 8.5',
        maxWidth: 900,
        margin: '0 auto',
        boxShadow: '0 24px 60px rgba(14,26,38,0.18)',
      }}>
        {/* Inner gold rule */}
        <div style={{
          position: 'absolute', inset: 18,
          border: '1px solid rgba(184,138,82,0.6)',
          pointerEvents: 'none',
        }} />

        {/* RF monogram corner ornaments */}
        <div style={{ position: 'absolute', top: 32, left: 32, color: '#b88a52', fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em' }}>RF</div>
        <div style={{ position: 'absolute', top: 32, right: 32, color: '#b88a52', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700 }}>EST. 1972</div>

        <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.32em', color: '#b88a52', textTransform: 'uppercase', fontWeight: 700 }}>
          Ralph Foulger&rsquo;s Academy of Real Estate
        </div>
        <div style={{ marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: '#6b7a8a', textTransform: 'uppercase' }}>
          Hawaii REC-approved pre-license course provider
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, letterSpacing: '-0.02em', color: '#0e1a26', lineHeight: 1.1, marginTop: 38, marginBottom: 24 }}>
          Certificate of Course Completion
        </h1>

        <p style={{ fontSize: 16, color: '#54616d', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 14px' }}>
          This certifies that
        </p>

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', color: '#0e1a26', lineHeight: 1.0, marginBottom: 18 }}>
          {data.user.name}
        </p>

        <p style={{ fontSize: 16, color: '#54616d', lineHeight: 1.7, maxWidth: 660, margin: '0 auto 32px' }}>
          has completed the 60-hour Hawaii Real Estate Salesperson Pre-License Course and passed the school final exam, satisfying the pre-license-education requirement under <strong style={{ color: '#0e1a26' }}>Hawaii Revised Statutes § 467</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, padding: '0 32px' }}>
          {/* Signature block */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 28, color: '#0e1a26', borderBottom: '1px solid #0e1a26', paddingBottom: 4, marginBottom: 6 }}>
              Ralph S. Foulger
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: '#6b7a8a', textTransform: 'uppercase', fontWeight: 700 }}>
              Founder &middot; Instructor since 1972
            </div>
          </div>

          {/* Verification block */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: '#6b7a8a', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>
              Issued
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#0e1a26', fontWeight: 700, marginBottom: 10 }}>
              {formattedDate}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: '#6b7a8a', textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>
              Verification ID
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#0e1a26', fontWeight: 700, letterSpacing: '0.04em' }}>
              {data.verificationCode}
            </div>
          </div>
        </div>

        <p style={{ position: 'absolute', bottom: 20, left: 32, right: 32, fontSize: 9, color: '#6b7a8a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', lineHeight: 1.6, textAlign: 'center' }}>
          Certificate valid for two (2) years from the issued date per Hawaii REC rules. This document satisfies the pre-license-education requirement only;
          you must still register and pass the PSI Hawaii Salesperson Exam and complete the Hawaii REC application to obtain a real estate license.
        </p>
      </div>

      <p style={{ fontSize: 12, color: T.textMute, textAlign: 'center', marginTop: 24, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
        Anyone with this verification ID can confirm authenticity with Ralph Foulger&rsquo;s Academy of Real Estate.
      </p>
    </div>
  );
}
