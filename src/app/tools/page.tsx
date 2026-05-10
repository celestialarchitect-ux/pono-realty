import Link from 'next/link';
import { T, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function AIAssistant() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/tools" />

        {/* HERO */}
        <section style={{ padding: '72px 32px 48px', maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: T.bgElevated, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.ocean, textTransform: 'uppercase', marginBottom: 24 }}>
              Included with Every Paid Tier
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(44px, 6vw, 76px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.02, color: T.text, marginBottom: 20 }}>
              Your <em style={{ fontStyle: 'italic', color: T.ocean }}>AI Real Estate Tutor.</em>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: T.textDim, maxWidth: 720, margin: '0 auto' }}>
              A 24/7 study companion trained on the Hawaii real estate curriculum, the PSI exam content outline, and a deep library of real estate textbooks. Stuck on prorations at 11 PM? Confused by leasehold disclosure? Ask. Answer in seconds.
            </p>
          </div>
        </section>

        {/* WHAT IT DOES */}
        <section style={{ padding: '24px 32px 56px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <Capability
              icon="🎯"
              title="Hawaii-Specific Answers"
              body="Trained on Hawaii Revised Statutes 467, 514B, 521, the standard purchase contract, HARPTA, GET, leasehold disclosures, and Land Court vs. Regular System. Knows the difference between national rules and Hawaii's local twists."
            />
            <Capability
              icon="🧮"
              title="Math, Worked Step by Step"
              body="Don't just get the answer — get the path to the answer. The tutor walks you through prorations, commission splits, LTV, capitalization, and GRM with every step explained until it clicks."
            />
            <Capability
              icon="📖"
              title="Defines Any Term, In Context"
              body="Stuck on a vocabulary word? Ask. The tutor pulls the definition from the curriculum, gives you a real-world example, and tells you which chapter and which exam category it shows up in."
            />
            <Capability
              icon="🤔"
              title="Explains Why You Got It Wrong"
              body="Miss a quiz question? Drop it into the tutor. It diagnoses the misconception, shows you the right reasoning, and links back to the chapter that covers it. No more guessing what went wrong."
            />
            <Capability
              icon="📅"
              title="Quizzes You On Demand"
              body="Ask for 5 questions on agency law. 10 questions on Hawaii financing. A surprise mock for tomorrow's study session. The tutor generates questions calibrated to PSI difficulty and grades you instantly."
            />
            <Capability
              icon="🏆"
              title="Exam-Week Cram Mode"
              body="The week before your real exam, the tutor switches into intensive review — daily question drills, weakness drilldowns, confidence pacing. Built specifically to get you over the line."
            />
          </div>
        </section>

        {/* HONEST FRAMING */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '64px 32px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>What it&apos;s NOT</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: T.text, marginBottom: 20 }}>
              A way around doing the work.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim, marginBottom: 12 }}>
              The AI tutor is a study aid &mdash; not a shortcut. It will explain anything you ask. It will walk you through every concept until it makes sense. <strong style={{ color: T.text }}>It won&apos;t take the exam for you, and it won&apos;t replace doing the reading.</strong>
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim }}>
              Used the right way, it&apos;s the difference between studying alone and studying with a patient expert always available. Used the wrong way &mdash; copying answers without understanding &mdash; and the real PSI exam will catch you.
            </p>
          </div>
        </section>

        {/* ACCESS */}
        <section style={{ padding: '64px 32px', maxWidth: 880, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>How to access</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: T.text, marginBottom: 14 }}>
              Unlocks the moment you enroll.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: T.textDim, marginBottom: 16 }}>
              The AI tutor is bundled into <strong style={{ color: T.text }}>every paid tier</strong> &mdash; Standard and Coached. The moment your enrollment is confirmed, you have unlimited access for the full course window.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: T.textDim, marginBottom: 24 }}>
              Free Foundation users see a sample preview but full access lives behind purchase &mdash; because the tutor is trained on premium licensed material we maintain on your behalf.
            </p>
            <Link href="/pricing" style={{ ...BUTTON_3D.primary, padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              See pricing &amp; enroll →
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function Capability({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ ...CARD, padding: '26px 24px', borderRadius: 16 }}>
      <div style={{ fontSize: 32, marginBottom: 12, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 10, color: T.text, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim }}>{body}</div>
    </div>
  );
}
