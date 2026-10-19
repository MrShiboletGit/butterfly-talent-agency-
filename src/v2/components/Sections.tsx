import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CLIENTS, ROSTER, type Client } from '../data';
import { gsap, useA11y, useGsap } from '../a11y';
import { ClientLogo } from './chrome';

/** The talents' real specialty tags, scrolling past. Decorative, so hidden from screen readers. */
export function Ticker() {
  const { motionOK } = useA11y();
  const tags = [...new Set(ROSTER.flatMap((t) => t.tags))];
  // The loop needs two identical copies; a still row needs one.
  const items = motionOK ? [...tags, ...tags] : tags;
  return (
    <div className="ticker" aria-hidden="true" dir="ltr">
      <div className={`track${motionOK ? '' : ' still'}`}>
        {items.map((tag, i) => (
          <span key={i}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

// The narrowest a tile gets (phones: 140px + 16px spacing), so the estimate errs toward enough.
const MIN_TILE = 156;

/** A showcase only: the logos deliberately lead nowhere, there is no clients page in v2. */
function Lane({ clients, reverse }: { clients: Client[]; reverse?: boolean }) {
  const { motionOK } = useA11y();
  const [screen, setScreen] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setScreen(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // The loop slides one copy of the row out as an identical one slides in, so a
  // copy must be at least a screen wide or a gap opens at its end (as it did on
  // wide monitors). Repeat the logos until it is, and stretch the duration to match
  // so the speed doesn't change.
  if (!clients.length) return null;
  const reps = motionOK ? Math.max(1, Math.ceil((screen + 200) / (clients.length * MIN_TILE))) : 1;
  const copy = Array.from({ length: reps }, (_, r) => clients.map((c) => ({ c, r }))).flat();
  const duration = (reverse ? 70 : 60) * reps;

  return (
    <div
      className={`lane${reverse ? ' rev' : ''}${motionOK ? '' : ' still'}`}
      style={motionOK ? { animationDuration: `${duration}s` } : undefined}
    >
      {/* Screen readers get each logo once; every repeat is only there for the loop. */}
      {copy.map(({ c, r }) => (
        <span key={`a${r}-${c.id}`} className="logo-tile" aria-hidden={r > 0 || undefined}>
          <ClientLogo client={c} />
        </span>
      ))}
      {motionOK &&
        copy.map(({ c, r }) => (
          <span key={`b${r}-${c.id}`} className="logo-tile" aria-hidden="true">
            <ClientLogo client={c} />
          </span>
        ))}
    </div>
  );
}

export function ClientsMarquee() {
  const ref = useRef<HTMLElement>(null);
  const half = Math.ceil(CLIENTS.length / 2);
  useGsap(
    ref,
    () => {
      gsap.from('.sec-h > div > *', {
        y: 50, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out',
        scrollTrigger: { trigger: '.sec-h', start: 'top 85%', once: true },
      });
    },
    [],
  );
  return (
    <section className="sec" id="clients" ref={ref} style={{ paddingTop: 20 }}>
      <div className="wrap">
        <div className="sec-h">
          <div>
            <span className="k" lang="en">Clients</span>
            <h2>הלקוחות שלנו</h2>
            <p>מותגים מובילים שבחרו לעבוד איתנו</p>
          </div>
        </div>
      </div>
      <div className="clients fade-x" dir="ltr">
        <Lane clients={CLIENTS.slice(0, half)} />
        <Lane clients={CLIENTS.slice(half)} reverse />
      </div>
      <div className="center-row">
        <Link className="btn btn-ghost" to="/campaigns">
          קמפיינים נבחרים
        </Link>
      </div>
    </section>
  );
}

const SERVICES = [
  {
    title: 'ניהול קמפיינים',
    text: 'ניהול מקיף של קמפיינים משלב התכנון ועד לביצוע והמדידה',
    icon: (
      <>
        <rect x="8" y="12" width="48" height="40" rx="6" style={{ '--len': 180 } as React.CSSProperties} />
        <path d="M8 22h48" style={{ '--len': 50 } as React.CSSProperties} />
        <path d="M18 40l8-8 6 6 12-12" style={{ '--len': 60 } as React.CSSProperties} />
        <circle cx="44" cy="26" r="2" style={{ '--len': 14 } as React.CSSProperties} />
      </>
    ),
  },
  {
    title: 'אסטרטגיית תוכן',
    text: 'פיתוח אסטרטגיות תוכן מותאמות אישית לכל מותג ויעד',
    icon: (
      <>
        <path d="M14 50V20l18-8 18 8v30" style={{ '--len': 150 } as React.CSSProperties} />
        <path d="M24 50V34h16v16" style={{ '--len': 60 } as React.CSSProperties} />
        <path d="M32 12v-4M8 50h48" style={{ '--len': 60 } as React.CSSProperties} />
        <circle cx="32" cy="24" r="4" style={{ '--len': 26 } as React.CSSProperties} />
      </>
    ),
  },
  {
    title: 'ייעוץ מקצועי',
    text: 'ייעוץ מקצועי לבחירת המשפיענים המתאימים ביותר למותג שלכם',
    icon: (
      <>
        <circle cx="24" cy="24" r="10" style={{ '--len': 64 } as React.CSSProperties} />
        <path d="M8 52c2-9 8-14 16-14s14 5 16 14" style={{ '--len': 70 } as React.CSSProperties} />
        <path d="M42 20l4 4 8-8" style={{ '--len': 24 } as React.CSSProperties} />
        <path d="M40 34h14M44 42h10" style={{ '--len': 30 } as React.CSSProperties} />
      </>
    ),
  },
];

export function Services() {
  const ref = useRef<HTMLElement>(null);
  const { motionOK, finePointer } = useA11y();
  useGsap(
    ref,
    () => {
      gsap.from('.sec-h > div > *', {
        y: 50, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out',
        scrollTrigger: { trigger: '.sec-h', start: 'top 85%', once: true },
      });
      gsap.from('.svc', {
        y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.svc-grid', start: 'top 85%', once: true },
      });
    },
    [],
  );
  return (
    <section className="sec" id="services" ref={ref} style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="sec-h">
          <div>
            <span className="k" lang="en">Services</span>
            <h2>השירותים שלנו</h2>
            <p>אנחנו מציעים פתרונות שיווק מקיפים עם המשפיענים הטובים ביותר</p>
          </div>
        </div>
        <div className="svc-grid">
          {SERVICES.map((s) => (
            <article
              key={s.title}
              className="svc"
              onPointerMove={
                finePointer && motionOK
                  ? (e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
                    }
                  : undefined
              }
            >
              <svg viewBox="0 0 64 64" aria-hidden="true">
                {s.icon}
              </svg>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
