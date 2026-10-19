import { useLayoutEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CAMPAIGNS, talentById } from '../data';
import TalentsSection from '../components/TalentsSection';
import ProfileBody from '../components/Profile';
import { CampaignCard } from '../components/Campaigns';
import { CtaBand, PageHeader } from '../components/chrome';
import { ArrowBack } from '../components/icons';
import { usePageTitle } from '@/hooks/usePageTitle';
import NotFound from './NotFound';

export function TalentsPage() {
  usePageTitle('הטאלנטים שלנו');
  return (
    <>
      <PageHeader eyebrow="Roster" title="הטאלנטים שלנו">
        <p>פגשו את המשפיענים המובילים שעובדים איתנו ויוצרים תוכן מדהים</p>
      </PageHeader>
      <TalentsSection withSearch asPage />
    </>
  );
}

/** A talent's own page: what a shared link or a direct visit lands on. */
export function TalentPage() {
  const { id = '' } = useParams();
  const t = talentById(id);
  usePageTitle(t?.name);
  if (!t) return <NotFound title="המשפיען לא נמצא" />;
  const campaigns = CAMPAIGNS.filter((c) => c.talents?.includes(t.id));

  return (
    <>
      <section className="page-h" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <Link className="crumb" to="/#talents">
            <ArrowBack />
            חזרה לטאלנטים
          </Link>
          <div className="tp">
            <div className="tp-img">
              <img src={t.img} alt={t.name} />
            </div>
            <ProfileBody t={t} headingLevel="h1" />
          </div>
        </div>
      </section>
      {campaigns.length > 0 && (
        <section className="sub-sec">
          <div className="wrap">
            <h2 className="sub-h">הקמפיינים של {t.name}</h2>
            <div className="camp-grid">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} c={c} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand title={`רוצים לעבוד עם ${t.name}?`} />
    </>
  );
}

/**
 * The quick view that opens over the roster. It lives at the talent's own URL, so
 * Back closes it and the address can be shared; opened directly, the same URL
 * shows the full TalentPage instead.
 */
export function ProfileDialog() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const t = talentById(id);
  const ref = useRef<HTMLDialogElement>(null);
  usePageTitle(t?.name);

  // A layout effect, so the listener is gone before React removes the dialog when
  // the visitor navigates on from inside it (an unmount must not trigger Back).
  useLayoutEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    // The dialog unmounts rather than just closing, so the browser can't hand
    // focus back by itself; keyboard users return to the card they came from.
    const opener = document.activeElement as HTMLElement | null;
    if (!dlg.open) dlg.showModal();
    // Escape, the × and a backdrop click all close the dialog; closing goes Back.
    const onClose = () => navigate(-1);
    dlg.addEventListener('close', onClose);
    return () => {
      dlg.removeEventListener('close', onClose);
      requestAnimationFrame(() => opener?.isConnected && opener.focus({ preventScroll: true }));
    };
  }, [navigate, id]);

  if (!t) return null;
  return (
    <dialog
      ref={ref}
      className="pro-dlg"
      aria-labelledby={`pro-name-${t.id}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="pro">
        <button className="pro-x" type="button" aria-label="סגירה" onClick={() => ref.current?.close()}>
          ×
        </button>
        <div className="pro-img">
          <img src={t.img} alt={t.name} />
        </div>
        <ProfileBody t={t} inDialog />
      </div>
    </dialog>
  );
}
