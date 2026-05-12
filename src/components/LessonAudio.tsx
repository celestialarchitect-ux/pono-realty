'use client';

import { useEffect, useRef, useState } from 'react';
import { T, BUTTON_3D } from '@/lib/theme';
import { Icon } from './Icon';

interface AudioSegment {
  label: string;     // e.g., "Section 1: ..."
  text: string;      // what gets spoken
}

interface LessonAudioProps {
  title: string;
  segments: AudioSegment[];
  // Optional path to a pre-recorded MP3 (Zachariah voice from ElevenLabs).
  // If the file exists at this URL, the player switches to high-quality
  // HTML5 audio mode. If missing (404), gracefully falls back to the
  // existing Web Speech API mode below — same component, no per-page edits.
  mp3Url?: string;
}

const SPEEDS: Array<{ value: number; label: string }> = [
  { value: 0.85, label: '0.85×' },
  { value: 1.0, label: '1×' },
  { value: 1.15, label: '1.15×' },
  { value: 1.3, label: '1.3×' },
  { value: 1.5, label: '1.5×' },
];

export function LessonAudio({ title, segments, mp3Url }: LessonAudioProps) {
  // mp3Available: null = probing, true = HEAD returned 200, false = missing/error
  const [mp3Available, setMp3Available] = useState<boolean | null>(mp3Url ? null : false);

  // Probe whether the pre-recorded MP3 exists; if so we'll prefer it over
  // the browser's Web Speech API (better quality, real voice, no per-play
  // API spend). Probe runs once on mount.
  useEffect(() => {
    if (!mp3Url) { setMp3Available(false); return; }
    let cancelled = false;
    fetch(mp3Url, { method: 'HEAD' })
      .then(res => { if (!cancelled) setMp3Available(res.ok); })
      .catch(() => { if (!cancelled) setMp3Available(false); });
    return () => { cancelled = true; };
  }, [mp3Url]);

  if (mp3Available === true && mp3Url) {
    return <Mp3Player title={title} url={mp3Url} />;
  }
  // mp3Available === null still loading — show nothing rather than
  // flashing the Web-Speech player only to swap it out. The skeleton is
  // brief because HEAD is fast.
  if (mp3Available === null) return null;
  return <WebSpeechPlayer title={title} segments={segments} />;
}

