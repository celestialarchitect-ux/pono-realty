'use client';

import Link from 'next/link';
import { useState } from 'react';
import { T, BUTTON_3D, CARD, SHADOW_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

type CheckoutTier = 'standard' | 'plus' | 'solo';

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<CheckoutTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (tier: CheckoutTier) => {
    setLoadingTier(tier);
    setError(null);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401 && body.loginRedirect) {
        window.location.href = `${body.loginRedirect}?next=/pricing%23${tier}`;
        return;
      }
      if (!res.ok) {
        setError(body.message ?? 'Checkout is not available yet. Try again shortly.');
        return;
      }
      if (body.url) {
        window.location.href = body.url;
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/pricing" />

        {/* HERO */}
        <section style={{ padding: '64px 32px 32px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Pricing</div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(46px, 6.5vw, 80px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 20 }}>
            One-time payment. <em style={{ color: T.ocean, fontStyle: 'italic' }}>No subscription.</em>
          </h1>
          <p style={{ fontSize: 18, color: T.textDim, lineHeight: 1.6, maxWidth: 760, margin: '0 auto 8px' }}>
            Three options. The full Hawaii licensing system, the same system bundled with a custom agent website on graduation, or a standalone website build for agents who are already licensed.
          </p>
          <p style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', marginTop: 16 }}>
            All prices USD · One-time payment · Hosting / maintenance fee applies to websites
          </p>
        </section>

        {/* FREE BANNER */}
        <section style={{ padding: '8px 32px 0', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: '18px 24px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderLeftWidth: 4, borderLeftColor: T.ocean, borderLeftStyle: 'solid' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 360px' }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>Free first</div>
              <div style={{ fontSize: 15, color: T.text, lineHeight: 1.45 }}>
                <strong>Free Foundation web course.</strong> 5 lessons, Hawaii market 101 &mdash; try the platform before paying a cent.
              </div>
            </div>
            <Link href="/free" style={{ ...BUTTON_3D.secondary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Start the free course →
            </Link>
          </div>
        </section>

        {/* THREE TIERS */}
        <section style={{ padding: '32px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }} data-stack-mobile="true">
            <BigTier
              id="standard"
              name="Standard"
              price="$599"
              tagline="The complete Hawaii licensing prep system."
              features={[
                'All 20 chapters (PSI-aligned)',
                'Full audiobook narration',
                '24/7 AI Real Estate Tutor',
                'Smart flashcards (spaced repetition)',
                'Math drills with worked examples',
                '130-question mock exams',
                'Searchable glossary',
                'School final exam (70% to certify)',
                '3-month access window',
                'No subscription, ever',
              ]}
              cta={loadingTier === 'standard' ? 'Redirecting…' : 'Enroll'}
              onClick={() => checkout('standard')}
              disabled={loadingTier !== null}
            />
            <BigTier
              id="plus"
              name="Plus"
              price="$899"
              tagline="Standard course + your agent website on graduation."
              features={[
                'Everything in Standard',
                'Free agent website on passing the PSI exam',
                'Your own domain (yourname.com)',
                'CRM + lead capture + admin portal',
                'Launch playbook + curated lead packet',
                'Hawaii contract templates pre-filled',
                'Sponsoring-broker introductions',
                '6-month course access',
                'Monthly hosting / maintenance fee after launch',
              ]}
              cta={loadingTier === 'plus' ? 'Redirecting…' : 'Enroll'}
              onClick={() => checkout('plus')}
              disabled={loadingTier !== null}
              featured
            />
            <BigTier
              id="solo"
              name="Solo Website Build"
              price="$800"
              tagline="Already licensed? Just need the site."
              features={[
                'No course — site build only',
                'Custom-built Hawaii broker site',
                'Your own domain (yourname.com)',
                'CRM + lead capture + admin portal',
                'Branded to you (logo, colors, photo)',
                'We build it, deploy it, hand you the keys',
                'Monthly hosting / maintenance fee',
                'Open to any licensed HI broker or salesperson',
              ]}
              cta={loadingTier === 'solo' ? 'Redirecting…' : 'Order Site'}
              onClick={() => checkout('solo')}
              disabled={loadingTier !== null}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/example-website" target="_blank" rel="noopener" style={{ fontSize: 14, color: T.ocean, textDecoration: 'underline', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
              See a live example (Shayne M. Guthrie) →
            </Link>
          </div>
          {error && (
            <div style={{ maxWidth: 720, margin: '20px auto 0', padding: '12px 16px', background: 'rgba(193,70,40,0.08)', border: `1px solid rgba(193,70,40,0.32)`, color: T.coralDark, borderRadius: 10, fontSize: 13, textAlign: 'center' }}>
              {error}
            </div>
          )}
        </section>

        {/* COMPARISON */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '64px 32px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Side-by-side</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text }}>
                What&apos;s in each option.
              </h2>
            </div>
            <div style={{ ...CARD, padding: '24px 28px', borderRadius: 16, marginBottom: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700 }}>Feature</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700 }}>Standard</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700 }}>Plus ★</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700 }}>Solo Site</th>
                  </tr>
                </thead>
                <tbody>
                  <CompareRow label="20-chapter PSI curriculum" std plus />
                  <CompareRow label="Audiobook narration of every chapter" std plus />
                  <CompareRow label="24/7 AI Real Estate Tutor" std plus />
                  <CompareRow label="Smart flashcards + math drills + mock exams" std plus />
                  <CompareRow label="School final exam (70% to certify)" std plus />
                  <CompareRow label="Course access window" std="3 months" plus="6 months" />
                  <CompareRow label="Custom agent website (yourname.com)" plusConditional solo />
                  <CompareRow label="CRM + lead capture + admin portal" plusConditional solo />
                  <CompareRow label="Launch playbook + lead packet" plusConditional />
                  <CompareRow label="Sponsoring-broker introductions" plusConditional />
                  <CompareRow label="Monthly hosting / maintenance after launch" plusConditional solo last />
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 13, color: T.textMute, textAlign: 'center', maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>
              ★ Plus is the recommended path for first-time license candidates &mdash; you walk out with a license and a working business. Solo is for already-licensed agents who don&apos;t need the coursework.
            </p>
          </div>
        </section>

        {/* TIME WINDOW EXPLAINED */}
        <section style={{ padding: '64px 32px', maxWidth: 980, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>How the access window works</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: T.text, marginBottom: 14 }}>
              Three months on Standard. Six on Plus.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>
              Hawaii&apos;s REC-approved schools all use a defined access window for one reason: <strong style={{ color: T.text }}>real estate knowledge decays when it sits unused.</strong> The window is there to keep you focused, finish you on time, and protect your readiness when you walk into the PSI exam.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>
              <strong style={{ color: T.text }}>Standard:</strong> 3 months from enrollment. Studying 5&ndash;7 hours/week, most students finish in 6&ndash;8 weeks &mdash; the 3-month window is the cushion, not the average.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>
              <strong style={{ color: T.text }}>Plus:</strong> 6 months &mdash; double the window for students balancing the course with full-time work, family, or major life events.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 0 }}>
              If you don&apos;t finish in your window, re-enroll at a discounted alumni rate. Your school-completion certificate, once earned, is valid for two years per Hawaii REC rules.
            </p>
          </div>
        </section>

        {/* PLUS BUNDLE DETAIL */}
        <section style={{ padding: '0 32px 32px', maxWidth: 980, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18, borderLeftWidth: 4, borderLeftColor: T.ocean, borderLeftStyle: 'solid' }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Plus tier · The graduation bundle</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: T.text, marginBottom: 16 }}>
              Pass the exam. We hand you a working business.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim, marginBottom: 12 }}>
              Plus students who pass the PSI Hawaii Salesperson Exam unlock a complete agent launch kit: a <strong style={{ color: T.text }}>custom Hawaii broker website on your own domain</strong>, integrated CRM and lead-capture forms, an admin portal, broker intros, contract templates, and a curated starter lead packet for your first 90 days.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim, marginBottom: 12 }}>
              Same caliber of site as the example below &mdash; built, branded to you, and deployed. <Link href="/example-website" target="_blank" rel="noopener" style={{ color: T.ocean, textDecoration: 'underline' }}>See the live example (Shayne M. Guthrie)</Link>.
            </p>
            <p style={{ fontSize: 14, color: T.textMute, lineHeight: 1.7 }}>
              <strong style={{ color: T.text }}>Note:</strong> the website is delivered after you pass the PSI exam. A monthly hosting / maintenance fee applies once the site is live &mdash; domain renewal, SSL, CRM uptime, security patches, lead-capture infrastructure. Quoted at signup; transparent month-to-month, cancel anytime.
            </p>
          </div>
        </section>

        {/* SOLO WEBSITE DETAIL */}
        <section style={{ padding: '0 32px 64px', maxWidth: 980, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18, borderLeftWidth: 4, borderLeftColor: T.coral, borderLeftStyle: 'solid' }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Solo Website Build · For already-licensed agents</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: T.text, marginBottom: 16 }}>
              Already licensed? Skip the course. Get the site.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim, marginBottom: 12 }}>
              The same website build, CRM, lead capture, and admin portal that Plus students unlock on passing &mdash; available as a standalone purchase for Hawaii brokers and salespersons already in the field. <strong style={{ color: T.text }}>$800 one-time</strong> for the build, then a monthly hosting / maintenance fee to keep it running.
            </p>
            <p style={{ fontSize: 14, color: T.textMute, lineHeight: 1.7 }}>
              Includes domain registration (yourname.com), branded design, listings layout, contact + inquiry forms wired to your CRM, mobile-perfect responsive, and search-indexed. We build, deploy, hand you the keys.
            </p>
          </div>
        </section>

        {/* DISCLAIMERS */}
        <section style={{ padding: '0 32px 80px', maxWidth: 980, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: 28, borderRadius: 14, borderLeft: `3px solid ${T.coral}` }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 12 }}>The fine print</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Hawaii license requirement:</b> All Hawaii salesperson candidates must complete a 60-hour pre-licensing course at a REC-approved school for license eligibility. This program is structured to meet that requirement plus exam mastery. Verify current requirements at cca.hawaii.gov/reb.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Plus website delivery:</b> the custom agent website, domain registration, CRM, and admin portal in the Plus tier are delivered after the student passes the PSI Hawaii Salesperson Exam. A monthly hosting &amp; maintenance fee applies once the site is live (quoted at delivery, transparent month-to-month).
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Solo Website Build:</b> open to any Hawaii broker or salesperson with an active license. License verification required before site goes live. Same monthly hosting / maintenance terms apply.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Not legal advice.</b> Hawaii statutes change. Verify against current Hawaii Revised Statutes and REC rules before relying on any material for a real transaction.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Independent.</b> Not affiliated with the Hawaii Real Estate Commission, PSI, or any official body.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>One-time payment, no auto-renewal on course tuition.</b> Hosting / maintenance for delivered websites is the only recurring charge, and only after the site is live.
              </li>
            </ul>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function BigTier({ id, name, price, tagline, features, cta, onClick, disabled, featured }: {
  id: string; name: string; price: string; tagline: string; features: string[];
  cta: string; onClick: () => void; disabled?: boolean; featured?: boolean;
}) {
  return (
    <div id={id} style={{
      ...CARD,
      padding: '28px 26px', borderRadius: 18, position: 'relative',
      borderColor: featured ? T.ocean : undefined,
      borderWidth: featured ? 2 : 1,
      boxShadow: featured ? SHADOW_3D.lg : CARD.boxShadow,
      transform: featured ? 'translateY(-4px)' : undefined,
    }}>
      {featured && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: T.ocean, color: T.white, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 6, fontWeight: 700, whiteSpace: 'nowrap' }}>
          Recommended
        </div>
      )}
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 6 }}>{name}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em', color: T.text, marginBottom: 4, lineHeight: 1 }}>{price}</div>
      <div style={{ fontSize: 13, color: T.textDim, marginBottom: 18, lineHeight: 1.45, minHeight: 40 }}>{tagline}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
        {features.map((f, i) => (
          <li key={i} style={{ fontSize: 13, color: T.textDim, marginBottom: 10, lineHeight: 1.5, paddingLeft: 18, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: T.ocean, fontWeight: 700 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          ...(featured ? BUTTON_3D.primary : BUTTON_3D.secondary),
          width: '100%',
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: disabled ? 'wait' : 'pointer',
          fontFamily: 'inherit',
          border: featured ? 'none' : undefined,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {cta}
      </button>
    </div>
  );
}

function CompareRow({ label, std, plus, plusConditional, solo, last }: {
  label: string;
  std?: boolean | string;
  plus?: boolean | string;
  plusConditional?: boolean;
  solo?: boolean;
  last?: boolean;
}) {
  const cell = (val: boolean | string | undefined, conditional?: boolean, accent?: boolean) => {
    if (val === true) return <span style={{ color: accent ? T.ocean : T.green, fontWeight: 700 }}>✓</span>;
    if (typeof val === 'string') return <span style={{ color: T.text, fontWeight: 600, fontSize: 12 }}>{val}</span>;
    if (conditional) return <span style={{ color: T.ocean, fontWeight: 700, fontSize: 12 }}>✓ on passing</span>;
    return <span style={{ color: T.textGhost }}>—</span>;
  };
  // If plusConditional is set, treat plus as conditionally true
  const plusCell = plusConditional ? cell(undefined, true, true) : cell(plus, false, true);
  return (
    <tr style={{ borderBottom: last ? undefined : `1px solid ${T.border}` }}>
      <td style={{ padding: '12px 8px', fontSize: 14, color: T.text, fontWeight: 500, lineHeight: 1.4 }}>{label}</td>
      <td style={{ padding: '12px 8px', textAlign: 'center' }}>{cell(std)}</td>
      <td style={{ padding: '12px 8px', textAlign: 'center', background: 'rgba(20,131,123,0.04)' }}>{plusCell}</td>
      <td style={{ padding: '12px 8px', textAlign: 'center' }}>{cell(solo)}</td>
    </tr>
  );
}
