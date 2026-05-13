'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T, BUTTON_3D, CARD, SHADOW_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

type CheckoutTier = 'standard' | 'plus' | 'solo';

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<CheckoutTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Read ?reason= from window.location instead of useSearchParams. Next 15
  // requires useSearchParams to be wrapped in <Suspense> for static
  // prerender, and the whole page is statically rendered. Reading from
  // window is safer + keeps the page prerender-clean.
  const [reason, setReason] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const r = new URL(window.location.href).searchParams.get('reason');
    setReason(r);
  }, []);
  // Auto-scroll to expiration policy block for re-enroll context
  useEffect(() => {
    if (reason === 're_enroll' && typeof window !== 'undefined') {
      // Small delay so the page has painted
      setTimeout(() => {
        const el = document.getElementById('expiration-policy');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [reason]);

  const checkout = async (tier: CheckoutTier) => {
    setLoadingTier(tier);
    setError(null);
    try {
      // Pre-flight session check so we redirect to /login if the visitor
      // is anonymous, instead of bouncing them through Stripe's hosted
      // login screen. Keeps everything on our domain.
      const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
      const meBody = await meRes.json().catch(() => ({}));
      if (!meBody?.user) {
        window.location.href = `/login?next=${encodeURIComponent(`/checkout/${tier}`)}`;
        return;
      }
      // Embedded Checkout: the new /checkout/[sku] page renders Stripe's
      // form inline on ralphfoulger.com. No more redirect to checkout.stripe.com.
      window.location.href = `/checkout/${tier}`;
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
          <p style={{ fontSize: 15, color: T.ocean, lineHeight: 1.6, maxWidth: 760, margin: '12px auto 0', fontWeight: 600 }}>
            Hawaii requires 60 study hours. <strong style={{ color: T.text }}>Full-time students finish in about two weeks.</strong> The 3- and 6-month windows below are ceilings &mdash; the cushion for life, not the expected pace.
          </p>
          <p style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', marginTop: 16 }}>
            All prices USD · One-time payment · Hosting / maintenance fee applies to websites
          </p>
        </section>

        {/* RE-ENROLL BANNER (visible when expired Standard hits /pricing) */}
        {reason === 're_enroll' && (
          <section style={{ padding: '8px 32px 0', maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ ...CARD, padding: '18px 24px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderLeftWidth: 4, borderLeftColor: T.coral, borderLeftStyle: 'solid' }}>
              <div style={{ flex: '1 1 360px' }}>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', marginBottom: 6 }}>Your Standard window has expired</div>
                <div style={{ fontSize: 15, color: T.text, lineHeight: 1.55 }}>
                  Re-enroll at the full <strong>$599</strong> Standard price for a fresh 3-month window, or upgrade to <strong>Plus ($899)</strong> for 6 months plus the agent-website bundle on graduation. Standard doesn&apos;t include the $249.99 extension &mdash; that&apos;s a Plus-only benefit. <a href="#expiration-policy" style={{ color: T.coral, textDecoration: 'underline' }}>Why is that?</a>
                </div>
              </div>
            </div>
          </section>
        )}

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
                'Built-in study planner with goal-date scheduler',
                '3-month access ceiling (full-time finishes in ~2 weeks)',
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
                'Built-in study planner with goal-date scheduler',
                '6-month access ceiling + $249.99 extension safety net',
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
              See a live example (Shayne M. Guthrie, Realtor) →
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
                  <CompareRow label="Access ceiling (finish faster if you want)" std="3 months" plus="6 months" />
                  <CompareRow label="$249.99 extension (+90 days) at expiry" plus="Yes" />
                  <CompareRow label="Re-enrollment at full price after expiry" std="$599" plus="(if extension used up)" />
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
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>How long this actually takes</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: T.text, marginBottom: 14 }}>
              60 hours. That&apos;s the real number.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>
              Hawaii REC requires 60 documented study hours before you&apos;re exam-eligible. <strong style={{ color: T.text }}>That&apos;s the whole timeline.</strong> Not three months. Not six. Sixty hours. How fast you cover them is up to you.
            </p>

            <div style={{ background: T.bgRaised, borderRadius: 12, padding: 22, border: `1px solid ${T.border}`, marginBottom: 18 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>What 60 hours looks like at different paces</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>
                  <strong style={{ color: T.ocean }}>6 hrs/day, full-time:</strong> <strong style={{ color: T.text }}>~10 days.</strong> People do this. Career switchers between jobs, students on break.
                </li>
                <li style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>
                  <strong style={{ color: T.ocean }}>4 hrs/day:</strong> <strong style={{ color: T.text }}>~15 days.</strong> Two solid weeks if you treat it like a job.
                </li>
                <li style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>
                  <strong style={{ color: T.ocean }}>2 hrs/day after work:</strong> <strong style={{ color: T.text }}>~30 days.</strong> The classic month-long evenings-and-weekends plan.
                </li>
                <li style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>
                  <strong style={{ color: T.ocean }}>1 hr/day:</strong> <strong style={{ color: T.text }}>~60 days.</strong> Two months at a relaxed pace.
                </li>
                <li style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>
                  <strong style={{ color: T.ocean }}>3 hrs/week:</strong> <strong style={{ color: T.text }}>~5 months.</strong> Whenever-you-can mode &mdash; this is when the Plus window matters.
                </li>
              </ul>
              <p style={{ fontSize: 13, color: T.textMute, marginTop: 14, lineHeight: 1.6 }}>
                Your profile has a <strong style={{ color: T.text }}>built-in study planner</strong> &mdash; pick a goal date, it generates your daily time blocks, you check off as you go.
              </p>
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>
              <strong style={{ color: T.text }}>Standard ($599) gives you 3 months of access. Plus ($899) gives you 6.</strong> Those are ceilings &mdash; the latest moment access ends. They&apos;re not how long it should take. They exist so a hard week, a sick kid, or a busy season at work doesn&apos;t lock you out before you finish.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 0 }}>
              Pick Standard if you have the bandwidth to study most days. Pick Plus if your schedule is unpredictable, you want the agent-website bundle on graduation, or you simply want the bigger cushion <em>plus</em> the $249.99 extension safety net described below.
            </p>
          </div>
        </section>

        {/* EXPIRATION POLICY — what happens at end of window */}
        <section id="expiration-policy" style={{ padding: '0 32px 32px', maxWidth: 980, margin: '0 auto', scrollMarginTop: 80 }}>
          <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18, borderLeftWidth: 4, borderLeftColor: T.coral, borderLeftStyle: 'solid' }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>What happens when your window ends</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: T.text, marginBottom: 16 }}>
              Two different policies. Read this before you pick a tier.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 18 }}>
              Your profile shows the exact <strong style={{ color: T.text }}>day, hour, and minute</strong> remaining in your window. We don&apos;t hide it, don&apos;t bury it, and won&apos;t silently revoke access without warning &mdash; the timer escalates from green &rarr; blue &rarr; orange as expiry approaches.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 14 }}>
              <div style={{ background: T.bgRaised, borderRadius: 12, padding: 22, border: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Standard · 3 months</div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 10, lineHeight: 1.25 }}>
                  At expiration, re-enroll at the full $599 Standard price.
                </h3>
                <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, margin: 0 }}>
                  Standard does <strong style={{ color: T.coral }}>not</strong> include the $249.99 extension &mdash; that benefit is reserved for the Plus tier. If your 3-month window ends before you finish, the only path forward is a fresh Standard enrollment (or upgrade to Plus). Your study history, quiz scores, and 60-hour state-law progress are preserved on your account.
                </p>
              </div>

              <div style={{ background: T.bgRaised, borderRadius: 12, padding: 22, border: `1px solid ${T.ocean}` }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Plus · 6 months + extension</div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 800, color: T.text, marginBottom: 10, lineHeight: 1.25 }}>
                  At expiration, you can buy 90 more days for $249.99.
                </h3>
                <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, margin: 0 }}>
                  Plus students who don&apos;t finish in their 6-month window get a Plus-only safety net: a one-time <strong style={{ color: T.text }}>$249.99 extension</strong> that unlocks <strong style={{ color: T.text }}>90 additional days</strong> of full course access &mdash; a fair second attempt at the curriculum and the PSI exam. The extension button only appears in your profile <strong style={{ color: T.text }}>after</strong> your window expires; you can&apos;t buy it preemptively. Your graduation-bundle agent website stays attached to your account.
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: T.textMute, lineHeight: 1.7, margin: '14px 0 0' }}>
              <strong style={{ color: T.text }}>Why this design?</strong> Real estate licensing is a serious commitment. Open-ended access encourages procrastination; the window keeps you finishing. The Plus extension exists for people whose life genuinely got in the way of a 6-month plan &mdash; not as a discount on procrastination. Standard students who need more cushion are exactly who Plus is designed for, which is why Standard re-enrolls at full price rather than offering an extension.
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
              Same caliber of site as the example below &mdash; built, branded to you, and deployed. <Link href="/example-website" target="_blank" rel="noopener" style={{ color: T.ocean, textDecoration: 'underline' }}>See the live example (Shayne M. Guthrie, Realtor)</Link>.
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
                <b style={{ color: T.text }}>REC-approved pre-license course.</b> Ralph Foulger&rsquo;s Academy of Real Estate is an approved Hawaii Real Estate Commission pre-license course provider. Course-completion certificate is valid for 2 years per Hawaii REC rules and qualifies you to register for the PSI Hawaii Salesperson Exam. PSI administers the state exam separately; we are not a PSI testing site.
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
