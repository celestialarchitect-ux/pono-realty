import Link from 'next/link';
import { T, SHADOW_3D, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function AgentTools() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/tools" />

        {/* HERO */}
        <section style={{ padding: '72px 32px 48px', maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: 'rgba(232,93,60,0.08)', border: `1px solid ${T.coral}`, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.coral, textTransform: 'uppercase', marginBottom: 24 }}>
              VIP Tier · Built In
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(44px, 6vw, 76px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.02, color: T.text, marginBottom: 20 }}>
              Pass the test. <em style={{ fontStyle: 'italic', color: T.coral }}>Then run a business.</em>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: T.textDim, maxWidth: 720, margin: '0 auto' }}>
              Other schools end at the exam. We ship you the actual operating system of a working Hawaii agent &mdash; leads, website, contracts, mentorship. Built in to the VIP tier.
            </p>
          </div>
        </section>

        {/* THE FOUR TOOLS — DETAILED */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px 64px' }}>

          <ToolBlock
            id="leads"
            number="01"
            title="Lead Engine"
            tag="Built-in"
            tagline="The pipeline you don&apos;t have to cold-build."
            paragraphs={[
              "Day one out of the exam, every new agent faces the same wall: nobody knows them yet. Most response: cold doors, open houses, COI lists, hope. Median time to first commission: 6–9 months.",
              "We replace that with the Lead Engine. An automated scraper that surfaces buyers, sellers, FSBOs, expired listings, and inherited-property leads across all Hawaiian islands &mdash; daily, in your inbox, with contact info, source attribution, and recommended outreach scripts.",
              "You&apos;re not buying lists. You&apos;re plugged into a live signal stream that our system curates for VIP students only.",
            ]}
            highlights={[
              'Daily lead delivery, geo-filtered',
              'Buyer/seller/FSBO/expired',
              'All Hawaiian islands',
              'Outreach scripts that work',
            ]}
          />

          <ToolBlock
            id="site"
            number="02"
            title="Your Personal Agent Website"
            tag="IDX-Enabled"
            tagline="Your name, your brand, live MLS — built and deployed."
            paragraphs={[
              "Every agent eventually needs a website. Most pay $50–$300/month to a third-party platform that all looks identical, gets indexed by nobody, and converts at 0.5%.",
              "VIP students get a premium, design-forward personal real estate site at their own domain. Full IDX integration so visitors search live Hawaii MLS listings on YOUR site &mdash; not redirected to Zillow. Lead capture is built in. Mobile-perfect. SEO-optimized for your geography.",
              "We design it, deploy it, and hand you the keys. You launch with infrastructure that takes most agents years and tens of thousands to build.",
            ]}
            highlights={[
              'Custom design, your brand',
              'Live IDX search on your domain',
              'Lead capture forms wired in',
              'SEO-optimized launch',
            ]}
          />

          <ToolBlock
            id="launchpad"
            number="03"
            title="The 90-Day Launchpad"
            tag="Onboarding"
            tagline="Your first 90 days, scripted to produce."
            paragraphs={[
              "The license is the starting line, not the finish. Most new agents drift through their first quarter without a structure &mdash; and most quit within the first 18 months because they never built momentum.",
              "The Launchpad is a day-by-day playbook for your first 90 days licensed. Sponsoring broker introductions to vetted Hawaii brokerages. Contract templates pre-filled for Hawaii. Listing presentation deck. Social media starter kit (templates, schedule, hooks). Vendor list (photographer, stager, escrow, lender). The unglamorous infrastructure that determines who&apos;s still selling at month 12.",
            ]}
            highlights={[
              'Sponsoring broker intros',
              'Hawaii contract templates',
              'Listing presentation deck',
              'Social media starter kit',
            ]}
          />

          <ToolBlock
            id="ralph"
            number="04"
            title="Direct With Ralph"
            tag="VIP Only"
            tagline="The mentor most agents never get."
            paragraphs={[
              "Ralph Foulger has placed thousands of agents into Hawaii&apos;s most demanding market. He&apos;s seen what works, what burns out, and what produces career agents who close at the top of the market for decades.",
              "VIP students get monthly 1:1 sessions directly with Ralph &mdash; bring your specific deals, your specific market questions, your sticking points. Decades of compressed Hawaii real estate experience, applied to your situation, your career, your numbers.",
              "This alone is worth more than the price of the program. We include it because it&apos;s the difference between &quot;I have a license&quot; and &quot;I have a career.&quot;",
            ]}
            highlights={[
              'Monthly 1:1 with Ralph',
              'Your specific deals reviewed',
              'Hawaii market intelligence',
              'Career path coaching',
            ]}
          />

        </section>

        {/* CTA */}
        <section style={{ background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgElevated} 100%)`, borderTop: `1px solid ${T.border}`, padding: '72px 32px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text, marginBottom: 16 }}>
              All four tools. Founder VIP tier.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: T.textDim, maxWidth: 600, margin: '0 auto 32px' }}>
              The full curriculum, the pass guarantee, the lead engine, your own agent site, the 90-day launchpad, and direct mentorship from Ralph &mdash; bundled at <strong style={{ color: T.text }}>$1,497.</strong>
            </p>
            <Link href="/pricing#vip" style={{ ...BUTTON_3D.primary, padding: '16px 36px', borderRadius: 14, fontSize: 16, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              See Founder VIP Pricing →
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function ToolBlock({ id, number, title, tag, tagline, paragraphs, highlights }: {
  id: string; number: string; title: string; tag: string; tagline: string;
  paragraphs: string[]; highlights: string[];
}) {
  return (
    <div id={id} style={{
      ...CARD,
      padding: '40px 44px', borderRadius: 20, marginBottom: 24,
      display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 40,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 48, fontWeight: 900, color: T.ocean, opacity: 0.5, lineHeight: 1 }}>{number}</span>
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 800, color: T.text, letterSpacing: '-0.015em', lineHeight: 1.1 }}>{title}</div>
            <div style={{ display: 'inline-block', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.coral, textTransform: 'uppercase', padding: '4px 8px', background: 'rgba(232,93,60,0.08)', borderRadius: 6, fontWeight: 600, marginTop: 8 }}>{tag}</div>
          </div>
        </div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontStyle: 'italic', color: T.ocean, marginBottom: 18, lineHeight: 1.4 }}>{tagline}</div>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, marginBottom: 14 }}>{p}</p>
        ))}
      </div>
      <div style={{
        background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 14, padding: '24px 22px',
      }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>What&apos;s included</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {highlights.map((h, i) => (
            <li key={i} style={{ fontSize: 14, color: T.text, marginBottom: 10, lineHeight: 1.5, paddingLeft: 22, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: T.ocean, fontWeight: 800 }}>✓</span>
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