// HTML5 audio player for the pre-recorded ElevenLabs MP3. Same visual
// styling as the Web Speech fallback so the swap is invisible.
function Mp3Player({ title, url }: { title: string; url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => { setPlaying(false); setPct(0); };
    const onTime = () => {
      if (!a.duration || !Number.isFinite(a.duration)) return;
      setPct((a.currentTime / a.duration) * 100);
    };
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnd);
    a.addEventListener('timeupdate', onTime);
    return () => {
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('timeupdate', onTime);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play(); else a.pause();
  };
  const restart = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play();
  };
  const changeSpeed = (v: number) => {
    setSpeed(v);
    const a = audioRef.current;
    if (a) a.playbackRate = v;
  };

  return (
    <div style={{
      background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: '20px 22px', marginBottom: 32,
    }}>
      <audio ref={audioRef} src={url} preload="metadata" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: playing ? T.coral : T.ocean, color: T.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
          animation: playing ? 'pulse 2s infinite' : 'none',
        }}>
          <Icon kind="audiobook" size={22} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 3, fontWeight: 600 }}>
            {playing ? 'Now playing' : 'Listen to this lesson'}
          </div>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </div>
        </div>
      </div>

      <div style={{ height: 4, background: T.bg, borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: T.coral, transition: 'width 0.2s linear' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={toggle}
          style={{
            ...BUTTON_3D.primary,
            padding: '10px 22px', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
            cursor: 'pointer', minHeight: 44,
          }}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={restart}
          style={{
            padding: '10px 14px', borderRadius: 10, border: `1px solid ${T.border}`,
            background: 'transparent', fontSize: 12, fontWeight: 600, color: T.textDim,
            letterSpacing: '0.04em', cursor: 'pointer', minHeight: 44,
          }}
        >↻ Restart</button>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', marginRight: 4 }}>Speed</span>
          {SPEEDS.map(s => (
            <button
              key={s.value}
              onClick={() => changeSpeed(s.value)}
              style={{
                padding: '6px 10px', borderRadius: 8,
                border: `1px solid ${speed === s.value ? T.ocean : T.border}`,
                background: speed === s.value ? T.ocean : 'transparent',
                color: speed === s.value ? T.white : T.textDim,
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.04em', fontWeight: 600,
                cursor: 'pointer', minHeight: 32, minWidth: 38,
              }}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>
    </div>
  );
}

// ─── Web Speech API fallback (used until the MP3 file exists) ───────────────
function WebSpeechPlayer({ title, segments }: { title: string; segments: AudioSegment[] }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const cancelRequestedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length === 0) return;
      setVoices(v);
      // Prefer high-quality English voices in this order:
      const preferred = v.find(x => /Samantha|Karen|Daniel|Allison|Ava|Serena|Moira/.test(x.name) && x.lang.startsWith('en')) ||
                        v.find(x => x.lang.startsWith('en-US') && /Google|Microsoft/.test(x.name)) ||
                        v.find(x => x.lang.startsWith('en-US')) ||
                        v.find(x => x.lang.startsWith('en')) ||
                        v[0];
      setVoice(preferred);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const buildQueue = (startIdx = 0) => {
    const q: SpeechSynthesisUtterance[] = [];
    for (let i = startIdx; i < segments.length; i++) {
      const u = new SpeechSynthesisUtterance(segments[i].text);
      u.rate = speed;
      u.pitch = 1.0;
      u.volume = 1.0;
      if (voice) u.voice = voice;
      const idx = i;
      u.onstart = () => setCurrentIdx(idx);
      u.onend = () => {
        if (idx === segments.length - 1 && !cancelRequestedRef.current) {
          setPlaying(false);
          setPaused(false);
          setCurrentIdx(0);
        }
      };
      u.onerror = () => {
        if (!cancelRequestedRef.current) {
          setPlaying(false);
          setPaused(false);
        }
      };
      q.push(u);
    }
    return q;
  };

  const play = () => {
    if (!supported) return;
    cancelRequestedRef.current = false;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    const q = buildQueue(0);
    queueRef.current = q;
    setCurrentIdx(0);
    setPlaying(true);
    q.forEach(u => window.speechSynthesis.speak(u));
  };

  const pause = () => {
    if (!supported || !playing) return;
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const stop = () => {
    if (!supported) return;
    cancelRequestedRef.current = true;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    setCurrentIdx(0);
    setTimeout(() => { cancelRequestedRef.current = false; }, 50);
  };

  const restart = () => {
    stop();
    setTimeout(play, 80);
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (playing) {
      // Restart from current segment with new speed
      const idx = currentIdx;
      cancelRequestedRef.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        cancelRequestedRef.current = false;
        const q: SpeechSynthesisUtterance[] = [];
        for (let i = idx; i < segments.length; i++) {
          const u = new SpeechSynthesisUtterance(segments[i].text);
          u.rate = newSpeed;
          u.pitch = 1.0;
          if (voice) u.voice = voice;
          const segIdx = i;
          u.onstart = () => setCurrentIdx(segIdx);
          u.onend = () => {
            if (segIdx === segments.length - 1) {
              setPlaying(false);
              setPaused(false);
              setCurrentIdx(0);
            }
          };
          q.push(u);
        }
        q.forEach(u => window.speechSynthesis.speak(u));
      }, 80);
    }
  };

  const progressPct = playing && segments.length > 0
    ? Math.round(((currentIdx + 1) / segments.length) * 100)
    : 0;

  if (supported === null) return null; // hydration guard

  if (supported === false) {
    return (
      <div style={{
        background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 14,
        padding: '16px 20px', marginBottom: 28, fontSize: 13, color: T.textMute,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon kind="audiobook" size={18} />
        <span>Audio playback isn&apos;t supported in this browser. Try Safari, Chrome, or Edge.</span>
      </div>
    );
  }

  return (
    <div style={{
      background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: '20px 22px', marginBottom: 32,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: playing && !paused ? T.coral : T.ocean,
          color: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
          animation: playing && !paused ? 'pulse 2s infinite' : 'none',
        }}>
          <Icon kind="audiobook" size={22} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 3, fontWeight: 600 }}>
            {playing ? (paused ? 'Paused' : `Playing · ${currentIdx + 1} of ${segments.length}`) : 'Listen to this lesson'}
          </div>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {playing ? segments[currentIdx]?.label || title : title}
          </div>
        </div>
      </div>

      {playing && (
        <div style={{ height: 4, background: T.bg, borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{
            height: '100%', width: `${progressPct}%`,
            background: T.coral, transition: 'width 0.4s ease-out',
          }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {!playing ? (
          <button
            onClick={play}
            style={{
              ...BUTTON_3D.primary,
              padding: '10px 22px', borderRadius: 10, border: 'none',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              minHeight: 44,
            }}
          >
            ▶ Play
          </button>
        ) : paused ? (
          <button
            onClick={play}
            style={{
              ...BUTTON_3D.primary,
              padding: '10px 22px', borderRadius: 10, border: 'none',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              cursor: 'pointer', minHeight: 44,
            }}
          >
            ▶ Resume
          </button>
        ) : (
          <button
            onClick={pause}
            style={{
              ...BUTTON_3D.secondary,
              padding: '10px 22px', borderRadius: 10, border: `1px solid ${T.border}`,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              cursor: 'pointer', minHeight: 44,
            }}
          >
            ⏸ Pause
          </button>
        )}

        {playing && (
          <button
            onClick={stop}
            style={{
              ...BUTTON_3D.secondary,
              padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.border}`,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
              cursor: 'pointer', minHeight: 44,
            }}
          >
            ⏹
          </button>
        )}

        {!playing && segments.length > 0 && (
          <button
            onClick={restart}
            style={{
              padding: '10px 14px', borderRadius: 10, border: `1px solid ${T.border}`,
              background: 'transparent', fontSize: 12, fontWeight: 600, color: T.textDim,
              letterSpacing: '0.04em', cursor: 'pointer', minHeight: 44,
            }}
          >
            ↻ Restart
          </button>
        )}

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', marginRight: 4 }}>Speed</span>
          {SPEEDS.map(s => (
            <button
              key={s.value}
              onClick={() => changeSpeed(s.value)}
              style={{
                padding: '6px 10px', borderRadius: 8,
                border: `1px solid ${speed === s.value ? T.ocean : T.border}`,
                background: speed === s.value ? T.ocean : 'transparent',
                color: speed === s.value ? T.white : T.textDim,
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.04em', fontWeight: 600,
                cursor: 'pointer', minHeight: 32, minWidth: 38,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {voices.length > 1 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', cursor: 'pointer', padding: '4px 0', textTransform: 'uppercase' }}>
            Voice ({voice?.name || 'default'})
          </summary>
          <select
            value={voice?.name || ''}
            onChange={(e) => {
              const v = voices.find(x => x.name === e.target.value);
              if (v) setVoice(v);
            }}
            style={{
              marginTop: 6, padding: '8px 10px', borderRadius: 8,
              border: `1px solid ${T.border}`, background: T.bg,
              fontSize: 13, color: T.text, width: '100%', maxWidth: 360,
            }}
          >
            {voices.filter(v => v.lang.startsWith('en')).map(v => (
              <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </details>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
