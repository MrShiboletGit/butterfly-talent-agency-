/** The frame around every v2 page: nav, footer, the lineup dock and the accessibility menu. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CONTACT, PLATFORMS, fmtFull, fmtK, sumPF, whatsappUrl, type Client, type PlatformCounts } from '../data';
import { usePicked } from '../picked';
import { countTo, useA11y, type A11ySettings } from '../a11y';
import { AccessibilityIcon, ArrowBack, ButterflyMark } from './icons';

const HOME_SECTIONS = ['talents', 'clients', 'services', 'contact'] as const;

const NAV_ITEMS: { label: string; to: string; key: string }[] = [
  { label: 'טאלנטים', to: '/#talents', key: 'talents' },
  { label: 'קמפיינים', to: '/campaigns', key: 'campaigns' },
  { label: 'לקוחות', to: '/#clients', key: 'clients' },
  { label: 'שירותים', to: '/#services', key: 'services' },
  { label: 'צור קשר', to: '/#contact', key: 'contact' },
];

function sectionForPath(pathname: string) {
  if (/^\/talents?(\/|$)/.test(pathname)) return 'talents';
  if (/^\/campaigns?(\/|$)/.test(pathname)) return 'campaigns';
  if (/^\/clients?(\/|$)/.test(pathname)) return 'clients';
  if (pathname === '/contact') return 'contact';
  return null;
}

export function Nav() {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [spy, setSpy] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 30);
      if (!isHome) return;
      let cur: string | null = null;
      for (const id of HOME_SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = id;
      }
      setSpy(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Close the mobile menu on navigation, on Escape and on a tap outside it.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => !navRef.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const current = isHome ? spy : sectionForPath(pathname);

  return (
    <nav ref={navRef} className={`nav${solid ? ' solid' : ''}${open ? ' menu' : ''}`} aria-label="ניווט ראשי">
      <div className="wrap">
        <Link className="brand" to="/" aria-label="Butterfly Talent Agency, לדף הבית">
          <ButterflyMark />
          <span>
            Butterfly<small>TALENT AGENCY</small>
          </span>
        </Link>
        <ul id="v2-menu">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <Link to={item.to} aria-current={current === item.key ? 'page' : undefined} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link className="btn btn-hot" to="/#contact">
          בואו נדבר
        </Link>
        <button
          className="burger"
          type="button"
          aria-label={open ? 'סגירת תפריט' : 'פתיחת תפריט'}
          aria-expanded={open}
          aria-controls="v2-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
        </button>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <Link className="brand" to="/" aria-label="Butterfly Talent Agency, לדף הבית">
              <ButterflyMark />
              <span>
                Butterfly<small>TALENT AGENCY</small>
              </span>
            </Link>
            <p>סוכנות הטאלנטים המובילה בישראל למשפיעני רשת</p>
          </div>
          <div>
            <h4>קישורים מהירים</h4>
            <ul>
              <li><Link to="/#talents">טאלנטים</Link></li>
              <li><Link to="/campaigns">קמפיינים</Link></li>
              <li><Link to="/clients">לקוחות</Link></li>
              <li><Link to="/#contact">צור קשר</Link></li>
              <li><Link to="/accessibility">הצהרת נגישות</Link></li>
              <li><Link to="/privacy">מדיניות פרטיות</Link></li>
            </ul>
          </div>
          <div>
            <h4>עקבו ודברו איתנו</h4>
            <ul>
              <li><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href={`mailto:${CONTACT.email}`} dir="ltr">{CONTACT.email}</a></li>
              <li><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" dir="ltr">{CONTACT.phoneDisplay}</a></li>
            </ul>
          </div>
        </div>
        <div className="mega" aria-hidden="true">Butterfly</div>
        <div className="copy-r">
          <span>
            © <bdi dir="ltr">{new Date().getFullYear()}</bdi> Butterfly Talent Agency. כל הזכויות שמורות.
          </span>
          <span className="mono">TLV · IL</span>
        </div>
      </div>
    </footer>
  );
}

export function SplitBar({ pf, className = 'split' }: { pf: PlatformCounts; className?: string }) {
  const total = PLATFORMS.reduce((s, p) => s + pf[p], 0) || 1;
  return (
    <div className={className} aria-hidden="true">
      <i className="y" style={{ flexGrow: pf.youtube / total }} />
      <i className="g" style={{ flexGrow: pf.instagram / total }} />
      <i className="k" style={{ flexGrow: pf.tiktok / total }} />
    </div>
  );
}

export function Dock() {
  const { talents, clear } = usePicked();
  const { motionOK } = useA11y();
  const { pathname } = useLocation();
  const numRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [formInView, setFormInView] = useState(false);
  const reach = sumPF(talents);
  // The dock exists to lead to the contact form, so it steps aside once the form
  // is on screen instead of covering its fields.
  const show = talents.length > 0 && !formInView;

  useEffect(() => {
    const form = document.getElementById('contact');
    setFormInView(false);
    if (!form) return;
    const io = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(form);
    return () => io.disconnect();
  }, [pathname]);

  // Lifts the accessibility button above the dock while the dock is up.
  useEffect(() => {
    dockRef.current?.closest('.v2')?.classList.toggle('has-dock', show);
  }, [show]);

  useEffect(() => {
    const tween = countTo(numRef.current, reach.total, { duration: 0.8, format: fmtFull, motionOK });
    return () => {
      tween?.kill();
    };
  }, [reach.total, motionOK]);

  return (
    <>
      <div ref={dockRef} className={`dock${show ? ' show' : ''}`} role="region" aria-label="הרכב הקמפיין" aria-hidden={!show}>
        <div className="faces">
          {talents.slice(0, 5).map((t) => (
            <img key={t.id} src={t.img} alt="" />
          ))}
        </div>
        <div className="dock-txt">
          <b ref={numRef} dir="ltr">0</b>
          <small>{talents.length} טאלנטים · עוקבים משולב</small>
        </div>
        <SplitBar pf={reach} />
        <Link className="btn btn-hot" to="/#contact" tabIndex={show ? undefined : -1}>
          שליחת ההרכב
        </Link>
        <button className="dock-x" type="button" onClick={clear} aria-label="ניקוי ההרכב" tabIndex={show ? undefined : -1}>
          ×
        </button>
      </div>
      {/* One calm announcement per change, instead of the counter's every frame. */}
      <p className="sr-only" aria-live="polite">
        {show ? `${talents.length} טאלנטים בהרכב, טווח חשיפה ${fmtK(reach.total)} עוקבים` : ''}
      </p>
    </>
  );
}

