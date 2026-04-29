import Link from 'next/link';
import { CURRICULUM, NATIONAL_TOTAL, STATE_TOTAL, TOTAL_QUESTIONS, PASSING_PCT } from '@/lib/curriculum';
import { GLOSSARY } from '@/lib/content/glossary';
import { EXAM_BANK } from '@/lib/content/exam-bank';
import { T, SHADOW_3D, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function Landing() {
  const totalConcepts = CURRICULUM.reduce((s, c) => s + c.keyTerms, 0);
  const totalMinutes = CURRICULUM.reduce((s, c) => s + c.estimatedMinutes, 0);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <Hero />
        <StatsBar concepts={totalConcepts} minutes={totalMinutes} questions={EXAM_BANK.length} terms={GLOSSARY.length} />
        <ThreeStep />
        <BlueprintAlignment />
        <CurriculumPreview />
        <FeatureGrid />
        <Pricing />
        <Faq />
        <FinalCta />
        <Footer />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section style={{ padding: '96px 32px 56px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        display: 'inline-block', padding: '8px 16px', marginBottom: 28,
        background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 999,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.textMute,
      }}>
        Built on the official PSI Hawaii exam blueprint
      </div>
      <h1 style={{
        fontFamily: "'Playfair Display', serif", fontWeight: 900,
        fontSize: 'clamp(56px, 9vw, 120px)', letterSpacing: '-0.025em', lineHeight: 1.0,
        color: T.text, marginBottom: 24,
      }}>
        Pass Hawaii<br /><span style={{ color: T.ocean, fontStyle: 'italic' }}>real estate</span> the first time.
      </h1>
      <p style={{ fontSize: 21, color: T.textDim, maxWidth: 760, margin: '0 auto 40px', lineHeight: 1.5 }}>
        20 chapters. 200+ practice questions. 170+ glossary terms. Timed mock exams matching the {TOTAL_QUESTIONS}-question PSI format.
        Built by people who actually read the statutes.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/signup" style={{ ...BUTTON_3D.primary, padding: '16px 36px', fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 12, textDecoration: 'none' }}>
          Start studying free
        </Link>
        <Link href="/curriculum" style={{ ...BUTTON_3D.secondary, padding: '16px 32px', fontSize: 16, fontWeight: 600, borderRadius: 12, textDecoration: 'none' }}>
          See curriculum →
        </Link>
      </div>
    </section>
  );
}

function StatsBar({ concepts, minutes, questions, terms }: { concepts: number; minutes: number; questions: number; terms: number }) {
  return (
    <section style={{ padding: '48px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ ...CARD, padding: '36px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, alignItems: 'center' }}>
        <Stat n="20" label="Chapters" sub="Mapped to PSI blueprint" />
        <Stat n={`${concepts}+`} label="Concepts" sub="Tested explanations" />
        <Stat n={`${questions}+`} label="Practice Qs" sub="With explanations" />
        <Stat n={`${terms}+`} label="Glossary terms" sub="National + Hawaii" />
        <Stat n={`${Math.round(minutes / 60)}h`} label="Study time" sub="Comprehensive" />
      </div>
    </section>
  );
}

function Stat({ n, label, sub }: { n: string; label: string; sub: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 900, letterSpacing: '-0.02em', color: T.ocean, lineHeight: 1, marginBottom: 4 }}>{n}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.text, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: T.textMute }}>{sub}</div>
    </div>
  );
}

