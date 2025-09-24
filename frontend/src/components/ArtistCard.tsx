import React, { useState } from 'react';

interface Artist {
  id: number;
  name: string;
  disciplines: string[];
  profile_image_url?: string;
  bio?: string;
  experience_years?: number;
  gallery_urls?: string[];
}

interface ArtistCardProps {
  artist: Artist;
}

type CardSide = 'front' | 'back' | 'photos';

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const [currentSide, setCurrentSide] = useState<CardSide>('front');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const resolveImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    const baseUrl = import.meta.env.VITE_API_URL || 'https://pepe-backend-4nid.onrender.com';
    return `${baseUrl}${imageUrl}`;
  };

  const handleSideChange = (side: CardSide) => {
    setCurrentSide(side);
  };

  const getTransform = () => {
    switch (currentSide) {
      case 'back':
        return '[transform:rotateY(180deg)]';
      case 'photos':
        return '[transform:rotateY(270deg)]';
      default:
        return '';
    }
  };

  const nextImage = () => {
    if (artist.gallery_urls && artist.gallery_urls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % artist.gallery_urls!.length);
    }
  };

  const prevImage = () => {
    if (artist.gallery_urls && artist.gallery_urls.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + artist.gallery_urls!.length) % artist.gallery_urls!.length);
    }
  };

  const currentGalleryImage = artist.gallery_urls?.[currentImageIndex];

  return (
    <div className="relative h-96 w-full bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      {/* Card container with 3D transforms */}
      <div
        className={`absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d] ${getTransform()}`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg">
          <div className="relative h-full flex flex-col">
            {/* Image Section */}
            <div className="relative h-2/3 overflow-hidden">
              {artist.profile_image_url ? (
                <img 
                  src={resolveImageUrl(artist.profile_image_url)}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎭</div>
                    <span className="text-sm text-gray-300">Kein Bild verfügbar</span>
                  </div>
                </div>
              )}
              {/* Disciplines overlay */}
              <div className="absolute top-2 left-2">
                <div className="flex flex-wrap gap-1">
                  {artist.disciplines?.slice(0, 2).map((discipline, index) => (
                    <span key={index} className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                      {discipline}
                    </span>
                  ))}
                  {artist.disciplines && artist.disciplines.length > 2 && (
                    <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                      +{artist.disciplines.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{artist.name}</h3>
                {artist.experience_years && (
                  <p className="text-sm text-gray-300 mb-2">
                    {artist.experience_years} Jahre Erfahrung
                  </p>
                )}
                {artist.bio && (
                  <p className="text-sm text-gray-400 line-clamp-2">{artist.bio}</p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSideChange('back');
                  }}
                >
                  Details
                </button>
                <button 
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Link to booking page
                  }}
                >
                  Buchen
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg">
          <div className="relative h-full flex flex-col">
            {/* Header with background image */}
            <div className="relative h-1/3 overflow-hidden">
              {artist.profile_image_url ? (
                <img 
                  src={resolveImageUrl(artist.profile_image_url)}
                  alt={artist.name}
                  className="w-full h-full object-cover opacity-30"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 opacity-30"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute bottom-2 left-4">
                <h3 className="text-lg font-bold text-white">{artist.name}</h3>
              </div>
            </div>
            
            {/* Bio Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {artist.bio ? (
                <div>
                  <h4 className="text-md font-semibold text-white mb-3">Über {artist.name}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{artist.bio}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400 text-center">
                    Keine weiteren Informationen verfügbar.
                  </p>
                </div>
              )}
            </div>
            
            {/* Back Side Buttons */}
            <div className="p-4">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors">
                {artist.name} buchen
              </button>
            </div>
          </div>
        </div>

        {/* Photos Side */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(270deg)] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg">
          <div className="relative h-full flex flex-col">
            {artist.gallery_urls && artist.gallery_urls.length > 0 ? (
              <>
                {/* Gallery Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-white">{artist.name} - Galerie</h4>
                    <span className="text-sm text-gray-400">
                      {currentImageIndex + 1} / {artist.gallery_urls.length}
                    </span>
                  </div>
                </div>
                
                {/* Gallery Image */}
                <div className="flex-1 relative overflow-hidden">
                  <img 
                    src={resolveImageUrl(currentGalleryImage)}
                    alt={`${artist.name} Galerie ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedImage(resolveImageUrl(currentGalleryImage));
                    }}
                  />
                  
                  {/* Gallery Navigation */}
                  {artist.gallery_urls.length > 1 && (
                    <>
                      <button 
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        aria-label="Vorheriges Bild"
                      >
                        ‹
                      </button>
                      <button 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        aria-label="Nächstes Bild"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
                
                {/* Gallery Dots */}
                {artist.gallery_urls.length > 1 && (
                  <div className="p-4">
                    <div className="flex justify-center gap-2">
                      {artist.gallery_urls.map((_, index) => (
                        <button 
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          aria-label={`Bild ${index + 1} anzeigen`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-sm text-gray-400">
                    Keine Galerie verfügbar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Circular Navigation Dots - Always visible */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        <button
          className={`w-3 h-3 rounded-full transition-all ${
            currentSide === 'front' ? 'bg-white shadow-lg' : 'bg-white/40 hover:bg-white/60'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleSideChange('front');
          }}
          aria-label="Show front"
        />
        <button
          className={`w-3 h-3 rounded-full transition-all ${
            currentSide === 'back' ? 'bg-white shadow-lg' : 'bg-white/40 hover:bg-white/60'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleSideChange('back');
          }}
          aria-label="Show details"
        />
        <button
          className={`w-3 h-3 rounded-full transition-all ${
            currentSide === 'photos' ? 'bg-white shadow-lg' : 'bg-white/40 hover:bg-white/60'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleSideChange('photos');
          }}
          aria-label="Show photos"
        />
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Enlarged"
            className="max-w-[90%] max-h-[90%] object-contain rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-5 right-5 z-50 rounded-full bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-md backdrop-blur-sm w-10 h-10 flex items-center justify-center"
            onClick={() => setZoomedImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistCard;