'use client';

import { useState } from 'react';
import { T } from '@/lib/theme';

interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  // Reused by every password form so the toggle behavior + styling stay
  // consistent across signup / login / reset-password.
  style?: React.CSSProperties;
  id?: string;
}

export function PasswordInput({ value, onChange, placeholder, autoComplete, required, minLength, style, id }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        style={{ ...style, paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 36, height: 36,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: T.textMute,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 6,
          padding: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = T.text; }}
        onMouseLeave={e => { e.currentTarget.style.color = T.textMute; }}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a14.3 14.3 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61C3.86 8.31 2 12 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5.39-1.61" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}
