import Link from 'next/link';
import { T, SHADOW_3D, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

const LESSONS = [
  {
    n: 1,
    title: 'Is Real Estate Right for You?',
    body: 'A clear-eyed look at what the job actually is — the income realities, the personality fit, the time horizons. Walk away with a real answer.',
    duration: '8 min',
  },
  {
    n: 2,
    title: 'Hawaii Market 101',
    body: 'How Hawaii real estate is different — leasehold vs fee simple, condo dominance, military buyers, mainland investors, the seasonal rhythms.',
    duration: '10 min',
  },
  {
    n: 3,
    title: 'The License Pathway, Mapped',
    body: 'The exact 60-hour pre-license course requirement, the PSI exam (80 + 50 questions), the application process, and finding a sponsoring broker.',
    duration: '7 min',
  },
  {
    n: 4,
    title: 'The Real Income Picture',
    body: 'Commission splits, brokerage fees, MLS dues, E&O insurance, taxes (you&apos;re a 1099). What new agents actually take home in year one — not the brochure number.',
    duration: '9 min',
  },
  {
    n: 5,
    title: '5 Things Every Hawaii Agent Knows on Day 1',
    body: 'HARPTA, GET, the standard purchase contract, the agency disclosure, and how to read a leasehold lease. The bare minimum to not embarrass yourself with your first client.',
    duration: '12 min',
  },
];

export default function FreeFoundation() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/free" />

        {/* HERO */}
        <section style={{ padding: '72px 32px 48px', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: T.bgElevated, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.coral, textTransform: 'uppercase', marginBottom: 24 }}>
            100% Free · No Credit Card
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(44px, 6vw, 76px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.02, color: T.text, marginBottom: 20 }}>
            The Free Foundation Course
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: T.textDim, maxWidth: 660, margin: '0 auto 28px' }}>
            Five short lessons. About 45 minutes total. Decide if Hawaii real estate is for you &mdash; before you spend a dollar on the full course.
          </p>
          <Link href="#lesson-1" style={{ ...BUTTON_3D.primary, padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start Lesson 1 →
          </Link>
        </section>

        {/* WHY THIS EXISTS */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '48px 32px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: T.text, marginBottom: 16 }}>
              Why this is free.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim }}>
              Most schools push you straight to a $400&ndash;$900 enrollment without first answering whether real estate even makes sense for your life. We do it the other way around. Walk through these five lessons. If you&apos;re in &mdash; the full course is waiting. If you&apos;re not &mdash; we just saved you months and thousands.
            </p>
          </div>
        </section>

        {/* THE 5 LESSONS */}
        <section style={{ padding: '64px 32px', maxWidth: 880, margin: '0 auto' }}>
          {LESSONS.map((lesson) => (
            <div key={lesson.n} id={`lesson-${lesson.n}`} style={{
              ...CARD, padding: '28px 32px', borderRadius: 16, marginBottom: 16,
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
            }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 56, fontWeight: 900, color: T.ocean, lineHeight: 1, opacity: 0.5 }}>{lesson.n}</div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: '-0.01em' }}>{lesson.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: T.textDim }}>{lesson.body}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>{lesson.duration}</div>
                <div style={{ ...BUTTON_3D.secondary, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', display: 'inline-block', cursor: 'pointer' }}>
                  Open
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* AFTER THE FREE COURSE — UPSELL */}
        <section style={{ background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgElevated} 100%)`, borderTop: `1px solid ${T.border}`, padding: '72px 32px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>If you&apos;re in</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text, marginBottom: 16 }}>
              The full course is the next step.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim, maxWidth: 600, margin: '0 auto 28px' }}>
              60 hours of state-required curriculum. {' '}
              <strong style={{ color: T.text }}>Every chapter narrated as audio.</strong>{' '}
              Smart flashcards. Math drills. Full mock exams. Pass guarantee on Coached and VIP tiers.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pricing" style={{ ...BUTTON_3D.primary, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none' }}>
                See Pricing →
              </Link>
              <Link href="/course" style={{ ...BUTTON_3D.secondary, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none' }}>
                Tour the Curriculum
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
