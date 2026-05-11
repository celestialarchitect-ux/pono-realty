import Link from 'next/link';
import { T, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { FREE_LESSONS } from './lessons-data';

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
          <Link href={`/free/${FREE_LESSONS[0].slug}`} style={{ ...BUTTON_3D.primary, padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
        <section data-mobile-padding style={{ padding: '64px 32px', maxWidth: 880, margin: '0 auto' }}>
          {FREE_LESSONS.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/free/${lesson.slug}`}
              style={{
                ...CARD, padding: '24px 28px', borderRadius: 16, marginBottom: 14,
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center',
                textDecoration: 'none', color: 'inherit', cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 52, fontWeight: 900, color: T.ocean, lineHeight: 1, opacity: 0.5 }}>{lesson.number}</div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: '-0.01em' }}>{lesson.title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: T.textDim }}>{lesson.summary}</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase' }}>{lesson.duration}</div>
                <div style={{ ...BUTTON_3D.secondary, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>
                  Open →
                </div>
              </div>
            </Link>
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
              Smart flashcards. Math drills. Full mock exams. Plus tier graduates earn a free agent website on their own domain.
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
