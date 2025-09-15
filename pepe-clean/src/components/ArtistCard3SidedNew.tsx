import React, { useState } from "react";
import type { Artist } from "@/types/artist";
import { getPrimaryImage, mergeGallery, normalizeInstagram } from "@/types/artist";

interface ArtistCard3SidedProps {
  artist: Artist;
}

const ArtistCard3SidedNew: React.FC<ArtistCard3SidedProps> = ({ artist }) => {
  const [rotation, setRotation] = useState(0);
  
  const handleRotate = () => {
    setRotation((prev) => (prev + 120) % 360);
  };

  // Get the primary image with multiple fallbacks
  const rawImage = getPrimaryImage(artist);
  console.log('Artist:', artist.name, 'Image URL:', rawImage, 'Full artist:', artist);
  const primaryImage = rawImage || 
    'https://via.placeholder.com/400x500/1a1a1a/d4af37?text=' + encodeURIComponent(artist.name || 'Artist');
  
  // Get gallery images
  const galleryImages = mergeGallery(artist);
  
  // Get social links
  const instagram = normalizeInstagram(artist.social_links?.instagram);
  const website = artist.social_links?.website;
  
  // Extract first sentence for quote
  const getFirstSentence = (text: string): string => {
    if (!text) return '';
    const match = text.match(/^[^.!?]+[.!?]/);
    return match ? match[0] : text.slice(0, 100) + '...';
  };
  
  const quote = getFirstSentence(artist.quote || artist.bio || '');

  return (
    <div className="artist-card-3d-container">
      <div 
        className="artist-card-3d-wrapper"
        style={{
          transform: `rotateY(${rotation}deg)`
        }}
        onClick={handleRotate}
      >
        {/* Front Side - Main Profile */}
        <div className="artist-card-3d-face artist-card-3d-front">
          <div className="artist-card-3d-image">
            <img 
              src={primaryImage} 
              alt={artist.name}
              loading="lazy"
            />
            <div className="artist-card-3d-gradient" />
          </div>
          <div className="artist-card-3d-content">
            <h3 className="artist-card-3d-name">{artist.name}</h3>
            {artist.disciplines && artist.disciplines.length > 0 && (
              <div className="artist-card-3d-disciplines">
                {artist.disciplines.slice(0, 2).map((discipline, idx) => (
                  <span key={idx} className="artist-card-3d-discipline">
                    {discipline}
                  </span>
                ))}
              </div>
            )}
            {quote && (
              <p className="artist-card-3d-quote">"{quote}"</p>
            )}
          </div>
          <div className="artist-card-3d-indicator">
            <span className="artist-card-3d-tap">Tap to rotate →</span>
          </div>
        </div>

        {/* Back Side - Gallery */}
        <div className="artist-card-3d-face artist-card-3d-back">
          <div className="artist-card-3d-gallery">
            {galleryImages.length > 0 ? (
              <div className="artist-card-3d-gallery-grid">
                {galleryImages.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="artist-card-3d-gallery-item">
                    <img 
                      src={img} 
                      alt={`${artist.name} ${idx + 1}`}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="artist-card-3d-no-gallery">
                <span>No gallery images available</span>
              </div>
            )}
          </div>
          <div className="artist-card-3d-content">
            <h4 className="artist-card-3d-gallery-title">Gallery</h4>
            <p className="artist-card-3d-gallery-count">
              {galleryImages.length} images
            </p>
          </div>
          <div className="artist-card-3d-indicator">
            <span className="artist-card-3d-tap">Tap to rotate →</span>
          </div>
        </div>

        {/* Side - Contact/Bio */}
        <div className="artist-card-3d-face artist-card-3d-side">
          <div className="artist-card-3d-bio">
            <h4 className="artist-card-3d-bio-title">About</h4>
            <p className="artist-card-3d-bio-text">
              {artist.bio || 'Professional artist and performer.'}
            </p>
          </div>
          
          {(artist.price_range || artist.availability) && (
            <div className="artist-card-3d-info">
              {artist.price_range && (
                <div className="artist-card-3d-info-item">
                  <span className="artist-card-3d-info-label">Price:</span>
                  <span className="artist-card-3d-info-value">{artist.price_range} €</span>
                </div>
              )}
              {artist.availability && (
                <div className="artist-card-3d-info-item">
                  <span className="artist-card-3d-info-label">Status:</span>
                  <span className="artist-card-3d-info-value artist-card-3d-available">
                    Available
                  </span>
                </div>
              )}
            </div>
          )}
          
          {(instagram || website) && (
            <div className="artist-card-3d-social">
              {instagram && (
                <a 
                  href={instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="artist-card-3d-social-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Instagram
                </a>
              )}
              {website && (
                <a 
                  href={website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="artist-card-3d-social-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website
                </a>
              )}
            </div>
          )}
          
          <div className="artist-card-3d-indicator">
            <span className="artist-card-3d-tap">Tap to rotate →</span>
          </div>
        </div>
      </div>

      {/* Rotation Indicators */}
      <div className="artist-card-3d-dots">
        <button 
          className={`artist-card-3d-dot ${rotation === 0 ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setRotation(0);
          }}
          aria-label="Show front"
        />
        <button 
          className={`artist-card-3d-dot ${rotation === 120 ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setRotation(120);
          }}
          aria-label="Show gallery"
        />
        <button 
          className={`artist-card-3d-dot ${rotation === 240 ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setRotation(240);
          }}
          aria-label="Show info"
        />
      </div>
    </div>
  );
};

export default ArtistCard3SidedNew;