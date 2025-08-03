import { Link } from 'react-router-dom';
import { Eye, Users, Calendar, TrendingUp } from 'lucide-react';
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
  content: any[];
}

const CampaignsSection = () => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {campaignsData.map((campaign: Campaign) => (
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
  );
};

export default CampaignsSection; 