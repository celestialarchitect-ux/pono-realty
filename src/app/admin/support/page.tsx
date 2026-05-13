'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { formatDuration } from '@/lib/time-tracking';

type Status = 'open' | 'in_progress' | 'resolved' | 'dismissed';

interface Reporter {
  kind: 'user' | 'anonymous';
  id?: string; email?: string | null; name?: string | null; firstName?: string; lastName?: string; tier?: string;
}
interface Ticket {
  id: string;
  page: string;
  url: string;
  category: string;
  description: string;
  status: Status;
  adminNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userAgent?: string | null;
  reporter: Reporter;
}

const STATUS_LABEL: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};
const STATUS_COLOR: Record<Status, string> = {
  open: T.coral,
  in_progress: T.amber,
  resolved: T.green,
  dismissed: T.textMute,
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [counts, setCounts] = useState<Record<Status, number>>({ open: 0, in_progress: 0, resolved: 0, dismissed: 0 });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<Status | 'all'>('open');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [active, setActive] = useState<Ticket | null>(null);
  const [unprovisioned, setUnprovisioned] = useState(false);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      const qs = params.toString();
      const res = await fetch(`/api/admin/support${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
      if (res.status === 503) { setUnprovisioned(true); return; }
      if (!res.ok) return;
      const data = await res.json();
      setTickets(data.tickets);
      setCounts(data.counts);
      if (data.categoryCounts) setCategoryCounts(data.categoryCounts);
    } catch {/* ignore */}
  };

  useEffect(() => { load(); const id = setInterval(load, 15_000); return () => clearInterval(id); }, [filter, categoryFilter]);

  const updateStatus = async (id: string, status: Status, adminNotes?: string) => {
    await fetch(`/api/admin/support/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
    setActive(null);
    load();
  };

  return (
    <Shell>
      <Heading />
      {unprovisioned ? (
        <UnprovisionedNotice />
      ) : (
        <>
          <FilterBar counts={counts} filter={filter} setFilter={setFilter} />
          <CategoryFilter categoryCounts={categoryCounts} category={categoryFilter} setCategory={setCategoryFilter} />
          {tickets === null ? (
            <p style={{ color: T.textMute, marginTop: 18 }}>Loading…</p>
          ) : tickets.length === 0 ? (
            <div style={{ ...CARD, padding: 32, marginTop: 18, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: T.textMute, margin: 0 }}>No tickets in this status. When students hit the Report a Problem button, they show up here.</p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tickets.map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => setActive(t)}
                    style={{ ...CARD, padding: '16px 18px', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: STATUS_COLOR[t.status] }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: STATUS_COLOR[t.status], textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                          {STATUS_LABEL[t.status]} · {t.category}
                        </div>
                        <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {t.description}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textMute }}>
                        {formatDuration((Date.now() - new Date(t.createdAt).getTime()) / 1000, 'short')} ago
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <span>{t.reporter.kind === 'user' ? `${t.reporter.name ?? t.reporter.email}` : (t.reporter.email ?? 'anonymous')}</span>
                      <span>·</span>
                      <span>{t.page}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {active && <TicketDrawer ticket={active} onClose={() => setActive(null)} onUpdate={updateStatus} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* sidebar replaces header */}
        <main style={{ padding: '48px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
        Admin · Support
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 6 }}>
        Support <em style={{ color: T.ocean, fontStyle: 'italic' }}>queue.</em>
      </h1>
      <p style={{ fontSize: 14, color: T.textMute, margin: 0 }}>Every &ldquo;Report a Problem&rdquo; submission lands here. Auto-refresh every 15 s.</p>
    </div>
  );
}

function FilterBar({ counts, filter, setFilter }: { counts: Record<Status, number>; filter: Status | 'all'; setFilter: (f: Status | 'all') => void }) {
  const tabs: (Status | 'all')[] = ['open', 'in_progress', 'resolved', 'dismissed', 'all'];
  const labels: Record<string, string> = { ...STATUS_LABEL, all: 'All' };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {tabs.map(t => {
        const count = t === 'all' ? Object.values(counts).reduce((s, n) => s + n, 0) : counts[t as Status];
        const isActive = filter === t;
        return (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              ...(isActive ? BUTTON_3D.primary : BUTTON_3D.secondary),
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit', border: isActive ? 'none' : undefined,
            }}
          >
            {labels[t]} <span style={{ marginLeft: 6, opacity: 0.7 }}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

// Category filter — only renders when there's more than one category in
// the data. Lets admins see ALL variant-review flags in one tap, or all
// 'billing' tickets, etc.
function CategoryFilter({ categoryCounts, category, setCategory }: { categoryCounts: Record<string, number>; category: string | 'all'; setCategory: (c: string | 'all') => void }) {
  const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  if (entries.length <= 1) return null;
  const labelFor = (k: string) => k === 'variant-review' ? 'Variant flags' : k.charAt(0).toUpperCase() + k.slice(1);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginRight: 4 }}>Category</span>
      <button
        onClick={() => setCategory('all')}
        style={{
          padding: '5px 11px', borderRadius: 999,
          background: category === 'all' ? T.ocean : 'transparent',
          color: category === 'all' ? '#fff' : T.text,
          border: `1px solid ${category === 'all' ? T.oceanDark : T.border}`,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
        All <span style={{ opacity: 0.7, marginLeft: 4 }}>{entries.reduce((s, [_k, v]) => s + v, 0)}</span>
      </button>
      {entries.map(([cat, n]) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          style={{
            padding: '5px 11px', borderRadius: 999,
            background: category === cat ? T.ocean : 'transparent',
            color: category === cat ? '#fff' : T.text,
            border: `1px solid ${category === cat ? T.oceanDark : T.border}`,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
          {labelFor(cat)} <span style={{ opacity: 0.7, marginLeft: 4 }}>{n}</span>
        </button>
      ))}
    </div>
  );
}

function UnprovisionedNotice() {
  return (
    <div style={{ ...CARD, padding: 28, marginTop: 24, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
      <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, margin: 0 }}>
        Backend not yet provisioned. Add Postgres, run <code style={mono}>npm run db:push</code>, and reports will land here in real time.
      </p>
    </div>
  );
}

function TicketDrawer({ ticket, onClose, onUpdate }: { ticket: Ticket; onClose: () => void; onUpdate: (id: string, status: Status, notes?: string) => Promise<void> }) {
  const [notes, setNotes] = useState(ticket.adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const change = async (status: Status) => {
    setSaving(true);
    await onUpdate(ticket.id, status, notes);
    setSaving(false);
  };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,26,38,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 18, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...CARD, maxWidth: 640, width: '100%', padding: 28, marginTop: 60, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: STATUS_COLOR[ticket.status], textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              {STATUS_LABEL[ticket.status]} · {ticket.category} · RF-{ticket.id.slice(0, 8)}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.2, margin: 0 }}>
              From {ticket.reporter.kind === 'user' ? (ticket.reporter.name ?? ticket.reporter.email) : (ticket.reporter.name ?? 'Anonymous')}
            </h2>
            {ticket.reporter.email && (
              <a href={`mailto:${ticket.reporter.email}`} style={{ fontSize: 12, color: T.ocean, textDecoration: 'underline', fontFamily: "'JetBrains Mono', monospace" }}>{ticket.reporter.email}</a>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 22, color: T.textMute, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ background: T.bgRaised, borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 14, color: T.text, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
          {ticket.description}
        </div>

        <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span><strong style={{ color: T.text }}>Page:</strong> {ticket.page}</span>
          {ticket.url && <span><strong style={{ color: T.text }}>URL:</strong> {ticket.url}</span>}
          {ticket.userAgent && <span style={{ wordBreak: 'break-all' }}><strong style={{ color: T.text }}>Browser:</strong> {ticket.userAgent}</span>}
          <span><strong style={{ color: T.text }}>Submitted:</strong> {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.textMute, fontWeight: 600, marginBottom: 6 }}>Admin notes (internal)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notes for the team…" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.white, color: T.text, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.4, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {(['open', 'in_progress', 'resolved', 'dismissed'] as Status[]).map(s => (
            <button
              key={s}
              onClick={() => change(s)}
              disabled={saving || ticket.status === s}
              style={{
                ...(ticket.status === s ? BUTTON_3D.primary : BUTTON_3D.secondary),
                padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: saving || ticket.status === s ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', border: ticket.status === s ? 'none' : undefined, opacity: saving ? 0.6 : 1,
              }}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
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
