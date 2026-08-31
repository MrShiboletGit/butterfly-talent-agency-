import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import campaignsData from '../data/campaigns.json';
import clientsData from '../data/clients.json';
import talentsData from '../data/talents.json';
import { cardsPerView, PER_VIEW_WIDTH } from '../hooks/useCarouselMotion';

interface Campaign {
  id: string;
  title: string;
  clientId: string;
  description: string;
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
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    talent?: string;
    saves?: number;
  }>;
}

const CampaignsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Seeded from the real width so mobile doesn't paint the desktop layout first.
  const [viewportWidth, setViewportWidth] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1280),
  );

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragAxis = useRef<'undecided' | 'horizontal' | 'vertical'>('undecided');
  const didDrag = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setViewportWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Most recent campaign per client. Copy before sorting: campaignsData is a shared
  // module import, and sorting in place would reorder it for every other page.
  const processedCampaigns = useMemo(
    () =>
      [...campaignsData]
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .reduce((acc: Campaign[], campaign) => {
          const existingClientCampaign = acc.find(c => c.clientId === campaign.clientId);
          if (!existingClientCampaign) {
            acc.push(campaign);
          }
          return acc;
        }, []),
    [],
  );

  const campaignsPerView = cardsPerView(viewportWidth, 3);
  const maxIndex = Math.max(0, processedCampaigns.length - campaignsPerView);

  // Keep the index in range when the card count changes.
  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex]);

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

  // Bounded by maxIndex, not the campaign count: going past it scrolled the strip
  // into empty space where the last cards had already run out.
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
  }, [maxIndex]);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    dragAxis.current = 'undecided';
    didDrag.current = false;
    setDragOffset(0);
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;

    // Decide the gesture's axis before moving anything, so a vertical page scroll
    // that drifts sideways can't drag the carousel with it.
    if (dragAxis.current === 'undecided') {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      dragAxis.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    }

    if (dragAxis.current === 'vertical') return;

    didDrag.current = true;
    setDragOffset(deltaX);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    const containerWidth = containerRef.current?.offsetWidth ?? 0;
    const threshold = containerWidth * 0.15;

    // RTL: the strip follows the finger, so dragging right reveals later campaigns.
    if (dragAxis.current === 'horizontal') {
      if (dragOffset > threshold) {
        nextSlide();
      } else if (dragOffset < -threshold) {
        prevSlide();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, dragOffset, nextSlide, prevSlide]);

  // Swallow the click that follows a drag so the card link doesn't fire. Checking
  // isDragging here would not work: mouseup clears it before the click arrives.
  const handleCardClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
  };

  // In RTL, ArrowLeft moves forward through the list.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      prevSlide();
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) =>
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchEnd = () => handleDragEnd();

  // Calculate transform with drag offset (RTL inverted)
  const getTransform = () => {
    const itemWidth = 100 / campaignsPerView;
    const baseTransform = currentIndex * itemWidth;
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const dragPercent = containerWidth > 0 ? (dragOffset / containerWidth) * 100 : 0;
    return `translateX(${baseTransform + dragPercent}%)`;
  };

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="קרוסלה"
      aria-label="הקמפיינים שלנו"
      onKeyDown={handleKeyDown}
    >
      {/* RTL: forward is leftward, so "next" sits on the left. */}
      <button
        onClick={nextSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200"
        aria-label="הקמפיין הבא"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={prevSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200"
        aria-label="הקמפיין הקודם"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Campaigns Slider */}
      <div 
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        onClickCapture={handleCardClickCapture}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div 
          className={`flex ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
          style={{ 
            transform: getTransform(),
            userSelect: 'none',
          }}
        >
        {processedCampaigns.map((campaign: Campaign) => (
          <div 
            key={campaign.id} 
            className={`${PER_VIEW_WIDTH[campaignsPerView]} flex-shrink-0 px-4`}
          >
            <Link 
              to={`/campaign/${campaign.id}`}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden block"
            >
                               <div className="relative overflow-hidden bg-gray-50">
                     <div className="w-full h-48 flex items-center justify-center p-8">
                       <img 
                         src={clientsData.find(c => c.id === campaign.clientId)?.logoUrl || ''} 
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
          </div>
        ))}
        </div>
      </div>

      {/* One dot per reachable position, with a 24px hit area around a 12px dot. */}
      <div className="flex flex-wrap justify-center gap-y-1 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="w-6 h-6 flex items-center justify-center"
            aria-label={`הצג קמפיינים מפריט ${index + 1}`}
            aria-current={index === currentIndex}
          >
            <span
              className={`block w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CampaignsCarousel; 