import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import clientsData from '../data/clients.json';
import campaignsData from '../data/campaigns.json';
import { getImageUrl } from '../utils/imageUtils';

const ClientsPage = () => {
  const getClientCampaigns = (clientId: string) => {
    return campaignsData.filter(campaign => campaign.clientId === clientId);
  };

  const getTotalViews = (clientId: string) => {
    const clientCampaigns = getClientCampaigns(clientId);
    return clientCampaigns.reduce((total, campaign) => total + campaign.kpis.views, 0);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-purple-500/10 via-pink-400/8 to-blue-500/10">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                הלקוחות שלנו
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                מותגים מובילים שבחרו לעבוד איתנו על קמפיינים דיגיטליים מוצלחים. כל לקוח מספר סיפור של שיתוף פעולה, יצירתיות ותוצאות מדהימות.
              </p>
            </div>
          </div>
        </section>

        {/* Clients Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clientsData.map((client) => {
                const clientCampaigns = getClientCampaigns(client.id);
                const totalViews = getTotalViews(client.id);
                
                return (
                  <Link 
                    key={client.id} 
                    to={`/client/${client.id}`}
                    className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-center mb-6">
                        <img 
                          src={getImageUrl(client.logoUrl)} 
                          alt={client.name}
                          className="h-20 w-auto max-w-full object-contain"
                        />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-4 text-center">
                        {client.name}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="font-medium text-gray-700">קמפיינים:</span>
                          <span>{clientCampaigns.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="font-medium text-gray-700">סה"כ צפיות:</span>
                          <span>{formatNumber(totalViews)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <span className="text-primary text-sm font-medium group-hover:underline">
                            צפה בפרטים
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              רוצים להיות הלקוח הבא שלנו?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              בואו ניצור יחד את הקמפיין הבא שלכם עם המשפיענים הטובים ביותר בישראל
            </p>
            <Link to="/contact" className="butterfly-button-secondary text-lg px-8 py-4">
              צרו קשר עכשיו
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ClientsPage; 