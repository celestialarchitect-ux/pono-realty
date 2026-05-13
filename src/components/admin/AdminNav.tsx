'use client';

// Persistent admin navigation. Desktop: vertical left sidebar with the
// academy wordmark on top + nav links below + badges. Mobile (<900px):
// collapses to a sticky horizontal scroll strip so we never sacrifice
// content width on small screens. Lives in admin/layout.tsx so every
// admin route gets the same chrome.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { T } from '@/lib/theme';
import { Icon, type IconKind } from '@/components/Icon';

interface NavBadges {
  unreadInbound: number;
  openTickets: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: IconKind;
  badgeKey?: 'unreadInbound' | 'openTickets';
}

const ITEMS: NavItem[] = [
  { href: '/admin',           label: 'Dashboard',     icon: 'chart-up' },
  { href: '/admin/prospects', label: 'Prospects',     icon: 'target' },
  { href: '/admin/users',     label: 'All students',  icon: 'graduate' },
  { href: '/admin/quizzes',   label: 'Quiz analytics',icon: 'exam' },
  { href: '/admin/inbox',     label: 'Inbox',         icon: 'tutor',   badgeKey: 'unreadInbound' },
  { href: '/admin/support',   label: 'Support',       icon: 'audit',   badgeKey: 'openTickets' },
  { href: '/profile',         label: 'My profile',    icon: 'calendar' },
];

export function AdminNav() {
  const pathname = usePathname() ?? '';
  const [badges, setBadges] = useState<NavBadges>({ unreadInbound: 0, openTickets: 0 });
  // We default to 'desktop' on the server (safe SSR), then the effect below
  // flips to 'mobile' only on narrow viewports. Avoids hydration mismatch.
  const [variant, setVariant] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const onResize = () => setVariant(window.innerWidth < 900 ? 'mobile' : 'desktop');
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const r = await fetch('/api/admin/nav-badges', { cache: 'no-store' });
        if (r.ok && mounted) {
          const j = await r.json() as NavBadges;
          setBadges(j);
        }
      } catch { /* non-fatal */ }
    };
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (variant === 'mobile') return <MobileStrip pathname={pathname} badges={badges} />;
  return <DesktopSidebar pathname={pathname} badges={badges} />;
}

// ── Desktop: vertical left sidebar ──────────────────────────────────────

function DesktopSidebar({ pathname, badges }: { pathname: string; badges: NavBadges }) {
  return (
    <aside
      aria-label="Admin navigation"
      style={{
        position: 'sticky', top: 0,
        height: '100vh',
        width: 260,
        flexShrink: 0,
        background: 'rgba(251,247,240,0.96)',
        borderRight: `1px solid ${T.border}`,
        backdropFilter: 'saturate(140%) blur(10px)',
        WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        padding: '28px 18px 24px',
        display: 'flex', flexDirection: 'column', gap: 18,
        zIndex: 50,
      }}
    >
      {/* Wordmark */}
      <Link href="/admin" style={{ textDecoration: 'none', color: T.text, padding: '0 6px 4px' }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
          Ralph Foulger&rsquo;s
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
          Academy of Real Estate
        </div>
        <div style={{ marginTop: 14, height: 1, background: T.border }} />
      </Link>

      {/* Section label */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, padding: '0 6px' }}>
        Admin
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ITEMS.map(it => {
          const active = it.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(it.href);
          const badge = it.badgeKey ? badges[it.badgeKey] : 0;
          return (
            <Link
              key={it.href}
              href={it.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10,
                background: active ? T.ocean : 'transparent',
                color: active ? '#fff' : T.text,
                textDecoration: 'none',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                transition: 'background 0.12s, color 0.12s',
              }}>
              <Icon kind={it.icon} size={17} strokeWidth={1.8} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {badge > 0 && (
                <span style={{
                  padding: '2px 8px', borderRadius: 999,
                  background: active ? '#fff' : T.coral,
                  color: active ? T.ocean : '#fff',
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700, lineHeight: 1.3,
                }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: support email contact */}
      <div style={{ marginTop: 'auto', padding: '14px 8px 4px', fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', lineHeight: 1.55, borderTop: `1px solid ${T.border}` }}>
        <span style={{ display: 'block', marginBottom: 4 }}>Logged in as admin</span>
        <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean }}>support@ralphfoulger.com</a>
      </div>
    </aside>
  );
}

// ── Mobile: same sticky-top horizontal strip we had before ───────────────

function MobileStrip({ pathname, badges }: { pathname: string; badges: NavBadges }) {
  return (
    <nav
      aria-label="Admin navigation"
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(251,247,240,0.92)',
        backdropFilter: 'saturate(140%) blur(10px)',
        WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch' as 'touch',
        padding: '8px max(12px, env(safe-area-inset-left)) 8px max(12px, env(safe-area-inset-right))',
      }}>
        <div style={{ display: 'inline-flex', gap: 4, minWidth: '100%' }}>
          {ITEMS.map(it => {
            const active = it.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(it.href);
            const badge = it.badgeKey ? badges[it.badgeKey] : 0;
            return (
              <Link
                key={it.href}
                href={it.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10,
                  background: active ? T.ocean : 'transparent',
                  color: active ? '#fff' : T.text,
                  textDecoration: 'none',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  border: `1px solid ${active ? T.oceanDark : 'transparent'}`,
                }}>
                <Icon kind={it.icon} size={16} strokeWidth={1.8} />
                <span>{it.label}</span>
                {badge > 0 && (
                  <span style={{
                    padding: '1px 8px', borderRadius: 999,
                    background: active ? '#fff' : T.coral,
                    color: active ? T.ocean : '#fff',
                    fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