function ThreeStep() {
  return (
    <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Eyebrow>How it works</Eyebrow>
        <H2>Three steps to a pass.</H2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { n: '01', t: 'Learn the blueprint', b: 'Twenty chapters mirror PSI section weights — heaviest sections get heaviest study.' },
          { n: '02', t: 'Drill the concepts', b: 'Flashcards, per-chapter quizzes, glossary, math drills. Repeat what\'s weak until it sticks.' },
          { n: '03', t: 'Mock the exam', b: 'Timed 130-question full exam. National + state. 70% to pass. Repeat until 85%+ consistent.' },
        ].map((s) => (
          <div key={s.n} style={{ ...CARD, padding: 32 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 900, color: T.bgRaised, lineHeight: 1, marginBottom: 14 }}>{s.n}</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 10, letterSpacing: '-0.01em' }}>{s.t}</h3>
            <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6 }}>{s.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BlueprintAlignment() {
  return (
    <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ ...CARD, padding: 40, background: T.bgRaised }}>
        <Eyebrow>Exam blueprint</Eyebrow>
        <H2 style={{ marginBottom: 24 }}>What you\'re actually being tested on.</H2>
        <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.7, marginBottom: 28, maxWidth: 800 }}>
          Hawaii\'s licensing exam, administered by PSI, contains <b>{TOTAL_QUESTIONS} questions</b>: <b>{NATIONAL_TOTAL} national</b> + <b>{STATE_TOTAL} state</b>.
          You need <b>{PASSING_PCT}%</b> on each portion to pass — that\'s {Math.ceil(NATIONAL_TOTAL * 0.7)} out of {NATIONAL_TOTAL} national and {Math.ceil(STATE_TOTAL * 0.7)} out of {STATE_TOTAL} state.
          Our curriculum is structured so each chapter\'s depth matches its question weight on the official PSI Content Outline.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {CURRICULUM.map((c) => (
            <div key={c.slug} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: T.white, border: `1px solid ${T.border}`, borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600, minWidth: 24 }}>
                  {c.number.toString().padStart(2, '0')}
                </span>
                <span style={{ fontSize: 13, color: T.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: c.portion === 'state' ? T.coral : T.ocean, marginLeft: 12, flexShrink: 0 }}>
                {c.examItems}Q
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CurriculumPreview() {
  const featured = CURRICULUM.slice(0, 6);
  return (
    <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Eyebrow>Curriculum preview</Eyebrow>
        <H2>Start with the heavy hitters.</H2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {featured.map((c) => (
          <Link key={c.slug} href={`/chapter/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ ...CARD, padding: 24, height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase' }}>
                  Ch. {c.number.toString().padStart(2, '0')} · {c.portion}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.ocean, fontWeight: 700 }}>{c.examItems} questions</span>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 8, lineHeight: 1.2 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.55 }}>{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link href="/curriculum" style={{ ...BUTTON_3D.secondary, padding: '12px 24px', fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none' }}>
          See all 20 chapters →
        </Link>
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Eyebrow>What you get</Eyebrow>
        <H2>Everything you need. Nothing you don\'t.</H2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {[
          { t: 'Comprehensive chapters', b: 'Substantive overviews + key concepts + practice questions per chapter — not just bullet points.' },
          { t: 'Hawaii-specific depth', b: 'HRS 467, 514B, 521, 508D, 515 — the statutes that make the state exam distinct.' },
          { t: 'Timed mock exams', b: 'Same 130-Q / 240-min format as PSI. Take them until you\'re consistently 85%+.' },
          { t: 'Smart flashcards', b: 'Spaced repetition. Tap a tag to copy. Study on phone during commute.' },
          { t: '170+ glossary', b: 'Plain-English definitions. Hawaii terms flagged. Searchable.' },
          { t: 'Math drills', b: 'Acres, prorations, LTV, cap rate, commissions — repeated until automatic.' },
        ].map((f) => (
          <div key={f.t} style={{ ...CARD, padding: 24 }}>
            <div style={{ width: 36, height: 36, background: T.ocean, borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white, fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 18 }}>P</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 8 }}>{f.t}</h3>
            <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>{f.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Eyebrow>Pricing</Eyebrow>
        <H2>Pay once. Study until you pass.</H2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <PricingCard tier="Free" price="$0" sub="forever" perks={['First chapter (Property Ownership) full', '20 sample flashcards', '10 practice questions', 'Glossary access (read-only)']} cta="Start free" href="/signup" highlight={false} />
        <PricingCard tier="Lifetime" price="$97" sub="one-time" perks={['All 20 chapters · full content', 'Unlimited mock exams', 'Full flashcard deck (170+)', 'All math drills', 'Progress tracking', 'No expiration · re-take any time']} cta="Get lifetime" href="/signup?plan=lifetime" highlight={true} />
        <PricingCard tier="Pro" price="$197" sub="lifetime" perks={['Everything in Lifetime', 'Hawaii-specific deep-dive videos', '1-on-1 weekly Q&A (group)', 'Pass guarantee · re-pay if you don\'t pass on 2nd attempt', 'Continuing education credits (post-license)']} cta="Go Pro" href="/signup?plan=pro" highlight={false} />
      </div>
      <p style={{ textAlign: 'center', fontSize: 13, color: T.textMute, marginTop: 20, fontStyle: 'italic' }}>
        Compare: Vitousek textbook $50 + Prep Kit $175 = $225. Ralph&apos;s Lifetime gets you more for $97.
      </p>
    </section>
  );
}

function PricingCard({ tier, price, sub, perks, cta, href, highlight }: { tier: string; price: string; sub: string; perks: string[]; cta: string; href: string; highlight: boolean }) {
  return (
    <div style={{
      ...CARD,
      padding: 32,
      border: highlight ? `2px solid ${T.ocean}` : `1px solid ${T.border}`,
      transform: highlight ? 'scale(1.02)' : 'none',
      position: 'relative',
    }}>
      {highlight && (
        <div style={{ position: 'absolute', top: -10, left: 24, padding: '4px 12px', background: T.ocean, color: T.white, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: 999 }}>
          Most popular
        </div>
      )}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 8 }}>{tier}</div>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 56, fontWeight: 900, color: T.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{price}</span>
        <span style={{ fontSize: 13, color: T.textMute, marginLeft: 8 }}>{sub}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {perks.map((p) => (
          <li key={p} style={{ display: 'flex', gap: 10, fontSize: 13, color: T.textDim, lineHeight: 1.5 }}>
            <span style={{ color: T.ocean, fontWeight: 700 }}>✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Link href={href} style={{ ...((highlight ? BUTTON_3D.primary : BUTTON_3D.secondary)), display: 'block', textAlign: 'center', padding: '12px 22px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, textDecoration: 'none' }}>
        {cta}
      </Link>
    </div>
  );
}

function Faq() {
  const items: Array<[string, string]> = [
    ['Is this affiliated with the Hawaii REC?', "No. Ralph's Real Estate Academy is an independent study aid. The 60-hour pre-licensing course must still be completed at a REC-approved school. Use this academy to drill the material before, during, and after."],
    ['Can I pass without the 60-hour course?', 'No — Hawaii requires the 60-hour Salesperson Pre-Licensing Course at an approved school for license eligibility. This academy is a study supplement, not a replacement.'],
    ['How is this different from Vitousek\'s prep kit?', "Ralph's Academy is built around the official PSI Content Outline, structured digitally for active recall, mobile-first, includes unlimited timed mock exams, and updates as Hawaii law changes — printed books can\'t."],
    ['What about the broker exam?', 'Most chapters cover broker-relevant material too. A dedicated Broker module is on the roadmap.'],
    ['Do you guarantee I\'ll pass?', 'The Pro tier includes a pass guarantee — if you complete the curriculum and don\'t pass on your 2nd attempt, we refund. Free and Lifetime tiers don\'t.'],
    ['Is the content original?', 'Yes. All chapter content is original writing based on the public PSI Content Outline, Hawaii Revised Statutes, and general real estate principles. No textbook excerpts.'],
  ];
  return (
    <section style={{ padding: '64px 32px', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Eyebrow>FAQ</Eyebrow>
        <H2>Direct answers.</H2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(([q, a]) => (
          <div key={q} style={{ ...CARD, padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: T.text }}>{q}</h3>
            <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.65 }}>{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section style={{ padding: '80px 32px', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
      <H2 style={{ marginBottom: 18 }}>The exam doesn\'t care how hard you tried.</H2>
      <p style={{ fontSize: 17, color: T.textDim, marginBottom: 32, lineHeight: 1.6 }}>
        It cares whether you got 70% on each portion. We make sure you do.
      </p>
      <Link href="/signup" style={{ ...BUTTON_3D.primary, padding: '18px 40px', fontSize: 17, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 12, textDecoration: 'none' }}>
        Start studying free →
      </Link>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: T.textMute, marginBottom: 14, fontWeight: 600 }}>{children}</div>;
}

function H2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 56px)',
      fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1,
      ...style,
    }}>{children}</h2>
  );
}
