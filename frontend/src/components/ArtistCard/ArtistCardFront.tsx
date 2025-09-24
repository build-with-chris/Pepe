import React from "react";
import { getFirstSentence } from "@/types/artist";
import type { Artist } from "@/types/artist";

interface ArtistCardFrontProps {
  artist: Artist;
  onFlip: () => void; // wird vom Wrapper übergeben
}

const ArtistCardFront: React.FC<ArtistCardFrontProps> = ({ artist, onFlip }) => {
  const quoteSource = (artist.quote?.trim() || artist.bio || "");
  const quote = getFirstSentence(quoteSource);


  const maxBadges = 4;
  const allDisciplines = Array.isArray(artist.disciplines) ? artist.disciplines : [];
  const shownDisciplines = allDisciplines.slice(0, maxBadges);
  const extraCount = Math.max(0, allDisciplines.length - shownDisciplines.length);

  const firstName = artist.name?.trim().split(" ")[0] || artist.name;

  return (
    <div className="absolute inset-0 bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800 [backface-visibility:hidden] flex flex-col">
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
      <div className="p-6 pb-7 flex flex-col justify-between gap-3 flex-1 min-h-56 md:min-h-64">
        <h2 className="text-xl font-semibold mb-2 text-white">{firstName}</h2>

        {quote && (
          <p className="italic text-gray-400 mb-2 line-clamp-4 md:line-clamp-6">„{quote}“</p>
        )}

        {/* Disziplinen als Badges */}
        {shownDisciplines.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            {shownDisciplines.map((d, idx) => (
              <span
                key={`${d}-${idx}`}
                className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded"
              >
                {d}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded">+{extraCount}</span>
            )}
          </div>
        )}
        <div className="mt-4 mb-2 shrink-0">
          <a
            href={`/anfragen?skipIntro=1&artistId=${artist.id}`}
            className="inline-flex items-center justify-center rounded-full px-4 py-2 border border-white/20 text-sm text-white bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 w-full text-center"
            aria-label={`Jetzt ${artist.name} anfragen`}
          >
            Jetzt anfragen
          </a>
        </div>
      </div>
    </div>
  );
};

export default ArtistCardFront;