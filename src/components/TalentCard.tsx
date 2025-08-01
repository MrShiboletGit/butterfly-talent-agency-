import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { Youtube, Instagram } from 'lucide-react';

interface PlatformFollower {
  platform: string;
  name: string;
  followers: number;
  url: string;
}

interface TalentCardProps {
  talent: {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
    totalFollowers: number;
    platformFollowers: PlatformFollower[];
  };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHovered?: boolean;
  isImageLoaded?: boolean;
  onImageLoad?: () => void;
}

const TalentCard = ({ 
  talent, 
  onMouseEnter, 
  onMouseLeave, 
  isHovered = false,
  isImageLoaded = false,
  onImageLoad
}: TalentCardProps) => {
  const [isLoaded, setIsLoaded] = useState(isImageLoaded);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onImageLoad) onImageLoad();
  };

  // Group channels by platform for hover display
  const getPlatformTotals = () => {
    const totals: { [key: string]: number } = {};
    talent.platformFollowers.forEach(channel => {
      if (!totals[channel.platform]) {
        totals[channel.platform] = 0;
      }
      totals[channel.platform] += channel.followers;
    });
    return totals;
  };

  const platformTotals = getPlatformTotals();

  return (
    <Link to={`/talent/${talent.id}`} className="group block">
      <div 
        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="aspect-[3/4] overflow-hidden relative bg-gray-200">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <img 
            src={getImageUrl(talent.imageUrl)} 
            alt={talent.name} 
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white font-medium">צפה בפרופיל</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-1">{talent.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{talent.category}</p>
          <div className="relative">
            <div className={`text-xs bg-secondary/10 text-primary px-2 py-1 rounded-full inline-block follower-counter ${
              isHovered ? 'transform scale-110 bg-primary/20' : ''
            }`}>
              {isHovered ? (
                <div className="flex items-center gap-3 text-xs">
                  {platformTotals.youtube && (
                    <div className="flex items-center gap-1">
                      <Youtube size={14} className="text-red-500" />
                      <span className="font-medium">{formatNumber(platformTotals.youtube)}</span>
                    </div>
                  )}
                  {platformTotals.instagram && (
                    <div className="flex items-center gap-1">
                      <Instagram size={14} className="text-pink-500" />
                      <span className="font-medium">{formatNumber(platformTotals.instagram)}</span>
                    </div>
                  )}
                  {platformTotals.tiktok && (
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <span className="font-medium">{formatNumber(platformTotals.tiktok)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-lg font-bold">{formatNumber(talent.totalFollowers)} עוקבים</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TalentCard;