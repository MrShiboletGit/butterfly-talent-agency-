import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PLATFORM_META, PLATFORMS, fmtFull, parseAge, parseGender, type Talent } from '../data';
import { usePicked } from '../picked';
import { countTo, useA11y } from '../a11y';
import { PlatformIcon } from './icons';

const AGE_LO = 8;
const AGE_HI = 48;
const agePos = (v: number) => ((Math.min(AGE_HI, Math.max(AGE_LO, v)) - AGE_LO) / (AGE_HI - AGE_LO)) * 100;

/**
 * Everything about one talent: bio, reach per platform, audience and the actions.
 * Used in the quick-view dialog over the roster and on the talent's own page.
 */
export default function ProfileBody({
  t,
  headingLevel = 'h2',
  inDialog = false,
}: {
  t: Talent;
  headingLevel?: 'h1' | 'h2';
  /** In the quick-view dialog: links lead on to the full page, and leaving replaces the dialog's history entry. */
  inDialog?: boolean;
}) {
  const { has, toggle } = usePicked();
  const { motionOK } = useA11y();
  const navigate = useNavigate();
  const totalRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const picked = has(t.id);
  const max = Math.max(1, ...PLATFORMS.map((p) => t.pf[p]));
  const age = parseAge(t.age);
  const gender = parseGender(t.gender);
  const Name = headingLevel;

  // Count the total up and grow the bars once the profile is on screen.
  useEffect(() => {
    const tween = countTo(totalRef.current, t.total, { from: 0, duration: 1.3, format: fmtFull, motionOK });
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        barsRef.current?.querySelectorAll<HTMLElement>('i[data-w]').forEach((i) => (i.style.width = `${i.dataset.w}%`)),
      ),
    );
    return () => {
      tween?.kill();
      cancelAnimationFrame(raf);
    };
  }, [t.id, t.total, motionOK]);

  return (
    <div className="pro-body">
      <div>
        {t.cat && (
          <span className="eyebrow" style={{ fontSize: '.6875rem' }}>
            {t.cat}
          </span>
        )}
        <Name className="pro-name" id={`pro-name-${t.id}`}>
          {t.name}
        </Name>
        {t.sub && <span className="sub">{t.sub}</span>}
      </div>
      {t.bio && <p className="bio">{t.bio}</p>}
      <div className="blk">
        <h3>סה"כ עוקבים</h3>
        <div className="big-total" dir="ltr" ref={totalRef}>
          {motionOK ? '0' : fmtFull(t.total)}
        </div>
      </div>
      <div className="blk">
        <h3>פירוט לפי פלטפורמה</h3>
        <div className="bars" ref={barsRef}>
          {PLATFORMS.filter((p) => t.pf[p] > 0).map((p) => {
            const meta = PLATFORM_META[p];
            const url = t.social[p];
            return (
              <div className="bar" key={p}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: meta.color }} aria-label={`${t.name} ב-${meta.label} (נפתח בחלון חדש)`}>
                    <PlatformIcon platform={p} width={14} height={14} />
                    <span>{meta.label}</span>
                  </a>
                ) : (
                  <span>{meta.label}</span>
                )}
                <div className="bar-t" aria-hidden="true">
                  <i data-w={(t.pf[p] / max) * 100} style={{ background: meta.color }} />
                </div>
                <b dir="ltr">{fmtFull(t.pf[p])}</b>
              </div>
            );
          })}
        </div>
      </div>
      {(age || gender) && (
        <div className="two">
          {age && (
            <div className="blk">
              <h3>
                גילאי הקהל · <bdi dir="ltr">{t.age}</bdi>
              </h3>
              <div className="age" dir="ltr" aria-hidden="true">
                <div className="rail" />
                <div className="band" style={{ left: `${agePos(age[0])}%`, width: `${agePos(age[1]) - agePos(age[0])}%` }} />
                <div className="ticks">
                  {[10, 20, 30, 40].map((v) => (
                    <span key={v} style={{ left: `${agePos(v)}%` }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {gender && (
            <div className="blk">
              <h3>מגדר</h3>
              <div className="gender" aria-hidden="true">
                <i style={{ flex: gender.male, background: 'var(--lilac)' }} />
                <i style={{ flex: gender.female, background: 'var(--peach)' }} />
              </div>
              <div className="gender-l">
                <span>
                  גברים <bdi dir="ltr">{gender.male}%</bdi>
                </span>
                <span>
                  נשים <bdi dir="ltr">{gender.female}%</bdi>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {t.tags.length > 0 && (
        <div className="blk">
          <h3>תחומי התמחות</h3>
          <div className="tags" dir="ltr">
            {t.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      )}
      <div className="pro-cta">
        <button
          className="btn btn-hot"
          type="button"
          onClick={() => {
            toggle(t.id, true);
            navigate('/#contact', { replace: inDialog });
          }}
        >
          התעניינות בשיתוף פעולה
        </button>
        <button className="btn btn-ghost" type="button" aria-pressed={picked} onClick={() => toggle(t.id)}>
          {picked ? 'בהרכב ✓' : 'הוספה להרכב +'}
        </button>
        {inDialog && (
          <Link className="pro-more" to={`/talent/${t.id}`} replace>
            לעמוד המלא
          </Link>
        )}
      </div>
    </div>
  );
}
