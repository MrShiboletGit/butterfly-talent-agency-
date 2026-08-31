import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clientsData from '../data/clients.json';
import { getImageUrl } from '../utils/imageUtils';

const ClientsSection = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  // Logos are remote and several sit on hosts that rot. Track failures so a dead
  // logo falls back to the client's name instead of spinning forever.
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    clientsData.forEach((client) => {
      const img = new Image();
      img.onload = () => setLoadedImages(prev => new Set(prev).add(client.id));
      img.onerror = () => setFailedImages(prev => new Set(prev).add(client.id));
      img.src = getImageUrl(client.logoUrl);
    });
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
      {clientsData.map((client) => (
        <Link 
          key={client.id} 
          to={`/client/${client.id}`}
          className="flex flex-col items-center group"
        >
          {/* The spinner overlays rather than stacking above the logo: as a sibling it
              pushed the card past its fixed height and clipped the client's name. */}
          <div className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 h-32 w-full flex flex-col items-center justify-center group-hover:shadow-lg">
            {!loadedImages.has(client.id) && !failedImages.has(client.id) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
            <div className="h-16 w-full flex items-center justify-center">
              {failedImages.has(client.id) ? (
                <span className="text-base font-semibold text-primary text-center leading-tight line-clamp-2">
                  {client.name}
                </span>
              ) : (
                <img
                  src={getImageUrl(client.logoUrl)}
                  alt={client.name}
                  className={`h-16 w-auto max-w-full object-contain transition-all duration-300 ${
                    loadedImages.has(client.id) ? 'opacity-100' : 'opacity-0'
                  } group-hover:scale-105`}
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(client.id))}
                  onError={() => setFailedImages(prev => new Set(prev).add(client.id))}
                />
              )}
            </div>
            {!failedImages.has(client.id) && (
              <p className="text-sm text-gray-600 mt-2 text-center line-clamp-1 group-hover:text-primary transition-colors">
                {client.name}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ClientsSection;