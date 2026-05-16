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
  // narrow = stacked layout (folder list above message list). Triggers under
  // 720px which covers iPhone (portrait + landscape) and small iPad windows.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 720);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <Shell>
      <Heading unreadInbound={counts?.unreadInbound ?? 0} onCompose={() => setComposeOpen(true)} />
      {composeOpen && <BroadcastComposer onClose={() => { setComposeOpen(false); load(); }} />}
      {unprovisioned ? (
        <div style={{ ...CARD, padding: 28, marginTop: 18, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
          <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, margin: 0 }}>
            Backend not yet provisioned. Add Postgres + run <code style={mono}>npm run db:push</code> to populate the mailbox. Resend (outbound) and the inbound provider (Cloudflare Email Workers recommended) wire in next.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: narrow ? '1fr' : '200px 1fr',
          gap: narrow ? 12 : 18,
          marginTop: 18,
        }}>
          {/* SIDEBAR / folder list */}
          <div style={narrow ? {
            display: 'flex', overflowX: 'auto',
            WebkitOverflowScrolling: 'touch' as 'touch',
            paddingBottom: 4, gap: 6,
          } : {}}>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex',
              flexDirection: narrow ? 'row' : 'column',
              gap: narrow ? 6 : 4,
              ...(narrow ? { flexWrap: 'nowrap' as const, minWidth: 'max-content' } : {}),
            }}>
              {(Object.keys(FOLDER_LABEL) as Folder[]).map(f => {
                const count = folderCount(f, counts);
                const isActive = folder === f;
                return (
                  <li key={f} style={narrow ? { flexShrink: 0 } : {}}>
                    <button
                      onClick={() => { setFolder(f); setActive(null); }}
                      style={{
                        width: narrow ? 'auto' : '100%',
                        textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                        background: isActive ? 'rgba(20,131,123,0.10)' : 'transparent',
                        border: narrow ? `1px solid ${isActive ? T.ocean : T.border}` : 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                        color: isActive ? T.ocean : T.text,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                        whiteSpace: 'nowrap',
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
                          boxSizing: 'border-box', maxWidth: '100%',
                          overflow: 'hidden',  // contain ellipsis spillover
                        }}
                      >
                        {/* Row 1: address + category + timestamp.
                            On narrow screens the category drops below so
                            address and time stay legible. */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 13, fontWeight: unread ? 700 : 500, color: T.text,
                            minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            flex: '1 1 140px',
                          }}>
                            {m.direction === 'inbound' ? m.fromAddr : `→ ${m.toAddr}`}
                          </span>
                          <span style={{
                            fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em',
                            color: T.ocean, textTransform: 'uppercase', fontWeight: 700,
                            flexShrink: 0,
                          }}>
                            {m.category}
                          </span>
                          <span style={{
                            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textMute,
                            whiteSpace: 'nowrap', flexShrink: 0,
                          }}>
                            {formatDuration((Date.now() - new Date(m.createdAt).getTime()) / 1000, 'short')} ago
                          </span>
                        </div>
                        <div style={{
                          fontSize: 14, color: T.text, fontWeight: unread ? 700 : 600, marginTop: 4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {m.subject}
                        </div>
                        <div style={{
                          fontSize: 12, color: T.textMute, marginTop: 4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
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
      <div style={{ position: 'relative', zIndex: 10, minWidth: 0 }}>
        {/* sidebar replaces header */}
        <main style={{
          // Tight horizontal padding on phones, generous on desktop. Prevents
          // the inbox grid from being squeezed into a tiny right column.
          padding: 'clamp(24px, 6vw, 48px) clamp(12px, 3vw, 32px) 64px',
          maxWidth: 1180, margin: '0 auto',
          minWidth: 0,
        }}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function Heading({ unreadInbound, onCompose }: { unreadInbound: number; onCompose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 8 }}>
      <div>
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
      <button onClick={onCompose} style={{
        padding: '12px 22px', borderRadius: 10,
        background: T.ocean, color: '#fff', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', flexShrink: 0,
      }}>
        ✉ Compose broadcast
      </button>
    </div>
  );
}

// Modal composer for sending an email broadcast to a filtered student
// audience. Two-step UX: write → dry-run-count → confirm-send.
function BroadcastComposer({ onClose }: { onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [audience, setAudience] = useState<'all' | 'paid' | 'course' | 'free' | 'tier:standard' | 'tier:plus' | 'tier:solo'>('course');
  const [stage, setStage] = useState<'compose' | 'preview' | 'done'>('compose');
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ sent: number; failed: number; errors: Array<{ email: string; reason: string }> } | null>(null);

  const dryRun = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyText, audience, dryRun: true }),
      });
      const j = await r.json();
      if (!r.ok) { setErr(j.message || j.error || 'Failed.'); return; }
      setCount(j.recipientCount);
      setStage('preview');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyText, audience }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.message || j.error || 'Send failed.');
        return;
      }
      setResult({ sent: j.sent, failed: j.failed, errors: j.errors ?? [] });
      setStage('done');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,26,38,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 18, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...CARD, maxWidth: 640, width: '100%', padding: 'clamp(20px, 4vw, 28px)', marginTop: 60, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              Compose broadcast
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>Email all students</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 24, color: T.textMute, lineHeight: 1 }}>×</button>
        </div>

        {stage === 'compose' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={composeLabel}>Audience</label>
              <select value={audience} onChange={e => setAudience(e.target.value as typeof audience)} style={composeInput}>
                <option value="all">All verified students (everyone)</option>
                <option value="course">Course buyers only (Standard + Plus)</option>
                <option value="paid">All paid customers (Standard, Plus, Solo)</option>
                <option value="tier:standard">Standard tier only</option>
                <option value="tier:plus">Plus tier only</option>
                <option value="tier:solo">Solo website tier only</option>
                <option value="free">Free tier only (lead nurture)</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={composeLabel}>Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} maxLength={200} placeholder="A note from Ralph" style={composeInput} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={composeLabel}>Body</label>
              <textarea value={bodyText} onChange={e => setBodyText(e.target.value)} maxLength={20000} rows={10} placeholder={`Hi {{firstName}},\n\nYour message here...\n\nRalph`} style={{ ...composeInput, resize: 'vertical', minHeight: 220, lineHeight: 1.6 }} />
              <p style={{ fontSize: 11, color: T.textMute, marginTop: 6, lineHeight: 1.5, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                Use <code>{'{{firstName}}'}</code> to personalize. Blank lines become paragraph breaks. Students see the message both in their email AND in their /profile inbox.
              </p>
            </div>
            {err && <p style={{ fontSize: 12, color: T.coral, marginBottom: 10 }}>{err}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={onClose} style={{ ...BUTTON_3D.ghost, padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={dryRun} disabled={busy || subject.length < 3 || bodyText.length < 10} style={{
                padding: '10px 18px', borderRadius: 10,
                background: T.ocean, color: '#fff', border: 'none',
                cursor: busy ? 'wait' : 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'inherit',
                opacity: (busy || subject.length < 3 || bodyText.length < 10) ? 0.5 : 1,
              }}>
                {busy ? 'Counting…' : 'Preview recipients →'}
              </button>
            </div>
          </>
        )}

        {stage === 'preview' && (
          <>
            <div style={{ ...CARD, padding: 18, marginBottom: 14, background: T.bgRaised, borderLeft: `3px solid ${T.ocean}` }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: T.text, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{count}</div>
              <div style={{ fontSize: 13, color: T.textDim }}>verified students will receive this email.</div>
            </div>
            <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, marginBottom: 14 }}>
              <strong style={{ color: T.text }}>Subject:</strong> {subject}<br />
              <strong style={{ color: T.text }}>Audience:</strong> {audience}<br />
              <strong style={{ color: T.text }}>Body length:</strong> {bodyText.length.toLocaleString()} chars
            </p>
            {err && <p style={{ fontSize: 12, color: T.coral, marginBottom: 10 }}>{err}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setStage('compose')} style={{ ...BUTTON_3D.ghost, padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'inherit' }}>← Edit</button>
              <button onClick={send} disabled={busy} style={{
                padding: '10px 18px', borderRadius: 10,
                background: T.coral, color: '#fff', border: 'none',
                cursor: busy ? 'wait' : 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'inherit',
                opacity: busy ? 0.5 : 1,
              }}>
                {busy ? `Sending to ${count}…` : `Send to ${count} students`}
              </button>
            </div>
          </>
        )}

        {stage === 'done' && result && (
          <>
            <div style={{ ...CARD, padding: 18, marginBottom: 14, background: T.bgRaised, borderLeft: `3px solid ${T.green}` }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: T.green, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Sent · {result.sent} delivered</div>
              {result.failed > 0 && (
                <div style={{ fontSize: 13, color: T.coral, marginTop: 6 }}>
                  {result.failed} failed:
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
                    {result.errors.map((e, i) => <li key={i}>{e.email} — {e.reason}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ ...BUTTON_3D.primary, padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const composeLabel: React.CSSProperties = {
  display: 'block',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10, letterSpacing: '0.18em',
  textTransform: 'uppercase', fontWeight: 700, color: T.textDim, marginBottom: 6,
};
const composeInput: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: `1px solid ${T.border}`, background: T.bgRaised, color: T.text,
  fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5,
  boxSizing: 'border-box',
};

function MessageView({ message, onBack }: { message: Message; onBack: () => void }) {
  return (
    <div style={{ ...CARD, padding: 'clamp(16px, 4vw, 24px)', maxWidth: '100%', overflow: 'hidden' }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.ocean, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: 0, marginBottom: 16 }}>← Back to list</button>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
        {message.direction === 'inbound' ? 'Received' : 'Sent'} · {message.category}
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 800, color: T.text, lineHeight: 1.2, marginBottom: 14, wordBreak: 'break-word' }}>
        {message.subject}
      </h2>
      <div style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4, wordBreak: 'break-word' }}>
        <span><strong style={{ color: T.text }}>{message.direction === 'inbound' ? 'From' : 'To'}:</strong> {message.direction === 'inbound' ? message.fromAddr : message.toAddr}</span>
        <span><strong style={{ color: T.text }}>{message.direction === 'inbound' ? 'To' : 'From'}:</strong> {message.direction === 'inbound' ? message.toAddr : message.fromAddr}</span>
        <span><strong style={{ color: T.text }}>Status:</strong> {message.status}{message.errorMsg ? ` · ${message.errorMsg}` : ''}</span>
        <span><strong style={{ color: T.text }}>Date:</strong> {new Date(message.createdAt).toLocaleString()}</span>
      </div>
      <div style={{
        background: T.bgRaised, borderRadius: 10,
        padding: 'clamp(14px, 3.5vw, 18px)',
        fontSize: 14, color: T.text, lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',  // long unbroken URLs / tokens still wrap
      }}>
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
