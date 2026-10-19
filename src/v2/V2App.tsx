import { Component, useEffect, useRef, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigationType, type Location } from 'react-router-dom';
import './v2.css';
import { whatsappUrl } from './data';
import { A11yProvider, useMotionOK } from './a11y';
import { PickedProvider } from './picked';
import { A11yWidget, Dock, Footer, Nav } from './components/chrome';
import Home from './pages/Home';
import { ProfileDialog, TalentPage, TalentsPage } from './pages/TalentPages';
import { CampaignPage, CampaignsPage } from './pages/CampaignPages';
import { ClientPage } from './pages/ClientPages';
import { AccessibilityPage, PrivacyPage, TermsPage } from './pages/Legal';
import NotFound, { ContactPage } from './pages/NotFound';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Hebrew:wght@300;400;500;700&family=Karantina:wght@400;700&display=swap';

function useDocumentSetup() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('v2-html');

    if (!document.querySelector(`link[href="${FONTS_HREF}"]`)) {
      for (const [rel, href, cross] of [
        ['preconnect', 'https://fonts.googleapis.com', false],
        ['preconnect', 'https://fonts.gstatic.com', true],
        ['stylesheet', FONTS_HREF, false],
      ] as const) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (cross) link.crossOrigin = '';
        document.head.appendChild(link);
      }
    }

    // While v2 is a preview under /v2 it must stay out of search results. Once it
    // serves the bare domain this no longer matches, and the page is indexable.
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const before = robots?.content;
    if (robots && window.location.pathname.startsWith('/v2')) robots.content = 'noindex, nofollow';

    return () => {
      root.classList.remove('v2-html');
      if (robots && before) robots.content = before;
    };
  }, []);
}

/**
 * Focus follows the scroll: keyboard and screen-reader users land on the section
 * or page they asked for instead of staying on the link. Prefers the section's
 * heading, which names where they are; neither is a control, so -1 keeps them out
 * of the Tab order.
 */
function focusTarget(el: HTMLElement | null) {
  if (!el) return;
  const target = el.matches('h1, h2') ? el : el.querySelector<HTMLElement>('h1, h2') ?? el;
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

/**
 * New pages start at the top, and /#section links scroll to their section, even
 * when they arrive from another page. Back/Forward and the profile dialog
 * opening or closing leave the scroll position alone.
 */
function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const motionOK = useMotionOK();
  const overlay = Boolean((location.state as { bg?: Location } | null)?.bg);
  const first = useRef(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const initial = first.current;
    const samePage = !initial && prevPath.current === location.pathname;
    first.current = false;
    prevPath.current = location.pathname;
    // Closing a profile in place returns to the page exactly where it was.
    if (overlay || (location.state as { keepScroll?: boolean } | null)?.keepScroll) return;
    // A page opened straight at /#section is a POP too, but nothing scrolled it:
    // the browser looked for the section before React had rendered it.
    if (navType === 'POP' && !(initial && location.hash)) return;
    if (!location.hash) {
      window.scrollTo(0, 0);
      // A new page: start reading from its top, as a full page load would.
      if (!initial) focusTarget(document.getElementById('main'));
      return;
    }
    // A truncated or hand-typed hash ("#%") makes decodeURIComponent throw.
    let id = location.hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      /* use it as typed */
    }
    const go = (smooth: boolean) => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      if (!initial) focusTarget(el);
    };

    let cancelled = false;
    // Glide within a page; arriving from another page, jump straight there.
    const raf = initial ? 0 : requestAnimationFrame(() => go(motionOK && samePage));

    // While the page is still loading, ScrollTrigger re-measures it on the load
    // event and late fonts shift the layout, either of which can leave the section
    // off target. Settle on it once more then, unless the visitor took over.
    const stop = () => (cancelled = true);
    const settle = () => document.fonts.ready.then(() => requestAnimationFrame(() => !cancelled && go(false)));
    if (document.readyState === 'complete') {
      if (initial) settle();
    } else {
      window.addEventListener('load', settle, { once: true });
      for (const ev of ['wheel', 'touchstart', 'keydown'] as const) window.addEventListener(ev, stop, { once: true, passive: true });
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('load', settle);
      for (const ev of ['wheel', 'touchstart', 'keydown'] as const) window.removeEventListener(ev, stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return null;
}

/**
 * A page that throws (most likely on malformed data) shows a short message with
 * the way out, instead of blanking the whole site. Resets when the visitor moves on.
 */
class PageBoundary extends Component<{ resetKey: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('v2 page failed to render:', error);
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <header className="page-h">
        <div className="wrap">
          <h1>משהו השתבש בטעינת הדף</h1>
          <p>אפשר לחזור לדף הבית, או לכתוב לנו ישירות.</p>
          <div className="cta-row" style={{ marginTop: 24 }}>
            <a className="btn btn-hot" href="/">
              לדף הבית
            </a>
            <a className="btn btn-ghost" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              וואטסאפ
            </a>
          </div>
        </div>
      </header>
    );
  }
}

function Shell({ children }: { children: ReactNode }) {
  useDocumentSetup();
  const { pathname } = useLocation();
  return (
    <div className="v2" dir="rtl" lang="he">
      <a className="skip" href="#main">
        דלג לתוכן הראשי
      </a>
      {/* Early in the Tab order, so the way to stop the motion or enlarge the text
          is a few keystrokes away rather than seventy. It sits fixed in a corner,
          so its place in the DOM doesn't move it on screen. */}
      <A11yWidget />
      <ScrollManager />
      <Nav />
      <main id="main" tabIndex={-1}>
        <PageBoundary resetKey={pathname}>{children}</PageBoundary>
      </main>
      <Footer />
      <Dock />
    </div>
  );
}

export default function V2App({ adminPanel }: { adminPanel: ReactNode }) {
  const location = useLocation();
  // A talent opened from the roster renders over the page it was opened from.
  const bg = (location.state as { bg?: Location } | null)?.bg;

  // The admin panel keeps its own look, whichever version serves the domain.
  if (location.pathname.replace(/\/+$/, '') === '/panel') return <>{adminPanel}</>;

  return (
    <A11yProvider>
      <PickedProvider>
        <Shell>
          <Routes location={bg || location}>
            <Route path="/" element={<Home />} />
            <Route path="/talents" element={<TalentsPage />} />
            <Route path="/talent/:id" element={<TalentPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaign/:id" element={<CampaignPage />} />
            {/* No list of all clients in v2; old links land on the logo strip instead. */}
            <Route path="/clients" element={<Navigate to={{ pathname: '/', hash: '#clients' }} replace />} />
            <Route path="/client/:id" element={<ClientPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {bg && (
            <Routes>
              <Route path="/talent/:id" element={<ProfileDialog />} />
            </Routes>
          )}
        </Shell>
      </PickedProvider>
    </A11yProvider>
  );
}
