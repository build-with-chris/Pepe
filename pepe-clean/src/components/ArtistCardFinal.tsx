import React, { useState } from "react";
import type { Artist } from "@/types/artist";
import { getPrimaryImage, mergeGallery, normalizeInstagram } from "@/types/artist";

interface ArtistCardFinalProps {
  artist: Artist;
}

const ArtistCardFinal: React.FC<ArtistCardFinalProps> = ({ artist }) => {
  const [currentPage, setCurrentPage] = useState<'front' | 'info' | 'gallery'>('front');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  // Get the primary image with fallback
  const primaryImage = getPrimaryImage(artist) || 
    'https://via.placeholder.com/350x450/1a1a1a/d4af37?text=' + encodeURIComponent(artist.name || 'Artist');
  
  // Get gallery images
  const galleryImages = mergeGallery(artist);
  const allImages = [primaryImage, ...galleryImages];
  
  // Get social links
  const instagram = normalizeInstagram(artist.social_links?.instagram);
  const website = artist.social_links?.website;
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <>
      <div className={`artist-card-final ${isEnlarged ? 'enlarged' : ''}`}>
        <div className="artist-card-final-inner">
          {/* Front Page - Compact Profile */}
          <div className={`artist-card-final-page ${currentPage === 'front' ? 'active' : ''}`}>
            <div className="artist-card-final-image">
              <img 
                src={primaryImage} 
                alt={artist.name}
                loading="lazy"
              />
              <div className="artist-card-final-overlay">
                <h3 className="artist-card-final-name">{artist.name}</h3>
                {artist.disciplines && artist.disciplines.length > 0 && (
                  <div className="artist-card-final-tags">
                    {artist.disciplines.slice(0, 2).map((discipline, idx) => (
                      <span key={idx} className="artist-card-final-tag">
                        {discipline}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Page - Text Information */}
          <div className={`artist-card-final-page ${currentPage === 'info' ? 'active' : ''}`}>
            <div className="artist-card-final-info">
              <h4 className="artist-card-final-info-title">{artist.name}</h4>
              
              {artist.bio && (
                <p className="artist-card-final-bio">
                  {artist.bio}
                </p>
              )}
              
              <div className="artist-card-final-details">
                {artist.price_range && (
                  <div className="artist-card-final-detail">
                    <span className="detail-label">Price Range:</span>
                    <span className="detail-value">{artist.price_range} €</span>
                  </div>
                )}
                
                {artist.availability && (
                  <div className="artist-card-final-detail">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value available">Available</span>
                  </div>
                )}
                
                {artist.disciplines && artist.disciplines.length > 0 && (
                  <div className="artist-card-final-detail">
                    <span className="detail-label">Skills:</span>
                    <span className="detail-value">{artist.disciplines.join(', ')}</span>
                  </div>
                )}
              </div>
              
              {(instagram || website) && (
                <div className="artist-card-final-social">
                  {instagram && (
                    <a 
                      href={instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                  {website && (
                    <a 
                      href={website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/>
                      </svg>
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Gallery Page - Image Carousel */}
          <div className={`artist-card-final-page ${currentPage === 'gallery' ? 'active' : ''}`}>
            <div className="artist-card-final-carousel">
              {allImages.length > 0 ? (
                <>
                  <div className="carousel-main">
                    <img 
                      src={allImages[currentImageIndex]} 
                      alt={`${artist.name} ${currentImageIndex + 1}`}
                      loading="lazy"
                    />
                    
                    {allImages.length > 1 && (
                      <>
                        <button 
                          className="carousel-btn carousel-prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button 
                          className="carousel-btn carousel-next"
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div className="carousel-info">
                    <span className="carousel-counter">
                      {currentImageIndex + 1} / {allImages.length}
                    </span>
                    <button 
                      className="carousel-enlarge"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEnlarged(true);
                      }}
                      aria-label="Enlarge image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.89L15 21h6v-6z"/>
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="carousel-empty">
                  <p>No images available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="artist-card-final-nav">
          <button 
            className={`nav-btn ${currentPage === 'front' ? 'active' : ''}`}
            onClick={() => setCurrentPage('front')}
            aria-label="Show profile"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
          <button 
            className={`nav-btn ${currentPage === 'info' ? 'active' : ''}`}
            onClick={() => setCurrentPage('info')}
            aria-label="Show info"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>
          <button 
            className={`nav-btn ${currentPage === 'gallery' ? 'active' : ''}`}
            onClick={() => setCurrentPage('gallery')}
            aria-label="Show gallery"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Enlarged Image Modal */}
      {isEnlarged && (
        <div 
          className="image-modal"
          onClick={() => setIsEnlarged(false)}
        >
          <div className="image-modal-content">
            <img 
              src={allImages[currentImageIndex]} 
              alt={`${artist.name} enlarged`}
            />
            <button 
              className="image-modal-close"
              onClick={() => setIsEnlarged(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ArtistCardFinal;