import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import talentsData from '../data/talents.json';
import TalentCard from './TalentCard';

const TalentCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredTalent, setHoveredTalent] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
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

  // Show 4 talents at a time on desktop, 1 on mobile
  const talentsPerView = isMobile ? 1 : 4;
  const maxIndex = Math.max(0, talentsData.length - talentsPerView);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  // Reset currentIndex when switching between mobile/desktop
  useEffect(() => {
    setCurrentIndex(0);
  }, [isMobile]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${currentIndex * (100 / talentsPerView)}%)` }}
        >
          {talentsData.map((talent) => (
            <div key={talent.id} className={`${isMobile ? 'w-full' : 'w-1/4'} flex-shrink-0 px-3`}>
              <TalentCard 
                talent={talent}
                onMouseEnter={() => setHoveredTalent(talent.id)}
                onMouseLeave={() => setHoveredTalent(null)}
                isHovered={hoveredTalent === talent.id}
                isImageLoaded={loadedImages.has(talent.id)}
                onImageLoad={() => setLoadedImages(prev => new Set(prev).add(talent.id))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        aria-label="הטאלנט הקודם"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        aria-label="הטאלנט הבא"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
            aria-label={`עבור לקבוצת טאלנטים ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TalentCarousel;