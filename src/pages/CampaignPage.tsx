import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Users, Calendar, TrendingUp, Share2, Play, ExternalLink, Heart, MessageCircle, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContentCarousel from '../components/ContentCarousel';
import campaignsData from '../data/campaigns.json';
import clientsData from '../data/clients.json';
import talentsData from '../data/talents.json';

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
  content: ContentItem[];
  details?: {
    objective: string;
    strategy: string;
    results: string;
  };
}

interface ContentItem {
  url: string;
  type: 'long-form-video' | 'short-form-video' | 'post' | 'story' | 'reel' | 'image';
  description: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  duration?: string;
  talent?: string;
}

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const campaign = campaignsData.find(c => c.id === id) as Campaign;
  const client = clientsData.find(c => c.id === campaign?.clientId);
  const campaignTalents = talentsData.filter(t => campaign?.talents.includes(t.id));

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return '🎥';
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      default:
        return '📱';
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'long-form-video':
        return 'סרטון ארוך';
      case 'short-form-video':
        return 'סרטון קצר';
      case 'post':
        return 'פוסט';
      case 'story':
        return 'סטורי';
      case 'reel':
        return 'ריל';
      case 'image':
        return 'תמונה';
      default:
        return type;
    }
  };

  const getTalentName = (talentId: string) => {
    const talent = talentsData.find(t => t.id === talentId);
    return talent ? talent.name : talentId;
  };

  if (!campaign) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">קמפיין לא נמצא</h1>
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

        {/* Hero Section - Compact */}
        <section className="relative py-8 bg-gradient-to-br from-purple-500/10 via-pink-400/8 to-blue-500/10">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="mb-4">
                <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                  {campaign.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {campaign.title}
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                {campaign.description}
              </p>
              
              <div className="flex items-center justify-center space-x-6 space-x-reverse text-sm text-gray-600">
                {/* Client Link */}
                {client && (
                  <div className="flex items-center">
                    <span className="text-gray-500">לקוח:</span>
                    <Link 
                      to={`/client/${client.id}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mr-2"
                    >
                      <img 
                        src={client.logoUrl} 
                        alt={client.name}
                        className="w-6 h-6 ml-2 rounded"
                      />
                      {client.name}
                    </Link>
                  </div>
                )}

                {/* Date Range */}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 ml-2" />
                  <span>
                    {new Date(campaign.startDate).toLocaleDateString('he-IL')} - {new Date(campaign.endDate).toLocaleDateString('he-IL')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPIs Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">ביצועי הקמפיין</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(campaign.kpis.views)}
                </div>
                <div className="text-gray-600">צפיות</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {campaign.talents.length}
                </div>
                <div className="text-gray-600">טאלנטים</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {campaign.platforms.length}
                </div>
                <div className="text-gray-600">פלטפורמות</div>
              </div>
            </div>
            
            {/* Social Media Platforms */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-center mb-8">פלטפורמות חברתיות</h3>
              <div className="flex justify-center space-x-8 space-x-reverse">
                {campaign.platforms.map((platform) => (
                  <div key={platform} className="text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">{getPlatformIcon(platform)}</span>
                    </div>
                    <div className="text-lg font-medium text-gray-900 capitalize">
                      {platform}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Details */}
        {campaign.details && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-center mb-12">פרטי הקמפיין</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-primary">מטרה</h3>
                  <p className="text-gray-600">{campaign.details.objective}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-primary">אסטרטגיה</h3>
                  <p className="text-gray-600">{campaign.details.strategy}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-primary">תוצאות</h3>
                  <p className="text-gray-600">{campaign.details.results}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content Section - HERO */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16">תוכן הקמפיין</h2>
            <ContentCarousel content={campaign.content} />
          </div>
        </section>

        {/* Talents Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">הטאלנטים שהשתתפו</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaignTalents.map((talent) => (
                <Link 
                  key={talent.id}
                  to={`/talent/${talent.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 group"
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
                </Link>
              ))}
            </div>
          </div>
        </section>


      </main>
      <Footer />
    </>
  );
};

export default CampaignPage; 
