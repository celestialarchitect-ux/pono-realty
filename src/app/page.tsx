import Link from 'next/link';
import { CURRICULUM, NATIONAL_TOTAL, STATE_TOTAL } from '@/lib/curriculum';
import { GLOSSARY } from '@/lib/content/glossary';
import { EXAM_BANK } from '@/lib/content/exam-bank';
import { T, SHADOW_3D, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

const HERO_IMG = 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=2400&q=85&auto=format&fit=crop';

export default function Landing() {
  const totalQ = EXAM_BANK.length;
  const totalTerms = GLOSSARY.length;
  const totalMinutes = CURRICULUM.reduce((s, c) => s + c.estimatedMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/" />

        {/* HERO */}
        <section style={{ padding: '64px 32px 48px', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: T.bgElevated, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.ocean }} /> Hawaii · Built for 2026
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(44px, 6vw, 76px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.02, marginBottom: 22, color: T.text }}>
                Pass Hawaii&apos;s real estate exam <em style={{ color: T.ocean, fontStyle: 'italic' }}>the first time.</em>
              </h1>
              <p style={{ fontSize: 19, lineHeight: 1.6, color: T.textDim, marginBottom: 28, maxWidth: 560 }}>
                The most sophisticated licensing system ever built for the Hawaii salesperson exam &mdash; every chapter narrated as audio, smart flashcards, math drills, full-length mock exams, and a post-license launchpad with leads and your own agent website.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                <Link href="/free" style={{ ...BUTTON_3D.primary, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Start the Free Foundation Course →
                </Link>
                <Link href="/pricing" style={{ ...BUTTON_3D.secondary, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none' }}>
                  See Pricing
                </Link>
              </div>
              <div style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
                Free foundation · No credit card · Pass guarantee on paid tiers
              </div>
            </div>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: SHADOW_3D.lg, aspectRatio: '4 / 5' }}>
              <img src={HERO_IMG} alt="Hawaii real estate" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(14,26,38,0.55) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px', color: '#fff' }}>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', opacity: 0.85, textTransform: 'uppercase', marginBottom: 6 }}>Founded by</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em' }}>Ralph Foulger</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Veteran Hawaii broker · Decades of licensing &amp; training experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* THE STATEWIDE PROBLEM */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '56px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>The 2025 reality</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text, maxWidth: 880, margin: '0 auto' }}>
                Most Hawaii test-takers don&apos;t pass on their first attempt.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              <Stat big="922" sub="candidates tested in the past 12 months across all 28 Hawaii schools" />
              <Stat big="40–45%" sub="statewide pass rate (Hawaii REC, rolling 2025 data)" highlight />
              <Stat big="55%+" sub="of test-takers fail and have to retake" />
              <Stat big="$300+" sub="average cost of every retake — and weeks lost" />
            </div>
            <p style={{ textAlign: 'center', fontSize: 15, color: T.textDim, maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>
              We built Ralph Foulger&apos;s School of Real Estate to fix that. Every tool below exists because we studied where students fall short — and we engineered the curriculum to close those gaps.
            </p>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.textGhost, textTransform: 'uppercase' }}>
                Source: Hawaii Real Estate Commission &middot; School Files Q3 2025 (cca.hawaii.gov)
              </span>
            </div>
          </div>
        </section>

        {/* THE VALUE STACK */}
        <section style={{ padding: '72px 32px', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>What you get</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: T.text }}>
              The most complete prep system in Hawaii.
            </h2>
            <p style={{ fontSize: 16, color: T.textDim, maxWidth: 640, margin: '20px auto 0', lineHeight: 1.7 }}>
              Built around the exact PSI exam blueprint &mdash; {CURRICULUM.length} chapters, {NATIONAL_TOTAL} national + {STATE_TOTAL} state items, {totalHours}+ hours of study material.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            <Feature
              icon="🎧"
              title="Audiobook for every chapter"
              body="Listen in the car, on a hike, at the gym. Every chapter is professionally narrated so you can learn while you live your life. No other Hawaii school does this end-to-end."
            />
            <Feature
              icon="📖"
              title="Read → Study → Quiz, per chapter"
              body="Each chapter teaches in three phases. You read the material, internalize the key terms, then prove you got it before moving on. Knowledge sticks because the structure forces it to."
            />
            <Feature
              icon="🃏"
              title={`${totalTerms}+ smart flashcards`}
              body="Spaced repetition built in &mdash; the cards you miss come back more often, the ones you nail recede. The system learns you and prioritizes your weak spots automatically."
            />
            <Feature
              icon="🧮"
              title="Math drills (where most fail)"
              body="Prorations, commission splits, LTV, capitalization, GRM &mdash; with step-by-step worked examples. The single category that knocks the most candidates out, eliminated."
            />
            <Feature
              icon="📝"
              title={`${totalQ}-question exam bank + full mock`}
              body="Practice with the same 80 + 50 PSI question split, same time pressure, same calibration. The mock exam predicts your real exam score within a few points."
            />
            <Feature
              icon="📚"
              title={`${totalTerms}-term searchable glossary`}
              body="Every key term &mdash; national + Hawaii &mdash; defined plainly, indexed, instantly searchable. Cross-linked to the chapters where it appears."
            />
            <Feature
              icon="📱"
              title="Mobile-first, lives in your pocket"
              body="Studied on the bus to Kahala? Phone in your hand at the beach? The platform is designed for that. Resume exactly where you left off, on any device."
            />
            <Feature
              icon="🎯"
              title="Adaptive review engine"
              body="The platform tracks every quiz miss, builds you a personal weakness map, and automatically routes you back through the chapters where you&apos;re shaky &mdash; until you&apos;re solid."
            />
            <Feature
              icon="🛡️"
              title="Pass-or-Pay-Zero guarantee"
              body="On Coached and VIP tiers: don&apos;t pass on your first attempt? Your second attempt prep is on us. We&apos;re betting on you because we&apos;ve built the system that wins."
              highlight
            />
          </div>
        </section>

        {/* POST-LICENSE LAUNCHPAD */}
        <section style={{ background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgElevated} 100%)`, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '72px 32px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.coral, textTransform: 'uppercase', marginBottom: 12 }}>The unfair advantage</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: T.text }}>
                Pass the exam &mdash; <em style={{ fontStyle: 'italic', color: T.coral }}>then we hand you a business.</em>
              </h2>
              <p style={{ fontSize: 16, color: T.textDim, maxWidth: 720, margin: '20px auto 0', lineHeight: 1.7 }}>
                Other schools end at the test. We start there. Our VIP students walk out with the actual infrastructure of a working agent &mdash; leads, a website, a brand. Built in.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <Tool
                title="Lead Engine"
                tag="Built-in"
                body="Automated lead scraper that surfaces buyers, sellers, and FSBO/expired listings across all Hawaiian islands. We hand you the pipeline so you don&apos;t cold-knock door to door on day one."
              />
              <Tool
                title="Your Own Agent Website"
                tag="IDX-enabled"
                body="A premium-designed personal real estate site, your name and brand, with full IDX so visitors search live MLS listings on YOUR domain. Built and deployed for you."
              />
              <Tool
                title="Business Launchpad"
                tag="First 90 Days"
                body="Sponsoring broker introductions, contract templates, listing presentation deck, social media starter kit, and a 90-day onboarding playbook so you start producing fast."
              />
              <Tool
                title="1:1 With Ralph"
                tag="VIP Tier"
                body="Direct mentorship sessions with Ralph Foulger himself. Decades of Hawaii market experience compressed into the answers to your specific questions, your specific market, your specific deals."
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <Link href="/tools" style={{ ...BUTTON_3D.primary, padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Tour the Agent Toolkit →
              </Link>
            </div>
          </div>
        </section>

        {/* WHY RALPH */}
        <section style={{ padding: '72px 32px', maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Why Ralph</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text }}>
              A household name in Hawaii real estate, modernized for 2026.
            </h2>
          </div>
          <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18, lineHeight: 1.8, fontSize: 16, color: T.textDim }}>
            <p style={{ marginBottom: 16 }}>
              Ralph Foulger has spent decades placing agents into Hawaii&apos;s most demanding market &mdash; the one where the average home is over <strong style={{ color: T.text }}>$1M</strong>, where state-specific rules like leasehold disclosure and HARPTA trip up the unprepared, and where the local relationships matter more than the textbook.
            </p>
            <p style={{ marginBottom: 16 }}>
              When COVID closed classrooms, traditional in-person schools like Ralph&apos;s went quiet. Online behemoths absorbed the volume. <strong style={{ color: T.text }}>2026 is the comeback.</strong> Ralph is back &mdash; but this time with the most technologically sophisticated platform Hawaii&apos;s real estate education has ever seen.
            </p>
            <p>
              Every chapter narrated. Every concept gamified. Every weak spot mapped. And &mdash; for students who want it &mdash; the actual business infrastructure to start earning the moment the license drops in your inbox.
            </p>
          </div>
        </section>

        {/* PRICING TEASE */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '72px 32px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Choose your path</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: T.text }}>
                From curious to closing.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <Tier name="Free Foundation" price="$0" tagline="Is real estate right for you?" features={['5-lesson preview', 'Hawaii market 101', 'Career fit assessment', 'Income reality check']} cta="Start Free" href="/free" />
              <Tier name="Self-Paced" price="$549" tagline="The full toolkit" features={['All 20 chapters + audio', 'Flashcards & math drills', 'Mock exam', 'Glossary', 'Lifetime access']} cta="Enroll" href="/pricing#self" />
              <Tier name="Coached" price="$899" tagline="With pass guarantee" featured features={['Everything in Self-Paced', '4 live coach sessions', 'Pass-or-Pay-Zero guarantee', 'Cohort community', 'Priority support']} cta="Enroll" href="/pricing#coached" />
              <Tier name="Founder VIP" price="$1,997" tagline="License + business launch" features={['Everything in Coached', '🎯 Lead Engine access', '🌐 Personal agent website', '👤 1:1 with Ralph', 'Lifetime updates']} cta="Apply" href="/pricing#vip" />
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/pricing" style={{ fontSize: 14, color: T.ocean, textDecoration: 'none', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
                Full pricing comparison &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ padding: '88px 32px', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05, color: T.text, marginBottom: 20 }}>
            Try the Free Foundation.
          </h2>
          <p style={{ fontSize: 18, color: T.textDim, maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Five short lessons. Zero cost. Decide if real estate is for you, and if Ralph Foulger&apos;s School is for you. No credit card.
          </p>
          <Link href="/free" style={{ ...BUTTON_3D.primary, padding: '18px 36px', borderRadius: 14, fontSize: 16, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Start Now &mdash; Free →
          </Link>
        </section>

        <Footer />
      </div>
    </div>
  );
}

/* ───────────  PIECES  ─────────── */

function Stat({ big, sub, highlight }: { big: string; sub: string; highlight?: boolean }) {
  return (
    <div style={{
      ...CARD,
      padding: '24px 22px', borderRadius: 14, textAlign: 'center',
      background: highlight ? `linear-gradient(180deg, ${T.coral} 0%, ${T.coralDark} 100%)` : T.bg,
      color: highlight ? T.white : T.text,
    }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 44, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>{big}</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, opacity: highlight ? 0.95 : 0.7 }}>{sub}</div>
    </div>
  );
}

function Feature({ icon, title, body, highlight }: { icon: string; title: string; body: string; highlight?: boolean }) {
  return (
    <div style={{
      ...CARD,
      padding: '24px 22px', borderRadius: 14,
      borderColor: highlight ? T.ocean : undefined,
      background: highlight ? `linear-gradient(180deg, ${T.bg} 0%, rgba(20,131,123,0.06) 100%)` : T.bg,
    }}>
      <div style={{ fontSize: 28, marginBottom: 12, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 8, color: T.text }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim }}>{body}</div>
    </div>
  );
}

function Tool({ title, tag, body }: { title: string; tag: string; body: string }) {
  return (
    <div style={{ ...CARD, padding: '26px 24px', borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', color: T.text }}>{title}</div>
        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.coral, textTransform: 'uppercase', padding: '4px 8px', background: 'rgba(232,93,60,0.08)', borderRadius: 6, fontWeight: 600 }}>{tag}</div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim }}>{body}</div>
    </div>
  );
}

function Tier({ name, price, tagline, features, cta, href, featured }: { name: string; price: string; tagline: string; features: string[]; cta: string; href: string; featured?: boolean }) {
  return (
    <div style={{
      ...CARD,
      padding: '24px 22px', borderRadius: 16, position: 'relative',
      borderColor: featured ? T.ocean : undefined,
      borderWidth: featured ? 2 : 1,
      transform: featured ? 'translateY(-4px)' : undefined,
    }}>
      {featured && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: T.ocean, color: T.white, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}>
          Most popular
        </div>
      )}
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 6 }}>{name}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', color: T.text, marginBottom: 4 }}>{price}</div>
      <div style={{ fontSize: 13, color: T.textDim, marginBottom: 14, lineHeight: 1.4 }}>{tagline}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
        {features.map((f, i) => (
          <li key={i} style={{ fontSize: 13, color: T.textDim, marginBottom: 8, lineHeight: 1.5, paddingLeft: 16, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: T.ocean, fontWeight: 700 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link href={href} style={{ ...(featured ? BUTTON_3D.primary : BUTTON_3D.secondary), display: 'block', textAlign: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
        {cta}
      </Link>
    </div>
  );
}
