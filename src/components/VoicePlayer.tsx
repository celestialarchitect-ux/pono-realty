'use client';

import { useEffect, useRef, useState } from 'react';
import { T } from '@/lib/theme';

export interface VoicePlayerProps {
  // Each section has a label (announced before content) and the content text.
  sections: Array<{ label: string; text: string }>;
}

export function VoicePlayer({ sections }: VoicePlayerProps) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [rate, setRate] = useState(1.0);
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (list.length > 0 && !voice) {
        // Prefer high-quality English voice
        const preferred =
          list.find(v => v.name.includes('Samantha') && v.lang.startsWith('en')) ||
          list.find(v => v.name.includes('Daniel') && v.lang.startsWith('en')) ||
          list.find(v => v.lang === 'en-US' && v.localService) ||
          list.find(v => v.lang.startsWith('en')) ||
          list[0];
        setVoice(preferred);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [voice]);

  // Pause/resume
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const play = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];

    const utterances: SpeechSynthesisUtterance[] = [];
    sections.forEach((section, idx) => {
      const u = new SpeechSynthesisUtterance(`${section.label}. ${section.text}`);
      if (voice) u.voice = voice;
      u.rate = rate;
      u.pitch = 1.0;
      u.onstart = () => setCurrentSection(idx);
      u.onend = () => {
        if (idx === sections.length - 1) {
          setPlaying(false);
          setPaused(false);
          setCurrentSection(null);
        }
      };
      utterances.push(u);
    });
    queueRef.current = utterances;
    utterances.forEach(u => window.speechSynthesis.speak(u));
    setPlaying(true);
    setPaused(false);
  };

  const pauseResume = () => {
    if (!supported) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    setCurrentSection(null);
  };

  const changeRate = (newRate: number) => {
    setRate(newRate);
    if (playing) {
      // Restart with new rate
      const wasPaused = paused;
      stop();
      setTimeout(() => {
        play();
        if (wasPaused) {
          setTimeout(() => pauseResume(), 100);
        }
      }, 100);
    }
  };

  if (!supported) {
    return (
      <div style={{ padding: 14, background: T.bgRaised, borderRadius: 8, fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' }}>
        Voice playback not supported in this browser
      </div>
    );
  }

  return (
    <div style={{
      padding: 16, background: T.bgElevated, border: `1px solid ${T.border}`, borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    }}>
      {/* Play / pause-resume / stop */}
      <div style={{ display: 'flex', gap: 6 }}>
        {!playing ? (
          <button
            onClick={play}
            style={{
              padding: '10px 18px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${T.oceanDark}`,
              background: `linear-gradient(180deg, ${T.ocean}, ${T.oceanDark})`, color: T.white,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ▶ Listen
          </button>
        ) : (
          <>
            <button
              onClick={pauseResume}
              style={{
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                background: T.bgRaised, border: `1px solid ${T.border}`, color: T.text,
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              }}
            >
              {paused ? '▶ Resume' : '❚❚ Pause'}
            </button>
            <button
              onClick={stop}
              style={{
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                background: T.bgRaised, border: `1px solid ${T.border}`, color: T.text,
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              }}
            >
              ■ Stop
            </button>
          </>
        )}
      </div>

      {/* Voice picker */}
      {voices.length > 1 && (
        <select
          value={voice?.name || ''}
          onChange={e => {
            const v = voices.find(vv => vv.name === e.target.value);
            if (v) setVoice(v);
          }}
          style={{
            padding: '8px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
            background: T.white, border: `1px solid ${T.border}`, color: T.text, maxWidth: 220,
          }}
        >
          {voices
            .filter(v => v.lang.startsWith('en'))
            .map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
        </select>
      )}

      {/* Rate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.16em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>
          Speed
        </span>
        {[0.85, 1.0, 1.25, 1.5].map(r => (
          <button
            key={r}
            onClick={() => changeRate(r)}
            style={{
              padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
              background: rate === r ? T.ocean : T.bgRaised,
              border: `1px solid ${rate === r ? T.oceanDark : T.border}`,
              color: rate === r ? T.white : T.textDim,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
            }}
          >
            {r}×
          </button>
        ))}
      </div>

      {/* Status */}
      {playing && currentSection !== null && (
        <div style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.text, letterSpacing: '0.1em', fontWeight: 600 }}>
          ● {sections[currentSection]?.label} ({currentSection + 1}/{sections.length})
        </div>
      )}
    </div>
  );
}
