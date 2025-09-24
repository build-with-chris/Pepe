import React from "react";
import ArtistCardFront from "./ArtistCardFront";
import ArtistCardBack from "./ArtistCardBack";
import type { Artist } from "@/types/artist";

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const [flipped, setFlipped] = React.useState(false);
  const idRef = React.useRef(Math.random().toString(36).substr(2, 9));

  const handleFlip = () => {
    if (!flipped) {
      const event = new CustomEvent("artistCardFlip", { detail: idRef.current });
      window.dispatchEvent(event);
      setFlipped(true);
    } else {
      setFlipped(false);
    }
  };
  const flipToFront = () => setFlipped(false);
  const flipToBack = () => setFlipped(true);

  React.useEffect(() => {
    const handler = (e: any) => {
      if (e.detail !== idRef.current) {
        setFlipped(false);
      }
    };
    window.addEventListener("artistCardFlip", handler);
    return () => window.removeEventListener("artistCardFlip", handler);
  }, []);

  return (
    <div
      className="relative aspect-[3/4] min-h-[340px] [perspective:1000px] cursor-pointer transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
      onClick={handleFlip}
    >
      <div
        className={`absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <ArtistCardFront artist={artist} onFlip={flipToBack} />
        <ArtistCardBack artist={artist} onFlip={flipToFront} />
      </div>
    </div>
  );
};

export default ArtistCard;