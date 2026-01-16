import React, { useState } from "react";
import type { Artist } from "@/types/artist";
import { getPrimaryImage, mergeGallery, normalizeInstagram } from "@/types/artist";

interface ArtistCardCompactProps {
  artist: Artist;
}

const ArtistCardCompact: React.FC<ArtistCardCompactProps> = ({ artist }) => {
  const [currentView, setCurrentView] = useState<'info' | 'images' | 'contact'>('info');
  
  // Get the primary image with fallback
  const primaryImage = getPrimaryImage(artist) || 
    'https://via.placeholder.com/300x400/1a1a1a/d4af37?text=' + encodeURIComponent(artist.name || 'Artist');
  
  // Get gallery images
  const galleryImages = mergeGallery(artist);
  
  // Get social links
  const instagram = normalizeInstagram(artist.social_links?.instagram);
  const website = artist.social_links?.website;

  return (
    <div className="artist-card-compact">
      {/* Main Image Section - Always Visible */}
      <div className="artist-card-compact-image">
        <img 
          src={primaryImage} 
          alt={artist.name}
          loading="lazy"
        />
        <div className="artist-card-compact-overlay">
          <h3 className="artist-card-compact-name">{artist.name}</h3>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="artist-card-compact-content">
        {/* Info View */}
        {currentView === 'info' && (
          <div className="artist-card-compact-info">
            {artist.disciplines && artist.disciplines.length > 0 && (
              <div className="artist-card-compact-disciplines">
                {artist.disciplines.slice(0, 3).map((discipline, idx) => (
                  <span key={idx} className="artist-card-compact-tag">
                    {discipline}
                  </span>
                ))}
              </div>
            )}
            {artist.bio && (
              <p className="artist-card-compact-bio">
                {artist.bio.slice(0, 100)}...
              </p>
            )}
            {artist.price_range && (
              <div className="artist-card-compact-price">
                <span className="price-label">Price:</span>
                <span className="price-value">{artist.price_range} €</span>
              </div>
            )}
          </div>
        )}

        {/* Images View */}
        {currentView === 'images' && (
          <div className="artist-card-compact-gallery">
            {galleryImages.length > 0 ? (
              <div className="artist-card-compact-gallery-grid">
                {galleryImages.slice(0, 4).map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`${artist.name} ${idx + 1}`}
                    className="artist-card-compact-thumb"
                    loading="lazy"
                  />
                ))}
              </div>
            ) : (
              <p className="artist-card-compact-no-images">No gallery images</p>
            )}
          </div>
        )}

        {/* Contact View */}
        {currentView === 'contact' && (
          <div className="artist-card-compact-contact">
            {artist.availability && (
              <div className="artist-card-compact-availability">
                <span className="availability-dot"></span>
                Available for booking
              </div>
            )}
            {(instagram || website) && (
              <div className="artist-card-compact-links">
                {instagram && (
                  <a 
                    href={instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="artist-card-compact-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                    </svg>
                  </a>
                )}
                {website && (
                  <a 
                    href={website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="artist-card-compact-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
            {!instagram && !website && (
              <p className="artist-card-compact-no-contact">No contact info available</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="artist-card-compact-nav">
        <button 
          className={`artist-card-compact-nav-btn ${currentView === 'info' ? 'active' : ''}`}
          onClick={() => setCurrentView('info')}
          aria-label="Show info"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
        <button 
          className={`artist-card-compact-nav-btn ${currentView === 'images' ? 'active' : ''}`}
          onClick={() => setCurrentView('images')}
          aria-label="Show images"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
        </button>
        <button 
          className={`artist-card-compact-nav-btn ${currentView === 'contact' ? 'active' : ''}`}
          onClick={() => setCurrentView('contact')}
          aria-label="Show contact"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ArtistCardCompact;