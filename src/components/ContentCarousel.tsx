import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, ExternalLink, Eye, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import talentsData from '../data/talents.json';

interface ContentItem {
  url: string;
  type: 'long-form-video' | 'short-form-video' | 'post' | 'story' | 'reel' | 'image';
  description: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  duration?: string;
  talent?: string;
}

interface ContentCarouselProps {
  content: ContentItem[];
}

const ContentCarousel = ({ content }: ContentCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort content by views in descending order
  const sortedContent = [...content].sort((a, b) => (b.views || 0) - (a.views || 0));

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Items per view based on screen size
  const itemsPerView = isMobile ? 1 : 3;

  // Auto-rotate every 20 seconds
  useEffect(() => {
    if (isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + 1 >= sortedContent.length ? 0 : prevIndex + 1
      );
    }, 20000);

    return () => clearInterval(interval);
  }, [sortedContent.length, isDragging]);

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

  const getThumbnailUrl = (url: string, platform: string) => {
    try {
      if (platform === 'youtube') {
        const videoId = url.match(/[?&]v=([^&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1];
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } else if (platform === 'instagram') {
        // Instagram doesn't provide direct thumbnail URLs, but we can try to extract post ID
        const postId = url.match(/\/p\/([^\/]+)/)?.[1] || url.match(/\/reel\/([^\/]+)/)?.[1];
        if (postId) {
          // For Instagram, we'll use a placeholder with the post ID
          return `https://www.instagram.com/p/${postId}/media/?size=l`;
        }
      } else if (platform === 'tiktok') {
        // TikTok doesn't provide direct thumbnail URLs, but we can try to extract video ID
        const videoId = url.match(/video\/(\d+)/)?.[1];
        if (videoId) {
          // For TikTok, we'll use a placeholder
          return `https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/${videoId}`;
        }
      }
    } catch (error) {
      console.log('Error extracting thumbnail:', error);
    }
    return null;
  };

  const getEmbedUrl = (url: string, platform: string) => {
    try {
      if (platform === 'youtube') {
        // Handle YouTube Shorts URLs
        if (url.includes('/shorts/')) {
          const videoId = url.match(/\/shorts\/([^?\/]+)/)?.[1];
          if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&showinfo=0`;
          }
        }
        // Handle regular YouTube URLs
        const videoId = url.match(/[?&]v=([^&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (platform === 'instagram') {
        const postId = url.match(/\/p\/([^\/]+)/)?.[1] || url.match(/\/reel\/([^\/]+)/)?.[1];
        if (postId) {
          return `https://www.instagram.com/p/${postId}/embed/`;
        }
      } else if (platform === 'tiktok') {
        const videoId = url.match(/video\/(\d+)/)?.[1];
        if (videoId) {
          return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
      }
    } catch (error) {
      console.log('Error extracting embed URL:', error);
    }
    return null;
  };

  const nextSlide = useCallback(() => {
    if (sortedContent.length <= itemsPerView) return;
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= sortedContent.length ? 0 : prevIndex + 1
    );
  }, [sortedContent.length, itemsPerView]);

  const prevSlide = useCallback(() => {
    if (sortedContent.length <= itemsPerView) return;
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? sortedContent.length - 1 : prevIndex - 1
    );
  }, [sortedContent.length, itemsPerView]);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    setDragOffset(0);
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    const diff = clientX - dragStartX.current;
    setDragOffset(diff);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const threshold = containerWidth * 0.15;
    
    // RTL: swipe left = next, swipe right = prev
    if (dragOffset > threshold) {
      nextSlide();
    } else if (dragOffset < -threshold) {
      prevSlide();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, dragOffset, nextSlide, prevSlide]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Calculate transform with drag offset (RTL inverted)
  const getTransform = () => {
    const itemWidth = 100 / itemsPerView;
    const baseTransform = currentIndex * itemWidth;
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const dragPercent = containerWidth > 0 ? (dragOffset / containerWidth) * 100 : 0;
    return `translateX(${baseTransform + dragPercent}%)`;
  };

  return (
    <div className="relative">
      {/* Navigation Buttons - only show if more than itemsPerView items */}
      {sortedContent.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
            aria-label="Previous content"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
            aria-label="Next content"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Content Slider */}
      <div 
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`flex ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
          style={{ 
            transform: getTransform(),
            userSelect: 'none',
          }}
        >
        {sortedContent.map((item, index) => (
          <div 
            key={`${currentIndex}-${index}`} 
            className={`${isMobile ? 'w-full' : 'w-1/3'} flex-shrink-0 px-3`}
          >
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Content Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-2xl">{getPlatformIcon(item.platform)}</span>
                  <span className="text-sm font-medium text-gray-700 uppercase">
                    {item.platform}
                  </span>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  {getContentTypeLabel(item.type)}
                </span>
              </div>
              
              {item.talent && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">טאלנט:</span> {getTalentName(item.talent)}
                </div>
              )}
            </div>

                         {/* Content Preview */}
             <div className="relative h-130">
               {item.platform === 'youtube' ? (
                 <div className="relative w-full h-full">
                   <iframe
                     src={getEmbedUrl(item.url, item.platform) || ''}
                     title={item.description}
                     className="w-full h-full rounded-t-lg"
                     frameBorder="0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                     style={{ aspectRatio: '9/16' }}
                     onError={() => {
                       // Fallback to thumbnail if embed fails
                       const iframe = document.querySelector(`iframe[src="${getEmbedUrl(item.url, item.platform)}"]`) as HTMLIFrameElement;
                       if (iframe) {
                         iframe.style.display = 'none';
                         iframe.nextElementSibling?.classList.remove('hidden');
                       }
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center hidden">
                     <div className="text-center text-white">
                       <div className="text-4xl mb-2">🎥</div>
                       <div className="text-sm">YouTube Video</div>
                     </div>
                   </div>
                 </div>
               ) : item.platform === 'instagram' ? (
                 <div className="relative w-full h-full">
                   <iframe
                     src={getEmbedUrl(item.url, item.platform) || ''}
                     title={item.description}
                     className="w-full h-full rounded-t-lg"
                     frameBorder="0"
                     scrolling="no"
                     allowTransparency={true}
                     style={{ aspectRatio: '9/16' }}
                     onError={() => {
                       // Fallback to thumbnail if embed fails
                       const iframe = document.querySelector(`iframe[src="${getEmbedUrl(item.url, item.platform)}"]`) as HTMLIFrameElement;
                       if (iframe) {
                         iframe.style.display = 'none';
                         iframe.nextElementSibling?.classList.remove('hidden');
                       }
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center hidden">
                     <div className="text-center text-white">
                       <div className="text-4xl mb-2">📷</div>
                       <div className="text-sm">Instagram {getContentTypeLabel(item.type)}</div>
                     </div>
                   </div>
                 </div>
               ) : item.platform === 'tiktok' ? (
                 <div className="relative w-full h-full">
                   <iframe
                     src={getEmbedUrl(item.url, item.platform) || ''}
                     title={item.description}
                     className="w-full h-full rounded-t-lg"
                     frameBorder="0"
                     allowFullScreen
                     style={{ aspectRatio: '9/16' }}
                     onError={() => {
                       // Fallback to thumbnail if embed fails
                       const iframe = document.querySelector(`iframe[src="${getEmbedUrl(item.url, item.platform)}"]`) as HTMLIFrameElement;
                       if (iframe) {
                         iframe.style.display = 'none';
                         iframe.nextElementSibling?.classList.remove('hidden');
                       }
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center hidden">
                     <div className="text-center text-white">
                       <div className="text-4xl mb-2">🎵</div>
                       <div className="text-sm">TikTok Video</div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <img 
                   src={item.url} 
                   alt={item.description}
                   className="w-full h-full object-cover rounded-t-lg"
                   style={{ aspectRatio: '9/16' }}
                 />
               )}
             </div>

                                      {/* Content Details */}
             <div className="p-4 flex flex-col h-full">
               <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                 {item.description}
               </h3>
               
                               {/* Stats Grid - Moved up for better visibility */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                 {item.views && (
                   <div className="flex items-center text-gray-600">
                     <Eye className="w-3 h-3 ml-1" />
                     <span>{formatNumber(item.views)} צפיות</span>
                   </div>
                 )}
                 {item.likes && (
                   <div className="flex items-center text-gray-600">
                     <Heart className="w-3 h-3 ml-1" />
                     <span>{formatNumber(item.likes)} לייקים</span>
                   </div>
                 )}
                 {item.comments && (
                   <div className="flex items-center text-gray-600">
                     <MessageCircle className="w-3 h-3 ml-1" />
                     <span>{formatNumber(item.comments)} תגובות</span>
                   </div>
                 )}
                 {item.shares && (
                   <div className="flex items-center text-gray-600">
                     <Share2 className="w-3 h-3 ml-1" />
                     <span>{formatNumber(item.shares)} שיתופים</span>
                   </div>
                 )}
                 {item.saves && (
                   <div className="flex items-center text-gray-600">
                     <Bookmark className="w-3 h-3 ml-1" />
                     <span>{formatNumber(item.saves)} שמירות</span>
                   </div>
                 )}
                 {/* Fill empty spaces to maintain consistent height */}
                 {!item.views && (
                   <div className="flex items-center text-gray-600 opacity-0">
                     <Eye className="w-3 h-3 ml-1" />
                     <span>0 צפיות</span>
                   </div>
                 )}
                 {!item.likes && (
                   <div className="flex items-center text-gray-600 opacity-0">
                     <Heart className="w-3 h-3 ml-1" />
                     <span>0 לייקים</span>
                   </div>
                 )}
                 {!item.comments && (
                   <div className="flex items-center text-gray-600 opacity-0">
                     <MessageCircle className="w-3 h-3 ml-1" />
                     <span>0 תגובות</span>
                   </div>
                 )}
                 {!item.shares && (
                   <div className="flex items-center text-gray-600 opacity-0">
                     <Share2 className="w-3 h-3 ml-1" />
                     <span>0 שיתופים</span>
                   </div>
                 )}
               </div>

               {/* Spacer to push button to bottom */}
               <div className="flex-grow"></div>

               {/* View Button */}
               <div className="mt-4">
                 <a 
                   href={item.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-center block font-medium text-sm"
                 >
                   צפה בתוכן
                 </a>
               </div>
             </div>
          </div>
          </div>
        ))}
        </div>
      </div>

      {/* Dots Indicator - only show if more than itemsPerView items */}
      {sortedContent.length > itemsPerView && (
        <div className="flex justify-center mt-8 space-x-2 space-x-reverse">
          {sortedContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentIndex === index
                  ? 'bg-primary' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to content ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentCarousel; 