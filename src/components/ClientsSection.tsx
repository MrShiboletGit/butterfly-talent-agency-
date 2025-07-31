import { useState, useEffect } from 'react';
import clientsData from '../data/clients.json';
import { getImageUrl } from '../utils/imageUtils';

const ClientsSection = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = () => {
      clientsData.forEach((client) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(client.id));
        };
        img.src = getImageUrl(client.logoUrl);
      });
    };

    preloadImages();
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
      {clientsData.map((client) => (
        <div key={client.id} className="flex flex-col items-center">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 p-4 h-32 w-full flex flex-col items-center justify-center">
            {!loadedImages.has(client.id) && (
              <div className="flex items-center justify-center h-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
            <div className="h-16 w-full flex items-center justify-center">
              <img 
                src={getImageUrl(client.logoUrl)} 
                alt={client.name} 
                className={`h-16 w-auto max-w-full object-contain transition-opacity duration-300 ${
                  loadedImages.has(client.id) ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoadedImages(prev => new Set(prev).add(client.id))}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">{client.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientsSection;