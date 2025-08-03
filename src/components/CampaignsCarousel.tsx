import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Users, Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
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
  content: Array<{
    url: string;
    type: string;
    description: string;
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    talent: string;
    saves?: number;
  }>;
}

const CampaignsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Process campaigns: sort by date and filter by most recent per client
  const processedCampaigns = campaignsData
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .reduce((acc: Campaign[], campaign) => {
      // Check if we already have a campaign from this client
      const existingClientCampaign = acc.find(c => c.clientId === campaign.clientId);
      if (!existingClientCampaign) {
        acc.push(campaign);
      }
      return acc;
    }, []);

  // Show 3 campaigns at a time on desktop, 1 on mobile
  const campaignsPerView = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, processedCampaigns.length - campaignsPerView);

  // Reset currentIndex when switching between mobile/desktop
  useEffect(() => {
    setCurrentIndex(0);
  }, [isMobile]);
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getClientName = (clientId: string) => {
    const client = clientsData.find(c => c.id === clientId);
    return client ? client.name : clientId;
  };

  const getTalentNames = (talentIds: string[]) => {
    return talentIds.map(id => {
      const talent = talentsData.find(t => t.id === id);
      return talent ? talent.name : id;
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + campaignsPerView >= processedCampaigns.length ? 0 : prevIndex + campaignsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - campaignsPerView < 0 ? Math.max(0, processedCampaigns.length - campaignsPerView) : prevIndex - campaignsPerView
    );
  };

  const visibleCampaigns = processedCampaigns.slice(currentIndex, currentIndex + campaignsPerView);

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
        aria-label="Previous campaigns"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
        aria-label="Next campaigns"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Campaigns Grid */}
      <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {visibleCampaigns.map((campaign: Campaign) => (
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {campaign.title}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {campaign.description}
              </p>
              
              <div className="space-y-3">
                {/* Client */}
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700">לקוח:</span>
                  <span className="mr-2">{getClientName(campaign.clientId)}</span>
                </div>
                
                {/* Talents */}
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 ml-2" />
                  <span className="font-medium text-gray-700">טאלנטים:</span>
                  <span className="mr-2">{getTalentNames(campaign.talents).slice(0, 2).join(', ')}
                    {campaign.talents.length > 2 && ` +${campaign.talents.length - 2}`}
                  </span>
                </div>
                
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
                    {campaign.platforms.map((platform) => (
                      <span 
                        key={platform}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-8 space-x-2 space-x-reverse">
        {Array.from({ length: Math.ceil(processedCampaigns.length / campaignsPerView) }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * campaignsPerView)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === Math.floor(currentIndex / campaignsPerView) 
                ? 'bg-primary' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignsCarousel; 