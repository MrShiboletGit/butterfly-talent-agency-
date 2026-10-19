import { Link, useParams } from 'react-router-dom';
import { CAMPAIGNS, CLIENTS, clientById } from '../data';
import { CampaignCard } from '../components/Campaigns';
import { ClientLogo, CtaBand, PageHeader } from '../components/chrome';
import { usePageTitle } from '@/hooks/usePageTitle';
import NotFound from './NotFound';

export function ClientsPage() {
  usePageTitle('הלקוחות שלנו');
  return (
    <>
      <PageHeader eyebrow="Clients" title="הלקוחות שלנו">
        <p>
          מותגים מובילים שבחרו לעבוד איתנו על קמפיינים דיגיטליים מוצלחים. כל לקוח מספר סיפור של שיתוף פעולה, יצירתיות ותוצאות מדהימות.
        </p>
      </PageHeader>
      <section className="sub-sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="client-grid">
            {CLIENTS.map((c) => (
              <Link key={c.id} className="client-card" to={`/client/${c.id}`}>
                <span className="logo-tile">
                  <ClientLogo client={c} />
                </span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="רוצים להיות הלקוח הבא שלנו?" />
    </>
  );
}

export function ClientPage() {
  const { id = '' } = useParams();
  const client = clientById(id);
  usePageTitle(client?.name);
  if (!client) return <NotFound title="לקוח לא נמצא" />;
  const campaigns = CAMPAIGNS.filter((c) => c.clientId === client.id);

  return (
    <>
      <PageHeader eyebrow="Client" title={client.name} back={{ to: '/clients', label: 'לכל הלקוחות' }}>
        <div className="client-hero" style={{ marginTop: 22 }}>
          <ClientLogo client={client} />
        </div>
        <p>לקוח מוביל שעובד איתנו על קמפיינים דיגיטליים מוצלחים</p>
      </PageHeader>
      {campaigns.length > 0 && (
        <section className="sub-sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 className="sub-h">קמפיינים נבחרים שלנו עבור {client.name}</h2>
            <div className="camp-grid">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} c={c} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand title="רוצים לעבוד איתנו?" />
    </>
  );
}
