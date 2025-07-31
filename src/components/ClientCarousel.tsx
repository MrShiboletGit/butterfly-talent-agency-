import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clientsData from '../data/clients.json';

const ClientCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Show 5 clients at a time
  const clientsPerView = 5;
  const maxIndex = Math.max(0, clientsData.length - clientsPerView);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = () => {
      clientsData.forEach((client) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(client.id));
        };
        img.src = client.logoUrl;
      });
    };

    preloadImages();
  }, []);

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
          style={{ transform: `translateX(${currentIndex * (100 / clientsPerView)}%)` }}
        >
          {clientsData.map((client) => (
            <div key={client.id} className="w-1/5 flex-shrink-0 px-3">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 p-4 h-32 flex flex-col items-center justify-center">
                {!loadedImages.has(client.id) && (
                  <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
                <img 
                  src={client.logoUrl} 
                  alt={client.name} 
                  className={`max-h-16 max-w-full object-contain transition-opacity duration-300 ${
                    loadedImages.has(client.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(client.id))}
                />
                <p className="text-sm text-gray-600 mt-2 text-center">{client.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        aria-label="הלקוח הקודם"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        aria-label="הלקוח הבא"
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
            aria-label={`עבור לקבוצת לקוחות ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ClientCarousel;