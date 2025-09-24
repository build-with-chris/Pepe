import React from "react";
import { getFirstSentence } from "@/types/artist";
import type { Artist } from "@/types/artist";

interface ArtistCardFrontProps {
  artist: Artist;
  onFlip: () => void; // wird vom Wrapper übergeben
}

const ArtistCardFront: React.FC<ArtistCardFrontProps> = ({ artist }) => {
  const quoteSource = (artist.quote?.trim() || artist.bio || "");
  const quote = getFirstSentence(quoteSource);


  const maxBadges = 4;
  const allDisciplines = Array.isArray(artist.disciplines) ? artist.disciplines : [];
  const shownDisciplines = allDisciplines.slice(0, maxBadges);
  const extraCount = Math.max(0, allDisciplines.length - shownDisciplines.length);

  const firstName = artist.name?.trim().split(" ")[0] || artist.name;

  return (
    <div className="artist-card-image [backface-visibility:hidden]">
      {artist.image ? (
        <img
          src={artist.image}
          alt={artist.name}
          className="artist-card-image"
          loading="lazy"
        />
      ) : (
        <div className="flex-center text-muted-foreground">
          Kein Bild
        </div>
      )}
      
      <div className="artist-card-overlay">
        <div className="artist-card-title">{firstName}</div>
        
        {quote && (
          <p className="artist-card-subtitle line-clamp-2">„{quote}"</p>
        )}

        {/* Disziplinen als Badges */}
        {shownDisciplines.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {shownDisciplines.map((d, idx) => (
              <span
                key={`${d}-${idx}`}
                className="badge badge-outline text-xs"
              >
                {d}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="badge badge-outline text-xs">+{extraCount}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistCardFront;