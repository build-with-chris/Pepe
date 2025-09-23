import React, { useState } from "react";
import { mergeGallery, getPrimaryImage, normalizeInstagram } from "@/types/artist";
import type { Artist } from "@/types/artist";

interface ArtistCardSideProps {
  artist: Artist;
  onFlip: () => void;
  enableZoom?: boolean;
}

const ArtistCardSide: React.FC<ArtistCardSideProps> = ({ artist, onFlip, enableZoom = false }) => {
  const images = mergeGallery(artist);
  const primaryImage = getPrimaryImage(artist);
  const allImages = primaryImage ? [primaryImage, ...images] : images;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(null);
  
  const currentImage = allImages[currentImageIndex];
  const enlarged = enlargedImageIndex !== null ? allImages[enlargedImageIndex] : null;

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

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-lg overflow-hidden border border-gray-700 [backface-visibility:hidden] [transform:rotateY(-90deg)] flex flex-col">
      {/* Main Image Display */}
      <div className="relative w-full h-3/4 bg-gray-900 overflow-hidden">
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={`${artist.name} - Photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              loading="lazy"
              onClick={(e) => {
                e.stopPropagation();
                if (enableZoom) {
                  setEnlargedImageIndex(currentImageIndex);
                }
              }}
            />
            
            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No additional photos
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">{artist.name}</h3>
          {artist.disciplines && artist.disciplines.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {artist.disciplines.slice(0, 3).map((d, i) => (
                <span key={i} className="text-xs bg-white/10 px-1 py-0.5 rounded text-gray-300">
                  {d}
                </span>
              ))}
              {artist.disciplines.length > 3 && (
                <span className="text-xs text-white/60">+{artist.disciplines.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Instagram link */}
          {artist.instagram && (
            <a
              href={normalizeInstagram(artist.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 text-xs flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 1.5A4 4 0 0 0 3.5 7.5v9A4 4 0 0 0 7.5 20.5h9a4 4 0 0 0 4-4v-9a4 4 0 0 0-4-4h-9zm4.5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" />
              </svg>
              Instagram
            </a>
          )}

          {/* Back button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
            className="text-xs text-blue-300 hover:text-blue-200 hover:underline flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 12A10 10 0 1 1 12 2" />
              <path d="M22 2v6h-6" />
            </svg>
            Front
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {enableZoom && enlarged && enlargedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setEnlargedImageIndex(null);
          }}
        >
          <img
            src={enlarged}
            alt={`${artist.name} - Enlarged photo ${enlargedImageIndex + 1}`}
            className="max-w-[90%] max-h-[90%] object-contain rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Navigation in zoom */}
          {allImages.length > 1 && (
            <>
              <button
                className="absolute left-5 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-md backdrop-blur-sm w-12 h-12 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (enlargedImageIndex - 1 + allImages.length) % allImages.length;
                  setEnlargedImageIndex(newIndex);
                }}
              >
                ‹
              </button>
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-md backdrop-blur-sm w-12 h-12 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (enlargedImageIndex + 1) % allImages.length;
                  setEnlargedImageIndex(newIndex);
                }}
              >
                ›
              </button>
            </>
          )}
          
          {/* Close button */}
          <button
            className="absolute top-5 right-5 z-50 rounded-full bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-md backdrop-blur-sm w-10 h-10 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setEnlargedImageIndex(null);
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistCardSide;