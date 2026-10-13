import { useEffect } from 'react';

export const SITE_TITLE = 'Butterfly Talent Agency - סוכנות המשפיענים המובילה בישראל';

/**
 * Keep the tab title in step with the page during in-app navigation.
 *
 * scripts/prerender-meta.mjs bakes each detail page's title into its static HTML
 * for link previews. Without this, landing directly on one talent and clicking
 * through to another would leave the first talent's name in the tab. The format
 * must match the one prerender-meta.mjs writes.
 */
export function usePageTitle(name?: string) {
  useEffect(() => {
    document.title = name ? `${name} | Butterfly Talent Agency` : SITE_TITLE;
    return () => {
      document.title = SITE_TITLE;
    };
  }, [name]);
}
