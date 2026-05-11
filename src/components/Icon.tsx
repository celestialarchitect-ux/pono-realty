// Custom line icons for Ralph Foulger's School of Real Estate.
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
  | 'trophy';

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
