'use client';

// Persistent admin nav. Lives in admin/layout.tsx so it appears on every
// admin page (dashboard, users, prospects, inbox, support). Horizontally
// scrollable on narrow screens (no wrapping that would cause vertical
// shift). Shows unread + open-ticket badges fetched from a lightweight
// counts endpoint so we don't pull the full analytics payload on every
// page load.

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
  { href: '/admin',           label: 'Dashboard',    icon: 'chart-up' },
  { href: '/admin/prospects', label: 'Prospects',    icon: 'target' },
  { href: '/admin/users',     label: 'All students', icon: 'graduate' },
  { href: '/admin/inbox',     label: 'Inbox',        icon: 'tutor', badgeKey: 'unreadInbound' },
  { href: '/admin/support',   label: 'Support',      icon: 'audit', badgeKey: 'openTickets' },
  { href: '/profile',         label: 'My profile',   icon: 'calendar' },
];

export function AdminNav() {
  const pathname = usePathname() ?? '';
  const [badges, setBadges] = useState<NavBadges>({ unreadInbound: 0, openTickets: 0 });

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
        maxWidth: 1180, margin: '0 auto',
        // Horizontal scroll on narrow screens — no wrap, no layout shift.
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch' as 'touch',
        padding: '8px max(16px, env(safe-area-inset-left)) 8px max(16px, env(safe-area-inset-right))',
      }}>
        <div style={{ display: 'inline-flex', gap: 4, minWidth: '100%' }}>
          {ITEMS.map(it => {
            const isActive = it.href === '/admin'
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
                  background: isActive ? T.ocean : 'transparent',
                  color: isActive ? '#fff' : T.text,
                  textDecoration: 'none',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13, fontWeight: 700,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  border: `1px solid ${isActive ? T.oceanDark : 'transparent'}`,
                  transition: 'background 0.12s, color 0.12s',
                }}>
                <Icon kind={it.icon} size={16} strokeWidth={1.8} />
                <span>{it.label}</span>
                {badge > 0 && (
                  <span style={{
                    padding: '1px 8px', borderRadius: 999,
                    background: isActive ? '#fff' : T.coral,
                    color: isActive ? T.ocean : '#fff',
                    fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700, letterSpacing: '0.02em',
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
