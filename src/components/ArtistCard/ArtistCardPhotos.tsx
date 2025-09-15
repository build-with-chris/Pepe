import React, { useState } from "react";
import { mergeGallery, getPrimaryImage, normalizeInstagram } from "@/types/artist";
import { ZoomIn, ChevronLeft, ChevronRight, X, Instagram } from "lucide-react";
import type { Artist } from "@/types/artist";

interface ArtistCardPhotosProps {
  artist: Artist;
  onFlip: () => void;
  enableZoom?: boolean;
}

const ArtistCardPhotos: React.FC<ArtistCardPhotosProps> = ({ artist, onFlip, enableZoom = true }) => {
  const galleryImages = mergeGallery(artist);
  const primaryImage = getPrimaryImage(artist);
  
  // Combine primary image with gallery images, avoiding duplicates
  const allImages = primaryImage 
    ? [primaryImage, ...galleryImages.filter(img => img !== primaryImage)]
    : galleryImages;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const currentImage = allImages[currentImageIndex];

  const nextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const openZoom = () => {
    if (enableZoom && currentImage) {
      setIsZoomed(true);
    }
  };

  const closeZoom = () => {
    setIsZoomed(false);
  };

  if (allImages.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700 [backface-visibility:hidden] flex flex-col items-center justify-center">
        <div className="text-center text-gray-400 p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm">Keine Fotos verfügbar</p>
        </div>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="absolute bottom-3 right-3 text-xs text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-1"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-lg overflow-hidden border border-gray-700 [backface-visibility:hidden] flex flex-col">
        {/* Main Photo Display */}
        <div className="relative flex-1 bg-black overflow-hidden">
          {currentImage && (
            <>
              <img
                src={currentImage}
                alt={`${artist.name} - Foto ${currentImageIndex + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
                onClick={(e) => {
                  e.stopPropagation();
                  openZoom();
                }}
              />
              
              {/* Image overlay with controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
              
              {/* Zoom button */}
              {enableZoom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openZoom();
                  }}
                  className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all pointer-events-auto"
                  aria-label="Zoom vergrößern"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              )}

              {/* Navigation arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all pointer-events-auto"
                    aria-label="Vorheriges Foto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all pointer-events-auto"
                    aria-label="Nächstes Foto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Photo counter */}
              <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>

        {/* Bottom info bar */}
        <div className="p-3 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{artist.name}</h3>
              {artist.disciplines && artist.disciplines.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {artist.disciplines.slice(0, 2).map((d, i) => (
                    <span key={i} className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                      {d}
                    </span>
                  ))}
                  {artist.disciplines.length > 2 && (
                    <span className="text-xs text-white/60">+{artist.disciplines.length - 2}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-3">
              {/* Instagram link */}
              {artist.instagram && (
                <a
                  href={normalizeInstagram(artist.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Instagram öffnen"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {/* Back button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip();
                }}
                className="text-xs text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-1 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Zurück
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="p-2 bg-black/80 border-t border-gray-800">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`flex-shrink-0 w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-white shadow-lg' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && currentImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            closeZoom();
          }}
        >
          <img
            src={currentImage}
            alt={`${artist.name} - Vergrößert`}
            className="max-w-[95%] max-h-[95%] object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Navigation in zoom mode */}
          {allImages.length > 1 && (
            <>
              <button
                className="absolute left-5 top-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Vorheriges Foto"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Nächstes Foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Close button */}
          <button
            className="absolute top-5 right-5 z-50 bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-lg backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center transition-all"
            onClick={(e) => {
              e.stopPropagation();
              closeZoom();
            }}
            aria-label="Zoom schließen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Photo counter in zoom */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded backdrop-blur-sm">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ArtistCardPhotos;