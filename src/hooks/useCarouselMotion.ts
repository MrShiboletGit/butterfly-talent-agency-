import { useEffect, useState } from 'react';

/**
 * True when the visitor asked their OS to reduce motion. Carousels use this to
 * stop auto-advancing: the global reduced-motion CSS in index.css only shortens
 * transition durations, so without this the slides would still move on their own,
 * just instantly.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
}

/**
 * How many cards fit at the current width. A single 768px breakpoint left tablets
 * showing the full desktop count in a much narrower space, so the steps below add
 * intermediate tiers.
 */
export function cardsPerView(width: number, max: number): number {
  if (width < 640) return 1;
  if (width < 1024) return Math.min(2, max);
  if (width < 1280) return Math.min(3, max);
  return max;
}

/** Tailwind width class for a given cards-per-view. Written as literals so the Tailwind scanner keeps them. */
export const PER_VIEW_WIDTH: Record<number, string> = {
  1: 'w-full',
  2: 'w-1/2',
  3: 'w-1/3',
  4: 'w-1/4',
};

/** True while the tab is hidden, so carousels don't advance in a background tab. */
export function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);

  useEffect(() => {
    const onChange = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return hidden;
}
