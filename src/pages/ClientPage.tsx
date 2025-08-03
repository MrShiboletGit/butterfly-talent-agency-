import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Users, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import clientsData from '../data/clients.json';
import campaignsData from '../data/campaigns.json';
import talentsData from '../data/talents.json';

interface Client {
  id: string;
  name: string;
  logoUrl: string;
}

interface Campaign {
  id: string;
  title: string;
  clientId: string;
  description: string;
  imageUrl: string;
  category: string;
  kpis: {
    views: number;
    engagement?: number;
    shares?: number;
    reach?: number;
    impressions?: number;
  };
  talents: string[];
  platforms: string[];
  startDate: string;
  endDate: string;
  content: any[];
}

const ClientPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const client = clientsData.find(c => c.id === id) as Client;
  const clientCampaigns = campaignsData.filter(c => c.clientId === id);
  const clientTalentIds = [...new Set(clientCampaigns.flatMap(c => c.talents))];
  const clientTalents = talentsData.filter(t => clientTalentIds.includes(t.id));

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTotalViews = () => {
    return clientCampaigns.reduce((total, campaign) => total + campaign.kpis.views, 0);
  };

  const getTotalTalents = () => {
    const clientTalentIds = [...new Set(clientCampaigns.flatMap(c => c.talents))];
    return clientTalentIds.length;
  };

  const getClientName = (clientId: string) => {
    const client = clientsData.find(c => c.id === clientId);
    return client ? client.name : clientId;
  };

  if (!client) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">לקוח לא נמצא</h1>
          <Link to="/" className="text-primary hover:underline">
            חזרה לדף הבית
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {/* Back Button */}
        <div className="container mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            חזרה לדף הבית
          </Link>
        </div>

        {/* Hero Section */}
        <section className="relative py-12 bg-gradient-to-br from-purple-500/10 via-pink-400/8 to-blue-500/10">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="mb-8">
                <img 
                  src={client.logoUrl} 
                  alt={client.name}
                  className="w-32 h-32 mx-auto object-contain bg-white rounded-lg shadow-lg p-4"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {client.name}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                לקוח מוביל שעובד איתנו על קמפיינים דיגיטליים מוצלחים
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">סטטיסטיקות כלליות</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(getTotalViews())}
                </div>
                <div className="text-gray-600">סה"כ צפיות</div>
              </div>
              
                             <div className="text-center">
                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Users className="w-8 h-8 text-primary" />
                 </div>
                 <div className="text-3xl font-bold text-gray-900 mb-2">
                   {getTotalTalents()}
                 </div>
                 <div className="text-gray-600">טאלנטים</div>
               </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {clientCampaigns.length}
                </div>
                <div className="text-gray-600">קמפיינים</div>
              </div>
            </div>
          </div>
        </section>

        {/* Campaigns Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">הקמפיינים שלנו עבור {client.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clientCampaigns.map((campaign: Campaign) => (
                <Link 
                  key={campaign.id} 
                  to={`/campaign/${campaign.id}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative overflow-hidden bg-gray-50">
                    <div className="w-full h-48 flex items-center justify-center p-8">
                      <img 
                        src={clientsData.find(c => c.id === campaign.clientId)?.logoUrl || campaign.imageUrl} 
                        alt={getClientName(campaign.clientId)}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {campaign.category}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3">
                      {campaign.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                    
                    <div className="space-y-3">
                      {/* Views */}
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="w-4 h-4 ml-2" />
                        <span className="font-medium text-gray-700">צפיות:</span>
                        <span className="mr-2">{formatNumber(campaign.kpis.views)}</span>
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 ml-2" />
                        <span className="font-medium text-gray-700">תאריך:</span>
                        <span className="mr-2">
                          {new Date(campaign.startDate).toLocaleDateString('he-IL', { 
                            year: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2 space-x-reverse">
                          {campaign.platforms.slice(0, 2).map((platform) => (
                            <span 
                              key={platform}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {platform}
                            </span>
                          ))}
                          {campaign.platforms.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{campaign.platforms.length - 2}
                            </span>
                          )}
                        </div>
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Talents Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">הטאלנטים שעבדו עם {client.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clientTalents.map((talent) => (
                <Link 
                  key={talent.id}
                  to={`/talent/${talent.id}`}
                  className="bg-gray-50 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 group"
                >
                  <div className="flex items-center mb-4">
                    <img 
                      src={talent.imageUrl} 
                      alt={talent.name}
                      className="w-16 h-16 rounded-full object-cover ml-4"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {talent.name}
                      </h3>
                      <p className="text-gray-600">{talent.category}</p>
                    </div>
                  </div>
                                     <div className="flex items-center justify-between text-sm text-gray-500">
                     <span>{formatNumber(talent.totalFollowers)} עוקבים</span>
                     <span>{talent.category}</span>
                   </div>
                  
                  {/* Show campaigns this talent worked on with this client */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">קמפיינים:</span>
                      <div className="mt-2 space-y-1">
                        {clientCampaigns
                          .filter(campaign => campaign.talents.includes(talent.id))
                          .map(campaign => (
                            <Link 
                              key={campaign.id}
                              to={`/campaign/${campaign.id}`}
                              className="block text-primary hover:underline text-xs"
                            >
                              {campaign.title}
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              רוצים לעבוד איתנו?
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

export default ClientPage; 