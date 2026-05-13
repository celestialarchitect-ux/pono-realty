'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { T, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  { label: 'What is HARPTA?', portion: 'Hawaii' },
  { label: 'Explain the Laws of Agency (COALD)', portion: 'National' },
  { label: 'How do I calculate proration on closing?', portion: 'National' },
  { label: 'Difference between Land Court and Regular System?', portion: 'Hawaii' },
  { label: 'Quiz me on financing — 5 questions', portion: 'Both' },
  { label: 'Explain dual agency in Hawaii', portion: 'Both' },
];

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setStreaming('');
    setError(null);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // The API can fail for several distinct reasons. Surface each with
        // an actionable message instead of the generic "error" fallback.
        if (err.error === 'tutor_offline') {
          setError(err.message || 'Tutor is being provisioned. Check back shortly.');
        } else if (err.error === 'tier_required' || res.status === 402) {
          // Free / Solo / expired users: bounce them to /pricing with context.
          setError(err.message || 'Upgrade to use the AI tutor.');
          setTimeout(() => {
            window.location.href = err.upgrade || '/pricing?reason=tutor';
          }, 1400);
        } else if (err.error === 'unauthorized' || res.status === 401) {
          setError('Your session ended. Sending you to sign in…');
          setTimeout(() => {
            window.location.href = `/login?next=${encodeURIComponent('/tutor')}`;
          }, 1200);
        } else if (err.error === 'rate_limited' || res.status === 429) {
          setError(err.message || 'You\'ve hit the hourly tutor limit. Try again in a few minutes.');
        } else {
          setError(err.message || 'The tutor encountered an error. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (!res.body) {
        setError('No response stream from tutor.');
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setStreaming(acc);
      }
      setMessages([...next, { role: 'assistant', content: acc }]);
      setStreaming('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network error.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/tools" />

        <section style={{ padding: '40px 24px 0', maxWidth: 920, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 999, background: T.bgElevated, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.ocean, textTransform: 'uppercase', marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.ocean, animation: 'pulse 2s infinite' }} />
              AI Real Estate Tutor · Live
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text, marginBottom: 12 }}>
              Ask me anything.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: T.textDim, maxWidth: 580, margin: '0 auto' }}>
              Trained on the Hawaii curriculum, PSI exam content, and a deep library of real estate references. Always tells you which portion (National or Hawaii) the topic falls under.
            </p>
          </div>
        </section>

        <section style={{ padding: '0 24px', maxWidth: 920, margin: '0 auto' }}>
          {messages.length === 0 && !streaming && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Try one</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => send(p.label)}
                    disabled={loading}
                    style={{
                      ...CARD,
                      padding: '14px 16px', borderRadius: 12, textAlign: 'left',
                      cursor: loading ? 'wait' : 'pointer', border: `1px solid ${T.border}`,
                      background: T.bg,
                    }}
                  >
                    <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: p.portion === 'Hawaii' ? T.coral : p.portion === 'Both' ? T.textMute : T.ocean, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
                      {p.portion}
                    </div>
                    <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4, fontWeight: 500 }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={scrollRef} style={{
            ...CARD, borderRadius: 16, padding: '20px 22px', marginBottom: 16,
            minHeight: messages.length === 0 ? 0 : 320, maxHeight: '60vh', overflowY: 'auto',
            display: messages.length === 0 && !streaming ? 'none' : 'block',
          }}>
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.content} />
            ))}
            {streaming && <Bubble role="assistant" text={streaming} streaming />}
            {error && (
              <div style={{
                padding: '14px 16px', borderRadius: 10, background: 'rgba(232,93,60,0.08)',
                border: `1px solid ${T.coral}`, color: T.coral, fontSize: 14, lineHeight: 1.6,
                marginTop: 12,
              }}>
                <strong>Tutor: </strong>{error}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            style={{
              ...CARD,
              borderRadius: 14, padding: '6px', display: 'flex', gap: 6,
              boxShadow: '0 8px 24px rgba(45,55,72,0.08)',
              marginBottom: 24,
              alignItems: 'flex-end',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about a chapter, a concept, a math problem, or for a quiz…"
              rows={2}
              disabled={loading}
              style={{
                flex: 1, border: 'none', outline: 'none', resize: 'none',
                background: 'transparent', padding: '12px 14px', fontSize: 15,
                fontFamily: "'Inter', system-ui, sans-serif", color: T.text,
                lineHeight: 1.5, minHeight: 60,
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                ...BUTTON_3D.primary,
                padding: '12px 22px', borderRadius: 10, border: 'none',
                fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                whiteSpace: 'nowrap', alignSelf: 'stretch',
              }}
            >
              {loading ? '...' : 'Ask →'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 32, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', color: T.textMute }}>
            <span>Press Enter to send · Shift+Enter for newline</span>
            <Link href="/tools" style={{ color: T.ocean, textDecoration: 'none' }}>← Back to overview</Link>
          </div>
        </section>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>

        <Footer />
      </div>
    </div>
  );
}

function Bubble({ role, text, streaming }: { role: 'user' | 'assistant'; text: string; streaming?: boolean }) {
  const isUser = role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 0',
      borderBottom: `1px solid ${T.border}`,
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      <div style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
        background: isUser ? T.ocean : T.coral,
        color: T.white, fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700, letterSpacing: '0.05em',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser ? 'YOU' : 'AI'}
      </div>
      <div style={{
        flex: 1, fontSize: 15, lineHeight: 1.7, color: T.text,
        whiteSpace: 'pre-wrap', wordWrap: 'break-word',
        textAlign: isUser ? 'right' : 'left',
      }}>
        {text}
        {streaming && (
          <span style={{
            display: 'inline-block', width: 8, height: 16, marginLeft: 4,
            background: T.ocean, verticalAlign: 'middle',
            animation: 'cursor-blink 1s infinite',
          }} />
        )}
        <style jsx>{`
          @keyframes cursor-blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
