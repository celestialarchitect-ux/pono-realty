'use client';

import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { formatDuration } from '@/lib/time-tracking';

type Direction = 'inbound' | 'outbound';

interface Message {
  id: string;
  direction: Direction;
  category: string;
  fromAddr: string;
  toAddr: string;
  subject: string;
  bodyText: string;
  status: string;
  providerId?: string | null;
  errorMsg?: string | null;
  readAt?: string | null;
  createdAt: string;
}
interface Counts {
  inbox: number;
  sent: number;
  unreadInbound: number;
  byCategory: Record<string, number>;
}

type Folder = 'inbox' | 'sent' | 'verify' | 'reset' | 'welcome' | 'all';

const FOLDER_LABEL: Record<Folder, string> = {
  inbox: 'Inbox',
  sent: 'Sent',
  verify: 'Verify (outbound)',
  reset: 'Reset (outbound)',
  welcome: 'Welcome (outbound)',
  all: 'All messages',
};

export default function AdminInboxPage() {
  const [folder, setFolder] = useState<Folder>('inbox');
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [active, setActive] = useState<Message | null>(null);
  const [unprovisioned, setUnprovisioned] = useState(false);

  const load = async () => {
    const q = folderToQuery(folder);
    try {
      const res = await fetch(`/api/admin/inbox${q}`, { cache: 'no-store' });
      if (res.status === 503) { setUnprovisioned(true); return; }
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
      setCounts(data.counts);
    } catch {/* ignore */}
  };

  useEffect(() => { load(); const id = setInterval(load, 15_000); return () => clearInterval(id); }, [folder]);

  const openMessage = async (m: Message) => {
    setActive(m);
    // Marks as read server-side
    if (m.direction === 'inbound' && !m.readAt) {
      fetch(`/api/admin/inbox/${m.id}`).catch(() => {});
      load();
    }
  };

  return (
    <Shell>
      <Heading unreadInbound={counts?.unreadInbound ?? 0} />
      {unprovisioned ? (
        <div style={{ ...CARD, padding: 28, marginTop: 18, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
          <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, margin: 0 }}>
            Backend not yet provisioned. Add Postgres + run <code style={mono}>npm run db:push</code> to populate the mailbox. Resend (outbound) and the inbound provider (Cloudflare Email Workers recommended) wire in next.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18, marginTop: 18 }} data-stack-mobile="true">
          {/* SIDEBAR */}
          <div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(Object.keys(FOLDER_LABEL) as Folder[]).map(f => {
                const count = folderCount(f, counts);
                const isActive = folder === f;
                return (
                  <li key={f}>
                    <button
                      onClick={() => { setFolder(f); setActive(null); }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                        background: isActive ? 'rgba(20,131,123,0.10)' : 'transparent',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: isActive ? 700 : 500,
                        color: isActive ? T.ocean : T.text,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <span>{FOLDER_LABEL[f]}</span>
                      {count !== null && (
                        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textMute, fontWeight: 600 }}>{count}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* MAIN: list or message detail */}
          <div>
            {active ? (
              <MessageView message={active} onBack={() => setActive(null)} />
            ) : messages === null ? (
              <p style={{ color: T.textMute, padding: 12 }}>Loading…</p>
            ) : messages.length === 0 ? (
              <div style={{ ...CARD, padding: 32, textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: T.textMute, margin: 0 }}>
                  {folder === 'sent'
                    ? 'No outbound emails yet. Verify, reset, and welcome emails will appear here as the academy sends them.'
                    : 'Nothing in this folder yet. Inbound mail arrives via the /api/email/inbound webhook once you wire an inbound provider.'}
                </p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {messages.map(m => {
                  const unread = m.direction === 'inbound' && !m.readAt;
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => openMessage(m)}
                        style={{
                          ...CARD,
                          padding: '14px 16px', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                          borderLeftWidth: 3, borderLeftStyle: 'solid',
                          borderLeftColor: m.direction === 'inbound' ? (unread ? T.coral : T.ocean) : T.textGhost,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: unread ? 700 : 500, color: T.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {m.direction === 'inbound' ? m.fromAddr : `→ ${m.toAddr}`}
                          </span>
                          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700 }}>
                            {m.category}
                          </span>
                          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textMute, whiteSpace: 'nowrap' }}>
                            {formatDuration((Date.now() - new Date(m.createdAt).getTime()) / 1000, 'short')} ago
                          </span>
                        </div>
                        <div style={{ fontSize: 14, color: T.text, fontWeight: unread ? 700 : 600, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.subject}
                        </div>
                        <div style={{ fontSize: 12, color: T.textMute, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.bodyText.slice(0, 140)}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}

function folderToQuery(f: Folder): string {
  switch (f) {
    case 'inbox': return '?direction=inbound';
    case 'sent': return '?direction=outbound';
    case 'verify': return '?direction=outbound&category=verify';
    case 'reset': return '?direction=outbound&category=reset';
    case 'welcome': return '?direction=outbound&category=welcome';
    case 'all': return '';
  }
}

function folderCount(f: Folder, c: Counts | null): number | null {
  if (!c) return null;
  switch (f) {
    case 'inbox': return c.inbox;
    case 'sent': return c.sent;
    case 'verify': return c.byCategory['outbound:verify'] ?? 0;
    case 'reset': return c.byCategory['outbound:reset'] ?? 0;
    case 'welcome': return c.byCategory['outbound:welcome'] ?? 0;
    case 'all': return c.inbox + c.sent;
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '48px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function Heading({ unreadInbound }: { unreadInbound: number }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
        Admin · Inbox
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 6 }}>
        Mail<em style={{ color: T.ocean, fontStyle: 'italic' }}>box.</em>
        {unreadInbound > 0 && (
          <span style={{ marginLeft: 14, fontSize: 14, padding: '4px 10px', background: T.coral, color: '#fff', borderRadius: 999, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.08em', verticalAlign: 'middle' }}>
            {unreadInbound} new
          </span>
        )}
      </h1>
      <p style={{ fontSize: 14, color: T.textMute, margin: 0 }}>Every send and every reply. Auto-refresh every 15 s.</p>
    </div>
  );
}

function MessageView({ message, onBack }: { message: Message; onBack: () => void }) {
  return (
    <div style={{ ...CARD, padding: 24 }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.ocean, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: 0, marginBottom: 16 }}>← Back to list</button>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
        {message.direction === 'inbound' ? 'Received' : 'Sent'} · {message.category}
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.2, marginBottom: 14 }}>
        {message.subject}
      </h2>
      <div style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span><strong style={{ color: T.text }}>{message.direction === 'inbound' ? 'From' : 'To'}:</strong> {message.direction === 'inbound' ? message.fromAddr : message.toAddr}</span>
        <span><strong style={{ color: T.text }}>{message.direction === 'inbound' ? 'To' : 'From'}:</strong> {message.direction === 'inbound' ? message.toAddr : message.fromAddr}</span>
        <span><strong style={{ color: T.text }}>Status:</strong> {message.status}{message.errorMsg ? ` · ${message.errorMsg}` : ''}</span>
        <span><strong style={{ color: T.text }}>Date:</strong> {new Date(message.createdAt).toLocaleString()}</span>
      </div>
      <div style={{ background: T.bgRaised, borderRadius: 10, padding: 18, fontSize: 14, color: T.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {message.bodyText}
      </div>
    </div>
  );
}

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  background: T.bgRaised,
  padding: '1px 6px',
  borderRadius: 4,
};
