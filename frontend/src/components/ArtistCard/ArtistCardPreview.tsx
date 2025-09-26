import React from "react";
import { getFirstSentence } from "@/types/artist";
import type { Artist } from "@/types/artist";

interface ArtistCardPreviewProps {
  artist: Artist;
  className?: string;
}

const ArtistCardPreview: React.FC<ArtistCardPreviewProps> = ({ artist, className = "" }) => {
  const quoteSource = (artist.quote?.trim() || artist.bio || "");
  const quote = getFirstSentence(quoteSource);

  const maxBadges = 4;
  const allDisciplines = Array.isArray(artist.disciplines) ? artist.disciplines : [];
  const shownDisciplines = allDisciplines.slice(0, maxBadges);
  const extraCount = Math.max(0, allDisciplines.length - shownDisciplines.length);

  const firstName = artist.name?.trim().split(" ")[0] || artist.name;

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Vorschau deiner Künstlerkarte
        </h3>
        <p className="text-sm text-gray-400">
          So sehen Kunden deine Karte in der Künstlerübersicht
        </p>
      </div>

      {/* Artist Card Preview - exactly like ArtistCardFront but scaled down */}
      <div className="relative max-w-sm mx-auto">
        <div className="relative aspect-[3/4] min-h-[300px] bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
          {/* Bild */}
          <div className="relative w-full aspect-[4/3] md:aspect-[16/12] bg-gray-800">
            {artist.image ? (
              <img
                src={artist.image}
                alt={artist.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Kein Bild
              </div>
            )}
          </div>

          {/* Inhalt */}
          <div className="p-4 flex flex-col justify-between gap-2 flex-1">
            <h4 className="text-lg font-semibold mb-1 text-white">{firstName}</h4>

            {quote && (
              <p className="italic text-gray-400 text-sm mb-2 line-clamp-3">
                „{quote}"
              </p>
            )}


            {/* Disziplinen als Badges */}
            {shownDisciplines.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {shownDisciplines.map((d, idx) => (
                  <span
                    key={`${d}-${idx}`}
                    className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded"
                  >
                    {d}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">
                    +{extraCount}
                  </span>
                )}
              </div>
            )}

            {/* Anfragen Button */}
            <div className="mt-auto">
              <div className="inline-flex items-center justify-center rounded-full px-4 py-2 border border-white/20 text-sm text-white bg-white/10 w-full text-center">
                Jetzt anfragen
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Hinweis */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          ↑ Diese Vorschau zeigt, wie deine Karte bei Kunden erscheint
        </p>
      </div>
    </div>
  );
};

export default ArtistCardPreview;