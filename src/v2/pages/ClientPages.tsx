import { useParams } from 'react-router-dom';
import { CAMPAIGNS, clientById } from '../data';
import { CampaignCard } from '../components/Campaigns';
import { ClientLogo, CtaBand, PageHeader } from '../components/chrome';
import { usePageTitle } from '@/hooks/usePageTitle';
import NotFound from './NotFound';

/** A client's campaigns. Reached from a campaign page; v2 has no list of all clients. */
export function ClientPage() {
  const { id = '' } = useParams();
  const client = clientById(id);
  usePageTitle(client ? client.name : 'לקוח לא נמצא');
  if (!client) return <NotFound title="לקוח לא נמצא" />;
  const campaigns = CAMPAIGNS.filter((c) => c.clientId === client.id);

  return (
    <>
      <PageHeader eyebrow="Client" title={client.name} back={{ to: '/campaigns', label: 'לכל הקמפיינים' }}>
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