const A11Y_OPTIONS: { key: keyof A11ySettings; label: string }[] = [
  { key: 'largeText', label: 'הגדלת טקסט' },
  { key: 'highContrast', label: 'ניגודיות גבוהה' },
  { key: 'grayscale', label: 'גווני אפור' },
  { key: 'highlightLinks', label: 'הדגשת קישורים' },
  { key: 'readableFont', label: 'גופן קריא' },
  { key: 'stopMotion', label: 'עצירת אנימציות' },
  { key: 'strongFocus', label: 'מחוון מיקוד מודגש' },
];

export function A11yWidget() {
  const { settings, toggle, reset } = useA11y();
  const [open, setOpen] = useState(false);
  const [announce, setAnnounce] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      btnRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        className="a11y-btn"
        type="button"
        aria-label="תפריט נגישות"
        aria-expanded={open}
        aria-controls="v2-a11y"
        onClick={() => setOpen((o) => !o)}
      >
        <AccessibilityIcon />
      </button>
      {open && (
        <div ref={panelRef} id="v2-a11y" className="a11y-panel" role="dialog" aria-labelledby="v2-a11y-title">
          <h2 id="v2-a11y-title">הגדרות נגישות</h2>
          <div className="a11y-opts">
            {A11Y_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className="a11y-opt"
                aria-pressed={settings[key]}
                onClick={() => {
                  toggle(key);
                  setAnnounce(`${label} ${settings[key] ? 'כובה' : 'הופעל'}`);
                }}
              >
                <span>{label}</span>
                <small aria-hidden="true">{settings[key] ? 'פועל' : 'כבוי'}</small>
              </button>
            ))}
          </div>
          <div className="a11y-foot">
            <Link to="/accessibility" onClick={() => setOpen(false)}>
              הצהרת נגישות
            </Link>
            <button
              type="button"
              onClick={() => {
                reset();
                setAnnounce('הגדרות הנגישות אופסו');
              }}
            >
              איפוס הגדרות
            </button>
          </div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </>
  );
}

/** A client logo on its white tile, falling back to the name when a remote logo is gone. */
export function ClientLogo({ client }: { client: Client }) {
  const [failed, setFailed] = useState(false);
  if (failed || !client.logo) return <span className="logo-name">{client.name}</span>;
  return <img src={client.logo} alt={client.name} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

export function PageHeader({
  eyebrow,
  title,
  children,
  back,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  back?: { to: string; label: string };
}) {
  return (
    <header className="page-h">
      <div className="wrap">
        {back && (
          <Link className="crumb" to={back.to}>
            <ArrowBack />
            {back.label}
          </Link>
        )}
        <span className="k">{eyebrow}</span>
        <h1>{title}</h1>
        {children}
      </div>
    </header>
  );
}

export function CtaBand({ title, text }: { title: string; text?: string }) {
  return (
    <section className="cta-band">
      <div className="wrap">
        <div className="cta-in">
          <h2>{title}</h2>
          <p>{text ?? 'בואו ניצור יחד את הקמפיין הבא שלכם עם המשפיענים הטובים ביותר בישראל'}</p>
          <div className="cta-row">
            <Link className="btn btn-hot" to="/#contact">
              צרו קשר עכשיו
            </Link>
            <a className="btn btn-ghost" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              וואטסאפ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
