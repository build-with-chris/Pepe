import React, { useState, useEffect } from 'react';

interface CarouselImage {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Update transform based on current index
  useEffect(() => {
    const itemWidth = 346.5; // Based on the original transform values
    setTranslateX(-currentIndex * itemWidth);
  }, [currentIndex]);

  const getSlideTransform = (index: number) => {
    const diff = index - currentIndex;
    
    // Center slide (current)
    if (diff === 0) {
      return "md:rotate-0 md:z-10 md:relative";
    }
    // Left slide
    else if (diff === -1 || (currentIndex === 0 && index === images.length - 1)) {
      return "md:-rotate-45 md:translate-x-40 md:scale-75 md:relative";
    }
    // Right slide
    else if (diff === 1 || (currentIndex === images.length - 1 && index === 0)) {
      return "md:rotate-45 md:-translate-x-40 md:scale-75 md:relative";
    }
    // Other slides
    else {
      return "undefined";
    }
  };

  return (
    <div 
      className={`max-w-5xl block relative z-0 mt-4 ${className}`}
      role="region" 
      aria-roledescription="carousel"
      data-slot="carousel"
    >
      <div className="overflow-hidden h-full" data-slot="carousel-content">
        <div 
          className="flex h-full -ml-4 transition-transform duration-700 ease-in-out"
          style={{ transform: `translate3d(${translateX}px, 0px, 0px)` }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              data-slot="carousel-item"
              className="min-w-0 shrink-0 grow-0 basis-full h-full pl-4 my-10 md:basis-1/3"
            >
              <div className={`w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg transition-transform duration-500 ease-in-out ${getSlideTransform(index)}`}>
                <img 
                  className="h-full w-full object-cover" 
                  alt={image.alt} 
                  src={image.src}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
          {/* Duplicate first few images for seamless loop */}
          {images.slice(0, 3).map((image, index) => (
            <div
              key={`duplicate-${index}`}
              role="group"
              aria-roledescription="slide"
              data-slot="carousel-item"
              className="min-w-0 shrink-0 grow-0 basis-full h-full pl-4 my-10 md:basis-1/3"
            >
              <div className="w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg transition-transform duration-500 ease-in-out undefined">
                <img 
                  className="h-full w-full object-cover" 
                  alt={image.alt} 
                  src={image.src}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="absolute right-0 bottom-0 flex w-full translate-y-full flex-col items-center justify-center gap-2">
        <div className="flex gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;