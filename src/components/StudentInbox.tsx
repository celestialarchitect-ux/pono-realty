'use client';

// ABOUTME: Student inbox card on /profile. Lists direct messages + broadcasts. Marks read on open.
// ABOUTME: Auto-opens on mount when the URL has ?inbox=1 (set by MessageBell deep link).

import { useEffect, useMemo, useState } from 'react';
import { T, CARD } from '@/lib/theme';

interface InboxMessage {
  id: string;
  category: string;
  subject: string;
  bodyText: string;
  fromAddr: string;
  readAt: string | null;
  createdAt: string;
}

export function StudentInbox() {
  const [messages, setMessages] = useState<InboxMessage[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = async () => {
    try {
      const r = await fetch('/api/me/messages', { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      setMessages(j.messages ?? []);
    } catch { /* non-fatal */ }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  // Honor ?inbox=1 deep link (from MessageBell) so a click in the header
  // opens this card already expanded.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('inbox') === '1') setExpanded(true);
  }, []);

  const unread = useMemo(() => (messages ?? []).filter(m => !m.readAt).length, [messages]);

  const openMessage = async (m: InboxMessage) => {
    setActiveId(m.id);
    if (!m.readAt) {
      // Optimistic update — local first so the bell drops the badge.
      setMessages(prev => (prev ?? []).map(x => x.id === m.id ? { ...x, readAt: new Date().toISOString() } : x));
      try { await fetch(`/api/me/messages/${m.id}`, { method: 'POST' }); }
      catch { /* non-fatal */ }
    }
  };

  if (messages === null) return null; // first load — render nothing
  if (messages.length === 0) return null; // no messages — hide the card entirely

  const active = messages.find(m => m.id === activeId) ?? null;

  return (
    <div style={{ ...CARD, padding: 'clamp(18px, 3vw, 24px)', borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: unread > 0 ? T.coral : T.ocean }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
            Inbox{unread > 0 && (
              <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 999, background: T.coral, color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 10, letterSpacing: '0.04em' }}>
                {unread} new
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: T.text, margin: 0 }}>
            Messages from the academy
          </h3>
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, color: T.textDim, cursor: 'pointer' }}>
          {expanded ? 'Collapse' : 'Show all'}
        </button>
      </div>

      {!expanded && unread > 0 && (
        <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, margin: 0 }}>
          You have <strong style={{ color: T.coral }}>{unread} unread message{unread === 1 ? '' : 's'}</strong> from your instructor.{' '}
          <button onClick={() => setExpanded(true)} style={{ background: 'transparent', border: 'none', color: T.ocean, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Open inbox</button>
        </p>
      )}

      {expanded && (
        active ? (
          <div>
            <button onClick={() => setActiveId(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.ocean, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: 0, marginBottom: 14 }}>← Back to messages</button>
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: T.text, lineHeight: 1.2, marginBottom: 10, wordBreak: 'break-word' }}>
              {active.subject}
            </h4>
            <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', marginBottom: 14 }}>
              From {active.fromAddr} · {new Date(active.createdAt).toLocaleString()}
            </div>
            <div style={{ background: T.bgRaised, borderRadius: 10, padding: 18, fontSize: 14, color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {active.bodyText}
            </div>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {messages.map(m => {
              const isUnread = !m.readAt;
              return (
                <li key={m.id}>
                  <button onClick={() => openMessage(m)} style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                    padding: '12px 14px', borderRadius: 10,
                    background: T.bgRaised, border: `1px solid ${T.border}`,
                    borderLeftWidth: 3, borderLeftStyle: 'solid',
                    borderLeftColor: isUnread ? T.coral : T.textGhost,
                    overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: isUnread ? 800 : 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 200px' }}>
                        {m.subject}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: T.textMute, letterSpacing: '0.06em' }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textMute, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.bodyText.slice(0, 140)}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}
