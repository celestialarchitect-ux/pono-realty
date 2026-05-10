import Link from 'next/link';
import { T, SHADOW_3D, BUTTON_3D } from '@/lib/theme';

export function Header({ active }: { active?: string }) {
  const link = (href: string, label: string) => {
    const isActive = active === href;
    return (
      <Link href={href} style={{
        color: isActive ? T.text : T.textDim, fontSize: 14, fontWeight: 500,
        textDecoration: 'none', borderBottom: isActive ? `2px solid ${T.ocean}` : '2px solid transparent', paddingBottom: 4,
      }}>{label}</Link>
    );
  };
  return (
    <header style={{
      padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: `1px solid ${T.border}`, background: 'rgba(251,247,240,0.85)',
      backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link href="/" style={{
        fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, letterSpacing: '0.02em',
        fontSize: 19, color: T.text, textShadow: SHADOW_3D.sm, textDecoration: 'none',
        display: 'flex', alignItems: 'baseline', gap: 10, lineHeight: 1,
      }}>
        <span style={{ color: T.ocean }}>RALPH FOULGER&apos;S</span>
        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
          SCHOOL OF REAL ESTATE
        </span>
      </Link>
      <nav style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {link('/free', 'Free Course')}
        {link('/course', 'Full Course')}
        {link('/practice', 'Mock Exam')}
        {link('/tools', 'Agent Tools')}
        {link('/pricing', 'Pricing')}
        <Link href="/free" style={{
          ...BUTTON_3D.primary, padding: '9px 18px', borderRadius: 10,
          fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none',
        }}>Start Free</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, padding: '48px 32px 32px', marginTop: 64, background: T.bgRaised }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, marginBottom: 32 }}>
          <FooterCol title="Study" links={[['Free Foundation', '/free'], ['Full Course', '/course'], ['Practice Exam', '/practice'], ['Flashcards', '/flashcards'], ['Math drills', '/math'], ['Glossary', '/glossary']]}/>
          <FooterCol title="Career" links={[['Agent Tools', '/tools'], ['Lead Engine', '/tools#leads'], ['Your Agent Site', '/tools#site'], ['Pricing', '/pricing']]}/>
          <FooterCol title="Account" links={[['Sign up', '/signup'], ['Log in', '/login'], ['Dashboard', '/dashboard']]}/>
          <FooterCol title="Resources" links={[['Hawaii REC', 'https://cca.hawaii.gov/reb/'], ['PSI Exam Info', 'https://www.psiexams.com/'], ['HRS 467 (License Law)', 'https://www.capitol.hawaii.gov/hrs/'], ['Contact', '/contact']]}/>
          <FooterCol title="Legal" links={[['Terms', '/policies/terms'], ['Privacy', '/policies/privacy'], ['Disclaimer', '/policies/disclaimer']]}/>
        </div>
        <div style={{ paddingTop: 24, borderTop: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', textAlign: 'center' }}>
          RALPH FOULGER&apos;S SCHOOL OF REAL ESTATE · NOT AFFILIATED WITH HAWAII REC · STUDY AID ONLY
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {links.map(([label, href]) => (
          href.startsWith('http')
            ? <a key={href} href={href} target="_blank" rel="noopener" style={{ fontSize: 13, color: T.textDim, textDecoration: 'none' }}>{label}</a>
            : <Link key={href} href={href} style={{ fontSize: 13, color: T.textDim, textDecoration: 'none' }}>{label}</Link>
        ))}
      </div>
    </div>
  );
}

export function Backgrounds() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.025,
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }} />
  );
}
