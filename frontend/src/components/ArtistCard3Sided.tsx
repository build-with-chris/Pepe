import React, { useState, useRef, useEffect } from "react";
import ArtistCardFront from "./ArtistCardFront";
import ArtistCardBack from "./ArtistCardBack";
import ArtistCardSide from "./ArtistCardSide";
import type { Artist } from "@/types/artist";

interface ArtistCard3SidedProps {
  artist: Artist;
  enableZoom?: boolean;
}

type CardSide = 'front' | 'back' | 'side';

const ArtistCard3Sided: React.FC<ArtistCard3SidedProps> = ({ artist, enableZoom = false }) => {
  const [currentSide, setCurrentSide] = useState<CardSide>('front');
  const idRef = useRef(Math.random().toString(36).substr(2, 9));

  const handleFlip = (targetSide: CardSide) => {
    if (currentSide !== targetSide) {
      const event = new CustomEvent("artistCardFlip", { detail: idRef.current });
      window.dispatchEvent(event);
      setCurrentSide(targetSide);
    }
  };

  const flipToFront = () => setCurrentSide('front');
  const flipToBack = () => setCurrentSide('back');
  const flipToSide = () => setCurrentSide('side');

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail !== idRef.current) {
        setCurrentSide('front');
      }
    };
    window.addEventListener("artistCardFlip", handler);
    return () => window.removeEventListener("artistCardFlip", handler);
  }, []);

  const getTransform = () => {
    switch (currentSide) {
      case 'back':
        return '[transform:rotateY(180deg)]';
      case 'side':
        return '[transform:rotateY(90deg)]';
      default:
        return '';
    }
  };

  return (
    <div
      className="artist-card gpu"
      onClick={() => handleFlip(currentSide === 'front' ? 'back' : currentSide === 'back' ? 'side' : 'front')}
    >
      <div
        className={`absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d] ${getTransform()}`}
      >
        {/* Front Side */}
        <div className={`absolute inset-0 [backface-visibility:hidden] ${currentSide === 'front' ? 'z-10' : ''}`}>
          <ArtistCardFront artist={artist} onFlip={flipToBack} />
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] ${currentSide === 'back' ? 'z-10' : ''}`}>
          <ArtistCardBack artist={artist} onFlip={flipToSide} />
        </div>

        {/* Side */}
        <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(90deg)] ${currentSide === 'side' ? 'z-10' : ''}`}>
          <ArtistCardSide artist={artist} onFlip={flipToFront} enableZoom={enableZoom} />
        </div>
      </div>

      {/* Navigation indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 pointer-events-none">
        <button
          className={`w-2 h-2 rounded-full transition-all pointer-events-auto ${
            currentSide === 'front' ? 'bg-white' : 'bg-white/40'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleFlip('front');
          }}
          aria-label="Show front"
        />
        <button
          className={`w-2 h-2 rounded-full transition-all pointer-events-auto ${
            currentSide === 'back' ? 'bg-white' : 'bg-white/40'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleFlip('back');
          }}
          aria-label="Show back"
        />
        <button
          className={`w-2 h-2 rounded-full transition-all pointer-events-auto ${
            currentSide === 'side' ? 'bg-white' : 'bg-white/40'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleFlip('side');
          }}
          aria-label="Show side"
        />
      </div>
    </div>
  );
};

export default ArtistCard3Sided;