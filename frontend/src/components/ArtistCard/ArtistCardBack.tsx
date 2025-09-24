import { mergeGallery, normalizeInstagram } from "@/types/artist";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Artist } from "@/types/artist";
import React from "react";

interface ArtistCardBackProps {
  artist: Artist;
  onFlip: () => void;
}

const ArtistCardBack: React.FC<ArtistCardBackProps> = ({ artist, onFlip }) => {
  const images = mergeGallery(artist);

  const quote = (artist?.quote?.trim() || artist?.bio?.trim() || "Kunst ist der kürzeste Weg zum Staunen.");

  const [enlargedIndex, setEnlargedIndex] = React.useState<number | null>(null);
  const enlarged = enlargedIndex !== null ? images[enlargedIndex] : null;

  return (
    <div className="absolute inset-0 bg-gray-800 rounded-lg shadow-lg overflow-y-auto border border-gray-700 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col">
      {/* Carousel */}
      <div
        className="relative w-full h-60 md:h-80 bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 0 ? (
          <Carousel
            className="w-full h-full"
            opts={{ loop: true }}
          >
            <CarouselContent>
              {images.map((src, idx) => (
                <CarouselItem key={idx} className="flex items-center justify-center">
                  <img
                    src={src}
                    alt={`${artist.name} – Bild ${idx + 1}`}
                    className="w-full h-full object-contain bg-black"
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEnlargedIndex(idx);
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <>
              <CarouselNext
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-md backdrop-blur-sm w-10 h-10"
                aria-label="Nächstes Bild"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            </>
          </Carousel>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Keine weiteren Bilder
          </div>
        )}
      </div>

      {/* Inhalt */}
      <div className="relative flex-1 p-4 flex flex-col">
        <blockquote className="text-gray-200 italic leading-relaxed">„{quote}“</blockquote>
        <div className="mt-2 h-px bg-white/10" />
        <div className="mt-3 text-sm text-gray-400">
          <span className="text-gray-300 font-medium">{artist.name}</span>
        </div>

        <div className="flex-1" />

        {/* Back button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
            className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 hover:underline"
          >
            Zur Vorderseite
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 12A10 10 0 1 1 12 2" />
              <path d="M22 2v6h-6" />
            </svg>
          </button>
        </div>

        {/* Instagram Link */}
        {artist.instagram && (
          <a
            href={normalizeInstagram(artist.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 text-pink-400 hover:text-pink-300"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 1.5A4 4 0 0 0 3.5 7.5v9A4 4 0 0 0 7.5 20.5h9a4 4 0 0 0 4-4v-9a4 4 0 0 0-4-4h-9zm4.5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" />
            </svg>
          </a>
        )}
      </div>
      {enlarged && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setEnlargedIndex(null);
          }}
        >
          <img
            src={enlarged}
            alt="Enlarged"
            className="max-w-[90%] max-h-[90%] object-contain rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-5 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/30 hover:bg-white/40 text-white border border-white/50 shadow-md backdrop-blur-sm w-12 h-12 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              if (images.length > 0 && enlargedIndex !== null) {
                setEnlargedIndex((enlargedIndex + 1) % images.length);
              }
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistCardBack;