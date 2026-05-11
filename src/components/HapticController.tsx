'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { tap, success, select, isHapticsEnabled } from '@/lib/haptics';

// Auto-instruments interactions on study pages with light haptic + tone
// feedback. Suppressed on marketing / auth / admin so it only happens
// where engagement matters.
//
// Heuristics for which event = which haptic:
//   - <button type="submit"> or [data-haptic="success"] → success()
//   - <input type="checkbox"|"radio"> → select()
//   - <button>, <a> with role/data-haptic, or inside study container → tap()
//
// Authors can opt a specific element out with `data-haptic="off"`.

const STUDY_PREFIXES = [
  '/course',
  '/free',
  '/flashcards',
  '/math',
  '/glossary',
  '/quizzes',
  '/tutor',
  '/practice',
];

function isStudyPath(pathname: string): boolean {
  return STUDY_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
}

function classify(target: Element | null): 'success' | 'select' | 'tap' | null {
  if (!target) return null;
  // Walk up to find an interactive ancestor (so clicks on inner spans still register)
  let el: Element | null = target;
  while (el && el !== document.body) {
    const dataHaptic = el.getAttribute?.('data-haptic');
    if (dataHaptic === 'off') return null;
    if (dataHaptic === 'success' || dataHaptic === 'select' || dataHaptic === 'tap') return dataHaptic;

    const tag = el.tagName;
    if (tag === 'BUTTON') {
      const type = (el as HTMLButtonElement).type;
      if (type === 'submit') return 'success';
      return 'tap';
    }
    if (tag === 'A') return 'tap';
    if (tag === 'INPUT') {
      const inputType = (el as HTMLInputElement).type;
      if (inputType === 'checkbox' || inputType === 'radio') return 'select';
      if (inputType === 'submit' || inputType === 'button') return 'tap';
    }
    if (tag === 'LABEL' || tag === 'SUMMARY') return 'tap';
    el = el.parentElement;
  }
  return null;
}

export function HapticController() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    if (!isStudyPath(pathname)) return;

    const onClick = (e: MouseEvent) => {
      // Respect global mute without re-reading on every keystroke
      if (!isHapticsEnabled()) return;
      const kind = classify(e.target as Element);
      if (kind === 'success') success();
      else if (kind === 'select') select();
      else if (kind === 'tap') tap();
    };

    // useCapture: true so we still fire even if the page handler stops propagation
    window.addEventListener('click', onClick, { capture: true, passive: true });
    return () => window.removeEventListener('click', onClick, { capture: true });
  }, [pathname]);

  return null;
}
