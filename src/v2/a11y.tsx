import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Run the timeline on wall-clock time, so a slow device finishes intros on time
// instead of stretching them out.
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger };

export interface A11ySettings {
  largeText: boolean;
  highContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  readableFont: boolean;
  stopMotion: boolean;
  strongFocus: boolean;
}

export const DEFAULT_A11Y: A11ySettings = {
  largeText: false,
  highContrast: false,
  grayscale: false,
  highlightLinks: false,
  readableFont: false,
  stopMotion: false,
  strongFocus: false,
};

// Each setting is a class on <html>, which v2.css reads. Filters must sit on the
// root element: anywhere lower they would re-anchor the fixed nav and dock.
const CLASS: Record<keyof A11ySettings, string> = {
  largeText: 'a11y-large',
  highContrast: 'a11y-contrast',
  grayscale: 'a11y-gray',
  highlightLinks: 'a11y-links',
  readableFont: 'a11y-font',
  stopMotion: 'a11y-still',
  strongFocus: 'a11y-focus',
};

const STORAGE_KEY = 'bf-v2-a11y';

function load(): A11ySettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') ?? {};
    // Only real booleans count, so a stray value can't switch a setting on.
    const settings = { ...DEFAULT_A11Y };
    for (const key of Object.keys(DEFAULT_A11Y) as (keyof A11ySettings)[]) if (saved[key] === true) settings[key] = true;
    return settings;
  } catch {
    return DEFAULT_A11Y;
  }
}

const reducedMotionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

interface A11yContextValue {
  settings: A11ySettings;
  toggle: (key: keyof A11ySettings) => void;
  reset: () => void;
  /** False when either the OS or the accessibility menu asks for no motion. */
  motionOK: boolean;
  /** A precise pointer that can hover: tilt and magnet effects only make sense there. */
  finePointer: boolean;
}

const A11yContext = createContext<A11yContextValue | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(load);
  const [osReduced, setOsReduced] = useState(() => reducedMotionQuery().matches);
  const [finePointer] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  useEffect(() => {
    const q = reducedMotionQuery();
    const onChange = () => setOsReduced(q.matches);
    q.addEventListener('change', onChange);
    return () => q.removeEventListener('change', onChange);
  }, []);

  const applied = useRef(false);
  useEffect(() => {
    const root = document.documentElement;
    for (const key of Object.keys(CLASS) as (keyof A11ySettings)[]) root.classList.toggle(CLASS[key], settings[key]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* private mode: settings just won't persist */
    }
    // Text size and fonts move every trigger point. Not on first load, where
    // ScrollTrigger measures anyway and a refresh would interrupt a /#section jump.
    if (applied.current) requestAnimationFrame(() => ScrollTrigger.refresh());
    applied.current = true;
  }, [settings]);

  useEffect(
    () => () => {
      // Leaving v2 (e.g. into the admin panel) shouldn't leave v2's classes behind.
      for (const cls of Object.values(CLASS)) document.documentElement.classList.remove(cls);
    },
    [],
  );

  const toggle = useCallback((key: keyof A11ySettings) => setSettings((s) => ({ ...s, [key]: !s[key] })), []);
  const reset = useCallback(() => setSettings(DEFAULT_A11Y), []);
  const motionOK = !osReduced && !settings.stopMotion;

  const value = useMemo(
    () => ({ settings, toggle, reset, motionOK, finePointer }),
    [settings, toggle, reset, motionOK, finePointer],
  );
  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used inside A11yProvider');
  return ctx;
}

export const useMotionOK = () => useA11y().motionOK;

/**
 * Run GSAP setup scoped to an element, only while motion is allowed. Reverting the
 * context on cleanup removes every inline style GSAP wrote, so turning motion off
 * mid-visit leaves content in its final, visible state rather than frozen mid-tween.
 */
export function useGsap(
  scope: React.RefObject<HTMLElement>,
  setup: (ctx: gsap.Context) => void,
  deps: React.DependencyList,
) {
  const motionOK = useMotionOK();
  useEffect(() => {
    if (!motionOK || !scope.current) return;
    const ctx = gsap.context((self) => setup(self), scope.current);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionOK, ...deps]);
}

/** Count a number up into an element's text. Instant when motion is off. */
export function countTo(
  el: HTMLElement | null,
  to: number,
  { from, duration = 1.6, format, motionOK }: { from?: number; duration?: number; format: (n: number) => string; motionOK: boolean },
) {
  if (!el) return;
  const start = from ?? (Number(el.dataset.v) || 0);
  el.dataset.v = String(to);
  if (!motionOK) {
    el.textContent = format(to);
    return;
  }
  const o = { v: start };
  return gsap.to(o, { v: to, duration, ease: 'power3.out', onUpdate: () => (el.textContent = format(o.v)) });
}
