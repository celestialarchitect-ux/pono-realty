// Custom line icons for Ralph Foulger's Academy of Real Estate.
// Stroke-based, currentColor, designed to sit next to Playfair Display headlines.
// Replaces generic emoji usage per content style doctrine.

export type IconKind =
  | 'audiobook'
  | 'tutor'
  | 'book'
  | 'flashcards'
  | 'calculator'
  | 'exam'
  | 'library'
  | 'mobile'
  | 'website'
  | 'target'
  | 'shield'
  | 'audit'
  | 'no-cheat'
  | 'graduate'
  | 'compass'
  | 'flag'
  | 'thinking'
  | 'calendar'
  | 'trophy'
  // Added for the lesson-planner + start-time selector.
  | 'review'      // cyclic arrows — spaced repetition / review days
  | 'brain'       // memory / learning
  | 'chart-up'    // mock-exam trending / progress
  | 'sync'        // auto-rebalance arrows
  | 'sunrise'     // early-bird preset
  | 'sun'         // mid-day preset
  | 'sunset'      // evening preset
  | 'moon'        // night-owl preset
  | 'clock'       // generic time preset
  | 'install'     // PWA install pill (replaces 📱)
  | 'lock';       // PIN settings (replaces lock emoji)

interface IconProps {
  kind: IconKind;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ kind, size = 28, strokeWidth = 1.6 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  };

  switch (kind) {
    case 'audiobook':
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 0 1 16 0" />
          <path d="M4 12v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2z" />
          <path d="M20 12v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" />
          <path d="M17 17v1a2 2 0 0 1-2 2h-2" />
        </svg>
      );
    case 'tutor':
      return (
        <svg {...common}>
          <path d="M4 6h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4 3v-3H4a0 0 0 0 1 0 0z" />
          <circle cx="10" cy="11.5" r="0.9" fill="currentColor" />
          <circle cx="14" cy="11.5" r="0.9" fill="currentColor" />
          <path d="M18 4l.6 1.4L20 6l-1.4.6L18 8l-.6-1.4L16 6l1.4-.6z" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common}>
          <path d="M4 5a1 1 0 0 1 1-1h5a2 2 0 0 1 2 2v13" />
          <path d="M20 5a1 1 0 0 0-1-1h-5a2 2 0 0 0-2 2v13" />
          <path d="M4 5v14h7" />
          <path d="M20 5v14h-7" />
        </svg>
      );
    case 'flashcards':
      return (
        <svg {...common}>
          <rect x="3" y="7" width="14" height="11" rx="2" transform="rotate(-6 10 12.5)" />
          <rect x="6" y="6" width="14" height="11" rx="2" />
          <path d="M10 11h6" />
          <path d="M10 14h4" />
        </svg>
      );
    case 'calculator':
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <rect x="7.5" y="5.5" width="9" height="3" rx="0.6" />
          <circle cx="8.5" cy="12" r="0.7" fill="currentColor" />
          <circle cx="12" cy="12" r="0.7" fill="currentColor" />
          <circle cx="15.5" cy="12" r="0.7" fill="currentColor" />
          <circle cx="8.5" cy="15" r="0.7" fill="currentColor" />
          <circle cx="12" cy="15" r="0.7" fill="currentColor" />
          <circle cx="15.5" cy="15" r="0.7" fill="currentColor" />
          <circle cx="8.5" cy="18" r="0.7" fill="currentColor" />
          <path d="M12 17.3v1.4M11.3 18h1.4M15.5 17.3v1.4M14.8 18h1.4" />
        </svg>
      );
    case 'exam':
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
          <path d="M9 11l2 2 4-4" />
          <path d="M9 16h6" />
        </svg>
      );
    case 'library':
      return (
        <svg {...common}>
          <rect x="3.5" y="4" width="3" height="16" rx="0.6" />
          <rect x="8" y="6" width="3" height="14" rx="0.6" />
          <rect x="12.5" y="4" width="3" height="16" rx="0.6" />
          <path d="M16.5 8.5l3.6-1 3 11-3.6 1z" />
        </svg>
      );
    case 'mobile':
      return (
        <svg {...common}>
          <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
          <path d="M10 5h4" />
          <circle cx="12" cy="18" r="0.9" fill="currentColor" />
        </svg>
      );
    case 'website':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
        </svg>
      );
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l8 3v5c0 4.5-3 8.5-8 10-5-1.5-8-5.5-8-10V6z" />
          <path d="M9 12l2.2 2.2L15 10.5" />
        </svg>
      );
    case 'audit':
      return (
        <svg {...common}>
          <circle cx="10" cy="9" r="3.5" />
          <path d="M3.5 20a6.5 6.5 0 0 1 13 0" />
          <path d="M15.5 14.5l1.6 1.6 3.4-3.4" />
        </svg>
      );
    case 'no-cheat':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M5.5 5.5l13 13" />
        </svg>
      );
    case 'graduate':
      return (
        <svg {...common}>
          <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" />
          <path d="M6 11.5v4.5c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
          <path d="M21.5 9.5V15" />
        </svg>
      );
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-1.5 5-5 1.5 1.5-5z" />
        </svg>
      );
    case 'flag':
      return (
        <svg {...common}>
          <path d="M5 21V4" />
          <path d="M5 4h11l-2 4 2 4H5" />
        </svg>
      );
    case 'thinking':
      return (
        <svg {...common}>
          <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
          <path d="M9.5 10a2.5 2.5 0 0 1 5 0c0 1.5-2.5 1.7-2.5 3" />
          <circle cx="12" cy="14.6" r="0.7" fill="currentColor" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M3.5 9.5h17" />
          <path d="M8 3v4M16 3v4" />
          <circle cx="8" cy="14" r="0.8" fill="currentColor" />
          <circle cx="12" cy="14" r="0.8" fill="currentColor" />
          <circle cx="16" cy="14" r="0.8" fill="currentColor" />
          <circle cx="8" cy="17.5" r="0.8" fill="currentColor" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...common}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
          <path d="M8 6H5.5a2.5 2.5 0 0 0 0 5H8" />
          <path d="M16 6h2.5a2.5 2.5 0 0 1 0 5H16" />
          <path d="M10 13.5v3M14 13.5v3" />
          <path d="M8 19.5h8" />
          <path d="M9 17h6v2.5H9z" />
        </svg>
      );
    case 'review':
      // Two cyclic arrows for review / spaced repetition. The pair of
      // half-circles with chevrons feels like "go back, then forward again".
      return (
        <svg {...common}>
          <path d="M4 8a8 8 0 0 1 13.6-3.6L20 7" />
          <path d="M20 4v4h-4" />
          <path d="M20 16a8 8 0 0 1-13.6 3.6L4 17" />
          <path d="M4 20v-4h4" />
        </svg>
      );
    case 'brain':
      // Stylized brain — two hemispheres with a center fold.
      return (
        <svg {...common}>
          <path d="M9.5 4.5a3 3 0 0 0-3 3 3 3 0 0 0-1 5.6A3 3 0 0 0 8 18a3 3 0 0 0 4 1.5V4.5a3 3 0 0 0-2.5 0z" />
          <path d="M14.5 4.5a3 3 0 0 1 3 3 3 3 0 0 1 1 5.6A3 3 0 0 1 16 18a3 3 0 0 1-4 1.5V4.5a3 3 0 0 1 2.5 0z" />
          <path d="M12 4.5v15" />
        </svg>
      );
    case 'chart-up':
      // Bar chart with an upward trending arrow on top.
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <rect x="5" y="13" width="3" height="6" rx="0.5" />
          <rect x="10.5" y="9" width="3" height="10" rx="0.5" />
          <rect x="16" y="5" width="3" height="14" rx="0.5" />
          <path d="M5.5 9l4-3 4 1.5 4.5-3.5" />
          <path d="M14.5 4h3v3" />
        </svg>
      );
    case 'sync':
      // Two circular arrows for auto-rebalance / refresh.
      return (
        <svg {...common}>
          <path d="M20 8a8 8 0 0 0-14.5-2" />
          <path d="M4 4v4h4" />
          <path d="M4 16a8 8 0 0 0 14.5 2" />
          <path d="M20 20v-4h-4" />
        </svg>
      );
    case 'sunrise':
      return (
        <svg {...common}>
          <circle cx="12" cy="14" r="3.5" />
          <path d="M3 18h18" />
          <path d="M12 4v2.5" />
          <path d="M5 8.5l1.6 1.6" />
          <path d="M19 8.5l-1.6 1.6" />
          <path d="M8.5 18l3.5-4 3.5 4" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2.5" />
          <path d="M12 18.5V21" />
          <path d="M3 12h2.5" />
          <path d="M18.5 12H21" />
          <path d="M5.5 5.5l1.7 1.7" />
          <path d="M16.8 16.8l1.7 1.7" />
          <path d="M5.5 18.5l1.7-1.7" />
          <path d="M16.8 7.2l1.7-1.7" />
        </svg>
      );
    case 'sunset':
      return (
        <svg {...common}>
          <circle cx="12" cy="14" r="3.5" />
          <path d="M3 18h18" />
          <path d="M5 8.5l1.6 1.6" />
          <path d="M19 8.5l-1.6 1.6" />
          <path d="M12 4v2.5" />
          <path d="M8.5 14l3.5 4 3.5-4" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...common}>
          <path d="M20 14a8 8 0 1 1-10-10 6 6 0 0 0 10 10z" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2.2" />
        </svg>
      );
    case 'install':
      // Download/install arrow into a phone-shaped tray.
      return (
        <svg {...common}>
          <rect x="6.5" y="3" width="11" height="18" rx="2.4" />
          <path d="M12 8v6" />
          <path d="M9.5 11.5L12 14l2.5-2.5" />
          <path d="M9.5 18h5" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15" r="1" fill="currentColor" />
        </svg>
      );
  }
}

// Convenience wrapper that draws the icon inside a tinted square — used by Feature/Pillar/Reward cards.
export function IconBadge({ kind, accent = 'ocean', size = 44 }: { kind: IconKind; accent?: 'ocean' | 'coral' | 'sand'; size?: number }) {
  const palette = {
    ocean: { bg: 'rgba(20,131,123,0.10)', fg: '#14837b', border: 'rgba(20,131,123,0.22)' },
    coral: { bg: 'rgba(232,93,60,0.10)', fg: '#c14628', border: 'rgba(232,93,60,0.22)' },
    sand:  { bg: 'rgba(212,165,116,0.16)', fg: '#8a5d2a', border: 'rgba(212,165,116,0.28)' },
  }[accent];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.fg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon kind={kind} size={Math.round(size * 0.55)} strokeWidth={1.7} />
    </div>
  );
}
