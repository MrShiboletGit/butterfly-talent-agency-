import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GROUPS, PLATFORM_META, PLATFORMS, ROSTER, fmtK, type Platform, type Talent } from '../data';
import { usePicked } from '../picked';
import { ScrollTrigger, gsap, useA11y, useGsap } from '../a11y';
import { PlusIcon, SearchIcon } from './icons';
import { TalentPhoto } from './chrome';

type SortKey = 'total' | Platform;
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'total', label: 'סה״כ עוקבים' },
  ...PLATFORMS.map((p) => ({ key: p, label: PLATFORM_META[p].label })),
];

const countFor = (t: Talent, sort: SortKey) => (sort === 'total' ? t.total : t.pf[sort]);

function TalentCard({ t, sort, visible }: { t: Talent; sort: SortKey; visible: boolean }) {
  const location = useLocation();
  const { has, toggle } = usePicked();
  const { motionOK, finePointer } = useA11y();
  const picked = has(t.id);
  const sum = PLATFORMS.reduce((s, p) => s + t.pf[p], 0) || 1;
  const n = countFor(t, sort);
  const tilt = finePointer && motionOK;

  return (
    <article className="card" data-id={t.id} hidden={!visible}>
      <div
        className="card-in"
        onPointerMove={
          tilt
            ? (e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                el.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
                el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
                el.style.setProperty('--mx', `${x * 100}%`);
                el.style.setProperty('--my', `${y * 100}%`);
              }
            : undefined
        }
        onPointerLeave={
          tilt
            ? (e) => {
                e.currentTarget.style.setProperty('--rx', '0deg');
                e.currentTarget.style.setProperty('--ry', '0deg');
              }
            : undefined
        }
      >
        <TalentPhoto t={t} alt="" loading="lazy" />
        {/* Opens the profile over the page; the URL is the talent's own, so it can be shared. */}
        <Link className="card-open" to={`/talent/${t.id}`} state={{ bg: location }} aria-label={`הפרופיל של ${t.name}`} />
        {t.cat && <span className="cat">{t.cat}</span>}
        <button
          className="add"
          type="button"
          aria-pressed={picked}
          aria-label={picked ? `הסרת ${t.name} מההרכב` : `הוספת ${t.name} להרכב`}
          onClick={(e) => {
            toggle(t.id);
            if (!picked && motionOK)
              gsap.fromTo(e.currentTarget, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,.4)', clearProps: 'transform' });
          }}
        >
          <PlusIcon />
        </button>
        <div className="meta">
          <h3>{t.name}</h3>
          <span className="sub">{t.sub}</span>
          <div className="num">
            <b dir="ltr">{fmtK(n)}</b>
            <small>{sort === 'total' ? 'עוקבים' : `ב-${PLATFORM_META[sort].label}`}</small>
          </div>
          <div className="split" aria-hidden="true">
            {PLATFORMS.map((p) => (
              <i key={p} className={PLATFORM_META[p].cls} style={{ '--w': t.pf[p] / sum } as CSSProperties} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TalentsSection({ withSearch = false, asPage = false }: { withSearch?: boolean; asPage?: boolean }) {
  const { motionOK } = useA11y();
  const [group, setGroup] = useState('all');
  const [sort, setSort] = useState<SortKey>('total');
  const [query, setQuery] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstRects = useRef<Map<string, DOMRect> | null>(null);

  const ordered = useMemo(() => [...ROSTER].sort((a, b) => countFor(b, sort) - countFor(a, sort)), [sort]);
  const test = GROUPS.find((g) => g.key === group)!.test;
  const q = query.trim().toLowerCase();
  const isVisible = (t: Talent) =>
    test(t) && (!q || `${t.name} ${t.sub} ${t.cat}`.toLowerCase().includes(q));
  const visibleCount = ordered.filter(isVisible).length;

  // FLIP: remember where every card sat, let React reorder, then slide each
  // card from its old spot. clearProps hands the transform back to CSS.
  const change = (apply: () => void) => {
    if (motionOK && gridRef.current) {
      const m = new Map<string, DOMRect>();
      gridRef.current.querySelectorAll<HTMLElement>('.card').forEach((el) => {
        // A card still waiting for its scroll entrance may be about to move into
        // view; finish it now or it would arrive invisible.
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: 'opacity,transform' });
        el.setAttribute('data-in', '');
        m.set(el.dataset.id!, el.getBoundingClientRect());
      });
      firstRects.current = m;
    }
    apply();
  };
  useLayoutEffect(() => {
    const first = firstRects.current;
    firstRects.current = null;
    if (!first || !gridRef.current) return;
    gridRef.current.querySelectorAll<HTMLElement>('.card:not([hidden])').forEach((el) => {
      const a = first.get(el.dataset.id!);
      const b = el.getBoundingClientRect();
      if (!a || !a.width) {
        gsap.fromTo(el, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', clearProps: 'opacity,transform' });
        return;
      }
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx || dy) gsap.fromTo(el, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.7, ease: 'power3.inOut', clearProps: 'transform' });
    });
    ScrollTrigger.refresh();
  }, [group, sort, q]);

  // Cards rise in as they scroll into view; their platform bars fill after.
  useGsap(
    sectionRef,
    () => {
      if (!asPage) {
        gsap.from('.sec-h > div > *', {
          y: 50, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out',
          scrollTrigger: { trigger: '.sec-h', start: 'top 85%', once: true },
        });
      }
      const cards = gsap.utils.toArray<HTMLElement>('.card');
      gsap.set(cards, { opacity: 0, y: 60 });
      ScrollTrigger.batch(cards, {
        start: 'top 95%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07, clearProps: 'opacity,transform' });
          (batch as HTMLElement[]).forEach((c) => setTimeout(() => c.setAttribute('data-in', ''), 300));
        },
      });
    },
    [],
  );
  useEffect(() => {
    if (!motionOK) gridRef.current?.querySelectorAll('.card').forEach((c) => c.setAttribute('data-in', ''));
  }, [motionOK]);

  return (
    <section className={asPage ? 'sub-sec' : 'sec'} id="talents" ref={sectionRef} style={asPage ? { paddingTop: 0 } : undefined}>
      <div className="wrap">
        {!asPage && (
          <div className="sec-h">
            <div>
              <span className="k" dir="ltr" style={{ textAlign: 'right' }}>
                Roster · {new Date().getFullYear()}
              </span>
              <h2>הטאלנטים שלנו</h2>
              <p>פגשו את המשפיענים המובילים שעובדים איתנו ויוצרים תוכן מדהים</p>
            </div>
          </div>
        )}
        <div className="tools" id="build" role="group" aria-label="סינון ומיון טאלנטים">
          {withSearch && (
            <div className="search">
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(e) => change(() => setQuery(e.target.value))}
                placeholder="חיפוש לפי שם או תחום"
                aria-label="חיפוש טאלנטים"
              />
            </div>
          )}
          <div className="tools" role="group" aria-label="סינון לפי תחום">
            {GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                className="chip"
                aria-pressed={group === g.key}
                onClick={() => change(() => setGroup(g.key))}
              >
                {g.label}
                <span className="c">{ROSTER.filter(g.test).length}</span>
              </button>
            ))}
          </div>
          <div className="sorter" role="group" aria-label="מיון">
            <span aria-hidden="true">מיון:</span>
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                className="chip"
                aria-pressed={sort === s.key}
                onClick={() => change(() => setSort(s.key))}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <p className="hint">
          לחצו על <b>+</b> כדי להוסיף טאלנט להרכב הקמפיין. טווח החשיפה מתעדכן מיד.
        </p>
        <p className="sr-only" aria-live="polite">
          {`מוצגים ${visibleCount} טאלנטים`}
        </p>
        <div className="talents" ref={gridRef}>
          {ordered.map((t) => (
            <TalentCard key={t.id} t={t} sort={sort} visible={isVisible(t)} />
          ))}
        </div>
        {visibleCount === 0 && <p className="empty-state">לא נמצאו טאלנטים התואמים את החיפוש</p>}
      </div>
    </section>
  );
}
