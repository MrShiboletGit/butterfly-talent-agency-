import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ALL_TALENTS, type Talent } from './data';

/**
 * The campaign lineup a visitor builds with the + buttons. It follows them across
 * pages and visits, and the contact form sends it along with their details.
 */
const STORAGE_KEY = 'bf-picked';

interface PickedContextValue {
  ids: string[];
  talents: Talent[];
  has: (id: string) => boolean;
  toggle: (id: string, force?: boolean) => void;
  clear: () => void;
}

const PickedContext = createContext<PickedContextValue | null>(null);

const known = new Set(ALL_TALENTS.map((t) => t.id));

function load(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.map(String).filter((id) => known.has(id)) : [];
  } catch {
    return [];
  }
}

export function PickedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* private mode */
    }
  }, [ids]);

  const toggle = useCallback((id: string, force?: boolean) => {
    setIds((cur) => {
      const has = cur.includes(id);
      const on = force ?? !has;
      if (on && !has) return [...cur, id];
      if (!on && has) return cur.filter((x) => x !== id);
      return cur;
    });
  }, []);
  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(() => {
    const talents = ids.map((id) => ALL_TALENTS.find((t) => t.id === id)).filter(Boolean) as Talent[];
    return { ids, talents, has: (id: string) => ids.includes(id), toggle, clear };
  }, [ids, toggle, clear]);

  return <PickedContext.Provider value={value}>{children}</PickedContext.Provider>;
}

export function usePicked() {
  const ctx = useContext(PickedContext);
  if (!ctx) throw new Error('usePicked must be used inside PickedProvider');
  return ctx;
}
