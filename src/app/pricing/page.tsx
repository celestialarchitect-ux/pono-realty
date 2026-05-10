import Link from 'next/link';
import { T, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function PricingPage() {
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
          <p style={{ fontSize: 18, color: T.textDim, lineHeight: 1.6, maxWidth: 720, margin: '0 auto 8px' }}>
            Three paths. From a free taste of the field, to the full curriculum with the AI tutor, to the same plus a pass-or-pay-zero guarantee.
          </p>
          <p style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', marginTop: 16 }}>
            All prices in USD · One-time payment · 6-month course window (12 on Plus)
          </p>
        </section>

        {/* THREE TIERS */}
        <section style={{ padding: '32px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <BigTier
              id="free"
              name="Free Foundation"
              price="$0"
              tagline="Decide if real estate is for you."
              features={[
                '5-lesson preview course',
                'Hawaii market 101',
                'Career fit assessment',
                'Income reality check',
                'Day-1 essentials breakdown',
              ]}
              cta="Start Free"
              href="/free"
            />
            <BigTier
              id="standard"
              name="Standard"
              price="$599"
              tagline="The complete prep system."
              features={[
                'All 20 chapters (PSI-aligned)',
                '🎧 Full audiobook narration',
                '🤖 24/7 AI Real Estate Tutor',
                'Smart flashcards (spaced repetition)',
                'Math drills with worked examples',
                '130-question mock exams',
                'Searchable glossary',
                'School final exam (70% to certify)',
                '6-month access window',
              ]}
              cta="Enroll"
              href="/signup?tier=standard"
            />
            <BigTier
              id="plus"
              name="Plus"
              price="$899"
              tagline="With Pass-or-Pay-Zero guarantee."
              features={[
                'Everything in Standard',
                '🛡️ Pass-or-Pay-Zero guarantee',
                '12-month extended access',
                'Coach-graded mock exam review',
                'Priority AI tutor lane',
                'Exam-week intensive checklist',
                'Personal weakness mapping',
              ]}
              cta="Enroll"
              href="/signup?tier=plus"
              featured
            />
          </div>
        </section>

        {/* COMPARISON */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '64px 32px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Why we cost a little more</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text }}>
                Most Hawaii schools end at the textbook. We give you a study system.
              </h2>
            </div>
            <div style={{ ...CARD, padding: '32px 36px', borderRadius: 16, marginBottom: 20 }}>
              <ValueRow label="Full audiobook narration of every chapter" included="Standard & Plus" elsewhere="Audio sold separately or absent" />
              <ValueRow label="24/7 AI Real Estate Tutor" included="Standard & Plus" elsewhere="Not offered anywhere in Hawaii" />
              <ValueRow label="Smart flashcards with spaced repetition" included="Standard & Plus" elsewhere="Static flashcards or none" />
              <ValueRow label="Math drills with step-by-step worked examples" included="Standard & Plus" elsewhere="Calculation sections in textbook only" />
              <ValueRow label="Adaptive review (auto-mapped weak spots)" included="Standard & Plus" elsewhere="Manual review only" />
              <ValueRow label="Mobile-first platform" included="Standard & Plus" elsewhere="Desktop-first or PDFs" />
              <ValueRow label="Pass-or-Pay-Zero guarantee" included="Plus only" elsewhere="Some offer same-content retake" />
              <ValueRow label="One-time payment, no subscription" included="All tiers" elsewhere="Subscription common" />
              <ValueRow label="Lifetime updates as Hawaii law changes" included="All paid tiers" elsewhere="Annual subscription typical" last />
            </div>
            <p style={{ fontSize: 14, color: T.textMute, textAlign: 'center', maxWidth: 660, margin: '0 auto', lineHeight: 1.7 }}>
              Compared honestly across the 28 Hawaii REC-registered schools and major national platforms. Reflects publicly listed offerings as of 2026.
            </p>
          </div>
        </section>

        {/* TIME WINDOW EXPLAINED */}
        <section style={{ padding: '64px 32px', maxWidth: 980, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>How the access window works</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: T.text, marginBottom: 14 }}>
              Six months on Standard. Twelve on Plus.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>
              Hawaii&apos;s REC-approved schools all use a defined access window for one reason: <strong style={{ color: T.text }}>real estate knowledge decays when it sits unused.</strong> The window is there to keep you focused, finish you on time, and protect your readiness when you walk into the PSI exam.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>
              <strong style={{ color: T.text }}>Standard:</strong> 6 months from enrollment to complete the curriculum and pass our school final exam at 70% or above. Our recommendation: study 4&ndash;6 hours/week and you&apos;ll finish in 3&ndash;4 months with room to spare.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>
              <strong style={{ color: T.text }}>Plus:</strong> 12 months &mdash; double the window for students balancing the course with full-time work or major life events.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 0 }}>
              If you don&apos;t complete in your window, you can re-enroll at a discounted rate. Your school-completion certificate, once earned, is valid for two years per Hawaii REC rules.
            </p>
          </div>
        </section>

        {/* GUARANTEE */}
        <section style={{ padding: '0 32px 64px', maxWidth: 980, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18, borderLeftWidth: 4, borderLeftColor: T.ocean, borderLeftStyle: 'solid' }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Plus-tier guarantee</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: T.text, marginBottom: 16 }}>
              Pass-or-Pay-Zero
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim, marginBottom: 12 }}>
              Plus students who complete the full curriculum (all chapters watched/read, all quizzes passed at &ge;70%, full mock exam taken) and don&apos;t pass the PSI Hawaii Salesperson Exam on their first attempt get their second-attempt prep <strong style={{ color: T.text }}>completely free.</strong>
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim, marginBottom: 12 }}>
              Includes: another exam-week intensive review, fresh mock exams, priority AI tutor lane, and additional cohort coaching. No paperwork gymnastics, no fine print &mdash; we built the system that wins, and we&apos;re willing to bet on it.
            </p>
            <p style={{ fontSize: 14, color: T.textMute, lineHeight: 1.6 }}>
              Statewide first-attempt pass rate is 40&ndash;45% (Hawaii REC, 2025). With the full system, our students aim for the top of that distribution &mdash; not the middle.
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
                <b style={{ color: T.text }}>Not legal advice.</b> Hawaii statutes change. Verify against current Hawaii Revised Statutes and REC rules before relying on any material for a real transaction.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>Independent.</b> Not affiliated with the Hawaii Real Estate Commission, PSI, or any official body.
              </li>
              <li style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
                <b style={{ color: T.text }}>One-time payment, no auto-renewal.</b> No subscription. Your access window is fixed at enrollment (6 months Standard, 12 months Plus). After expiration, re-enroll at a discounted alumni rate.
              </li>
            </ul>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function BigTier({ id, name, price, tagline, features, cta, href, featured }: {
  id: string; name: string; price: string; tagline: string; features: string[];
  cta: string; href: string; featured?: boolean;
}) {
  return (
    <div id={id} style={{
      ...CARD,
      padding: '28px 26px', borderRadius: 18, position: 'relative',
      borderColor: featured ? T.ocean : undefined,
      borderWidth: featured ? 2 : 1,
      transform: featured ? 'translateY(-4px)' : undefined,
    }}>
      {featured && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: T.ocean, color: T.white, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 6, fontWeight: 700 }}>
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
      <Link href={href} style={{ ...(featured ? BUTTON_3D.primary : BUTTON_3D.secondary), display: 'block', textAlign: 'center', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
        {cta}
      </Link>
    </div>
  );
}

function ValueRow({ label, included, elsewhere, last }: { label: string; included: string; elsewhere: string; last?: boolean }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 20, padding: '12px 0',
      borderBottom: last ? undefined : `1px solid ${T.border}`,
      alignItems: 'center',
    }}>
      <div style={{ fontSize: 14, color: T.text, fontWeight: 500, lineHeight: 1.4 }}>{label}</div>
      <div style={{ fontSize: 13, color: T.ocean, fontWeight: 600, lineHeight: 1.4 }}>
        <span style={{ marginRight: 6 }}>✓</span>{included}
      </div>
      <div style={{ fontSize: 12, color: T.textMute, lineHeight: 1.4 }}>{elsewhere}</div>
    </div>
  );
}
