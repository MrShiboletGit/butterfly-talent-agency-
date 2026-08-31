import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import talentsData from '../data/talents.json';
import TalentCard from './TalentCard';
import {
  usePrefersReducedMotion,
  useDocumentHidden,
  cardsPerView,
  PER_VIEW_WIDTH,
} from '../hooks/useCarouselMotion';

const mainTalents = talentsData
  .filter(talent => talent.main)
  .sort((a, b) => b.totalFollowers - a.totalFollowers);

const TalentCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredTalent, setHoveredTalent] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  // Seeded from the real width so mobile doesn't paint the desktop layout first.
  const [viewportWidth, setViewportWidth] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1280),
  );

  const prefersReducedMotion = usePrefersReducedMotion();
  const documentHidden = useDocumentHidden();

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  // Which way the gesture went. Until it is decided we move nothing, so a vertical
  // page scroll that drifts sideways can't yank the carousel along with it.
  const dragAxis = useRef<'undecided' | 'horizontal' | 'vertical'>('undecided');
  // Set once a real horizontal drag happens, so releasing over a card doesn't
  // count as a click and navigate away.
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

  const talentsPerView = cardsPerView(viewportWidth, 4);
  const maxIndex = Math.max(0, mainTalents.length - talentsPerView);

  // Keep the index in range when the width (and so the card count) changes.
  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const autoPlayActive = isAutoPlaying && !isDragging && !isPaused && !prefersReducedMotion && !documentHidden;

  useEffect(() => {
    if (!autoPlayActive || maxIndex === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPlayActive, maxIndex]);

  const nextSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
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

    if (dragAxis.current === 'undecided') {
      // Wait for a clear intent before claiming the gesture.
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

    // RTL: the strip follows the finger, so dragging right reveals later talents.
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

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => {
    setIsPaused(false);
    if (isDragging) handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) =>
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchEnd = () => handleDragEnd();

  // Swallow the click that follows a drag so the card link doesn't fire.
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

  const getTransform = () => {
    const baseTransform = currentIndex * (100 / talentsPerView);
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const dragPercent = containerWidth > 0 ? (dragOffset / containerWidth) * 100 : 0;
    return `translateX(${baseTransform + dragPercent}%)`;
  };

  const showControls = maxIndex > 0;

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="קרוסלה"
      aria-label="הטאלנטים שלנו"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClickCapture={handleCardClickCapture}
      >
        <div
          className={`flex ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
          style={{
            transform: getTransform(),
          }}
        >
          {mainTalents.map((talent, index) => {
            const isOffscreen = index < currentIndex || index >= currentIndex + talentsPerView;
            return (
              <div
                key={talent.id}
                className={`${PER_VIEW_WIDTH[talentsPerView]} flex-shrink-0 px-3`}
                // Keep clipped cards out of the tab order and off the a11y tree.
                aria-hidden={isOffscreen}
                {...(isOffscreen ? { inert: '' } : {})}
              >
                <TalentCard
                  talent={talent}
                  onMouseEnter={() => setHoveredTalent(talent.id)}
                  onMouseLeave={() => setHoveredTalent(null)}
                  isHovered={hoveredTalent === talent.id}
                  isImageLoaded={loadedImages.has(talent.id)}
                  onImageLoad={() => setLoadedImages(prev => new Set(prev).add(talent.id))}
                  priority={index < talentsPerView}
                />
              </div>
            );
          })}
        </div>
      </div>

      {showControls && (
        <>
          {/* RTL: forward is leftward, so "next" sits on the left. */}
          <button
            onClick={nextSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full p-3 shadow-lg transition-all duration-200 z-10"
            aria-label="הטאלנט הבא"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={prevSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full p-3 shadow-lg transition-all duration-200 z-10"
            aria-label="הטאלנט הקודם"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots: 24px hit area around an 8px dot so they stay tappable. */}
          <div className="flex flex-wrap justify-center gap-y-1 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className="w-6 h-6 flex items-center justify-center"
                aria-label={`הצג טאלנטים מפריט ${index + 1}`}
                aria-current={index === currentIndex}
              >
                <span
                  className={`block w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex ? 'bg-primary scale-125' : 'bg-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TalentCarousel;
