'use client';

// ABOUTME: Header bell that shows the student's unread-message count and links to /profile?inbox=1.
// ABOUTME: Polls /api/me/messages every 30s. Renders nothing when unread = 0 (icon only, no badge).

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T } from '@/lib/theme';

export function MessageBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const r = await fetch('/api/me/messages', { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        if (mounted) setUnread(j.unreadCount ?? 0);
      } catch { /* non-fatal */ }
    };
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <Link
      href="/profile?inbox=1"
      aria-label={unread > 0 ? `Inbox · ${unread} unread message${unread === 1 ? '' : 's'}` : 'Inbox'}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, borderRadius: 10,
        border: `1px solid ${T.border}`,
        background: 'rgba(255,255,255,0.4)',
        color: T.text, textDecoration: 'none',
        flexShrink: 0,
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Envelope */}
        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <polyline points="3,7 12,13 21,7" />
      </svg>
      {unread > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          minWidth: 18, height: 18, padding: '0 5px',
          borderRadius: 999, background: T.coral, color: '#fff',
          fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(251,247,240,1)',
          letterSpacing: '0.02em',
        }}>
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}
