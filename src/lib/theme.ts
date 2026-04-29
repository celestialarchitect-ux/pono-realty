// Pono Realty Academy theme — Hawaiian aloha-inspired professional palette.
// Warm cream + ocean teal + sunset coral. Trustworthy, premium, distinctive.

export const T = {
  // Backgrounds — warm cream/parchment, evokes printed textbook + premium
  bg: '#fbf7f0',          // page bg — warm cream
  bgElevated: '#f3ecdc',  // raised cards
  bgRaised: '#ece2cc',    // surface
  surface: '#e3d6b8',     // active surface

  // Borders — soft warm
  border: 'rgba(45,55,72,0.12)',
  borderHover: 'rgba(45,55,72,0.22)',
  borderFocus: 'rgba(20,131,123,0.5)', // ocean teal focus

  // Text — high contrast for readability
  text: '#0e1a26',         // near-black with blue undertone
  textDim: '#3a4a5c',
  textMute: '#6b7a8a',
  textGhost: '#a0acba',

  // Brand accents
  ocean: '#14837b',        // ocean teal — primary accent
  oceanDark: '#0d5e58',
  coral: '#e85d3c',        // sunset coral — secondary accent
  coralDark: '#c14628',
  sand: '#d4a574',         // beach sand — tertiary
  jungle: '#2d5a3d',       // jungle green — for "passed" / success

  // Status
  green: '#2d8659',
  red: '#c14628',
  amber: '#c08a2e',
  blue: '#14837b',

  // White/black for selective use
  white: '#ffffff',
  black: '#0e1a26',
} as const;

export const SHADOW_3D = {
  sm: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(45,55,72,0.08)',
  md: '0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 12px rgba(45,55,72,0.1), 0 2px 4px rgba(45,55,72,0.06)',
  lg: '0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 32px rgba(45,55,72,0.12), 0 4px 12px rgba(45,55,72,0.08)',
  press: 'inset 0 2px 4px rgba(45,55,72,0.15)',
} as const;

export const BUTTON_3D = {
  primary: {
    background: `linear-gradient(180deg, ${T.ocean} 0%, ${T.oceanDark} 100%)`,
    border: `1px solid ${T.oceanDark}`,
    color: T.white,
    boxShadow: '0 1px 0 rgba(255,255,255,0.25) inset, 0 4px 12px rgba(20,131,123,0.3), 0 2px 4px rgba(20,131,123,0.2)',
  },
  secondary: {
    background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgElevated} 100%)`,
    border: `1px solid ${T.border}`,
    color: T.text,
    boxShadow: SHADOW_3D.md,
  },
  coral: {
    background: `linear-gradient(180deg, ${T.coral} 0%, ${T.coralDark} 100%)`,
    border: `1px solid ${T.coralDark}`,
    color: T.white,
    boxShadow: '0 1px 0 rgba(255,255,255,0.25) inset, 0 4px 12px rgba(232,93,60,0.3)',
  },
  ghost: {
    background: 'transparent',
    border: `1px solid ${T.border}`,
    color: T.text,
    boxShadow: 'none',
  },
} as const;

export const CARD = {
  background: T.white,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
  boxShadow: '0 1px 0 rgba(255,255,255,1) inset, 0 4px 16px rgba(45,55,72,0.06), 0 1px 3px rgba(45,55,72,0.04)',
} as const;
