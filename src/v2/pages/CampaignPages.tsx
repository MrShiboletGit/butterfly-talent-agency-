import { Link, useParams } from 'react-router-dom';
import { CAMPAIGNS, PLATFORM_META, campaignById, clientById, fmtK, talentById, type Talent } from '../data';
import { CampaignCard, ContentCard } from '../components/Campaigns';
import { ClientLogo, CtaBand, PageHeader, TalentPhoto } from '../components/chrome';
import { usePageTitle } from '@/hooks/usePageTitle';
import NotFound from './NotFound';

export function CampaignsPage() {
  usePageTitle('הקמפיינים שלנו');
  const totalViews = CAMPAIGNS.reduce((s, c) => s + (c.kpis?.views || 0), 0);
  // Counted from what still exists, so deleted talents and clients drop out.
  const brands = new Set(CAMPAIGNS.map((c) => c.clientId).filter((id) => clientById(id))).size;
  const talents = new Set(CAMPAIGNS.flatMap((c) => c.talents).filter((id) => talentById(id))).size;
  return (
    <>
      <PageHeader eyebrow="Campaigns" title="הקמפיינים שלנו">
        <p>
          קמפיינים מוצלחים שיצרנו עם הלקוחות והטאלנטים שלנו. כל קמפיין מספר סיפור של שיתוף פעולה, יצירתיות ותוצאות מדהימות.
        </p>
      </PageHeader>
      <section className="sub-sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="kpis" style={{ marginBottom: 32 }}>
            <div className="kpi"><b dir="ltr">{fmtK(totalViews)}</b><span>צפיות בסך הכל</span></div>
            <div className="kpi"><b dir="ltr">{CAMPAIGNS.length}</b><span>קמפיינים</span></div>
            <div className="kpi"><b dir="ltr">{brands}</b><span>מותגים</span></div>
            <div className="kpi"><b dir="ltr">{talents}</b><span>טאלנטים שהשתתפו</span></div>
          </div>
          <h2 className="sr-only">כל הקמפיינים</h2>
          <div className="camp-grid">
            {CAMPAIGNS.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="רוצים ליצור קמפיין דומה?" />
    </>
  );
}

export function CampaignPage() {
  const { id = '' } = useParams();
  const c = campaignById(id);
  usePageTitle(c ? c.title : 'קמפיין לא נמצא');
  if (!c) return <NotFound title="קמפיין לא נמצא" />;
  const client = clientById(c.clientId);
  const talents = c.talents.map(talentById).filter(Boolean) as Talent[];
  const details = [
    ['מטרה', c.details?.objective],
    ['אסטרטגיה', c.details?.strategy],
    ['תוצאות', c.details?.results],
  ].filter(([, text]) => text) as [string, string][];
  const content = [...(c.content || [])].sort((a, b) => (b.views || 0) - (a.views || 0));

  return (
    <>
      <PageHeader eyebrow={c.category || 'Campaign'} title={c.title} back={{ to: '/campaigns', label: 'לכל הקמפיינים' }}>
        {c.description && <p>{c.description}</p>}
        {client && (
          <Link className="client-chip" to={`/client/${client.id}`}>
            <span>
              <ClientLogo client={client} />
            </span>
            <span>לקוח: {client.name}</span>
          </Link>
        )}
      </PageHeader>

      <section className="sub-sec" style={{ paddingTop: 0 }} aria-labelledby="kpi-h">
        <div className="wrap">
          <h2 id="kpi-h" className="sr-only">ביצועי הקמפיין</h2>
          <div className="kpis">
            <div className="kpi"><b dir="ltr">{fmtK(c.kpis.views)}</b><span>צפיות</span></div>
            {c.kpis.engagement ? (
              <div className="kpi"><b dir="ltr">{fmtK(c.kpis.engagement)}</b><span>מעורבות</span></div>
            ) : null}
            <div className="kpi"><b dir="ltr">{talents.length}</b><span>טאלנטים</span></div>
            <div className="kpi">
              <b dir="ltr">{c.platforms.length}</b>
              <span>פלטפורמות · {c.platforms.map((p) => PLATFORM_META[p]?.label ?? p).join(', ')}</span>
            </div>
          </div>
        </div>
      </section>

      {details.length > 0 && (
        <section className="sub-sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 className="sub-h">פרטי הקמפיין</h2>
            <div className="details">
              {details.map(([label, text]) => (
                <div className="detail" key={label}>
                  <h3>{label}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {content.length > 0 && (
        <section className="sub-sec">
          <div className="wrap">
            <h2 className="sub-h">תוכן הקמפיין</h2>
            <div className="content-grid">
              {content.map((item, i) => (
                <ContentCard key={`${i}-${item.url}`} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {talents.length > 0 && (
        <section className="sub-sec">
          <div className="wrap">
            <h2 className="sub-h">הטאלנטים שהשתתפו</h2>
            <div className="mini-grid">
              {talents.map((t) => (
                <Link key={t.id} className="mini" to={`/talent/${t.id}`}>
                  <TalentPhoto t={t} alt="" loading="lazy" />
                  <span>
                    <b>{t.name}</b>
                    <small>
                      {t.cat} · <bdi dir="ltr">{fmtK(t.total)}</bdi> עוקבים
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand title="רוצים ליצור קמפיין דומה?" />
    </>
  );
}
