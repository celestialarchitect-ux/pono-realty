'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T, SHADOW_3D, BUTTON_3D } from '@/lib/theme';

const NAV_ITEMS: Array<[string, string]> = [
  ['/free', 'Free Course'],
  ['/course', 'Curriculum'],
  ['/practice', 'Mock Exam'],
  ['/tutor', 'AI Tutor'],
  ['/pricing', 'Pricing'],
];

export function Header({ active }: { active?: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock scroll while drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const link = (href: string, label: string, onClick?: () => void) => {
    const isActive = active === href;
    return (
      <Link key={href} href={href} onClick={onClick} style={{
        color: isActive ? T.text : T.textDim, fontSize: 14, fontWeight: 500,
        textDecoration: 'none', borderBottom: isActive ? `2px solid ${T.ocean}` : '2px solid transparent', paddingBottom: 4,
      }}>{label}</Link>
    );
  };

  return (
    <header style={{
      padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: `1px solid ${T.border}`, background: 'rgba(251,247,240,0.85)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 100, gap: 12,
    }}>
      <Link href="/" className="rf-header-brand" style={{
        fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, letterSpacing: '0.02em',
        fontSize: 19, color: T.text, textShadow: SHADOW_3D.sm, textDecoration: 'none',
        display: 'flex', alignItems: 'baseline', gap: 10, lineHeight: 1, flexShrink: 1, minWidth: 0,
      }}>
        <span style={{ color: T.ocean, whiteSpace: 'nowrap' }}>RALPH FOULGER&apos;S</span>
        <span className="rf-header-brand-tagline" style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
          SCHOOL OF REAL ESTATE
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="rf-header-nav-desktop" style={{ gap: 18, alignItems: 'center' }}>
        {NAV_ITEMS.map(([href, label]) => link(href, label))}
        <Link href="/free" style={{
          ...BUTTON_3D.primary, padding: '10px 18px', borderRadius: 10,
          fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none',
        }}>Start Free</Link>
      </nav>

      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className="rf-header-nav-mobile-toggle"
        aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={drawerOpen}
        aria-controls="rf-mobile-drawer"
        onClick={() => setDrawerOpen(o => !o)}
        style={{
          background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10,
          width: 44, height: 44, padding: 0, alignItems: 'center', justifyContent: 'center',
          color: T.text, cursor: 'pointer', flexShrink: 0,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {drawerOpen ? (
            <>
              <line x1="5" y1="5" x2="17" y2="17" />
              <line x1="17" y1="5" x2="5" y2="17" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="18" y2="7" />
              <line x1="4" y1="11" x2="18" y2="11" />
              <line x1="4" y1="15" x2="18" y2="15" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile drawer */}
      <div
        id="rf-mobile-drawer"
        className={`rf-header-nav-mobile-drawer${drawerOpen ? ' open' : ''}`}
        role="navigation"
        aria-label="Mobile menu"
      >
        {NAV_ITEMS.map(([href, label]) => link(href, label, () => setDrawerOpen(false)))}
        <Link
          href="/free"
          onClick={() => setDrawerOpen(false)}
          style={{
            ...BUTTON_3D.primary, padding: '14px 18px', borderRadius: 10,
            fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none',
            textAlign: 'center', marginTop: 12,
          }}
        >Start Free</Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, padding: '48px 32px 32px', marginTop: 64, background: T.bgRaised }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, marginBottom: 32 }}>
          <FooterCol title="Study" links={[['Free Foundation', '/free'], ['Full Course', '/course'], ['Practice Exam', '/practice'], ['Flashcards', '/flashcards'], ['Math drills', '/math'], ['Glossary', '/glossary']]}/>
          <FooterCol title="Tools" links={[['AI Tutor (Live Chat)', '/tutor'], ['About the Tutor', '/tools'], ['Pricing', '/pricing']]}/>
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
