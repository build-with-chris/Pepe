import { useEffect, useState, useRef } from 'react';
import { imageToParticles, type Particle } from '@/lib/imageToDots';

export interface DotCloudImageProps {
  /** Discipline ID or icon name (e.g., "cyrwheel") */
  disciplineId: string;
  /** Display size in pixels (default: 400) */
  size?: number;
  /** Particle color (default: uses --pepe-gold) */
  color?: string;
  /** Density multiplier (default: 1.0, range: 0.1-2.0) */
  density?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DotCloudImage - Enhanced scroll-triggered particle system
 * - Idle: particles spread widely with floating + scaling animation
 * - Scroll into view: particles converge to form image (0-100% based on viewport position)
 * - Hover: maintain formed state
 */
export default function DotCloudImage({
  disciplineId,
  size = 400,
  color = 'var(--pepe-gold)',
  density = 1.0,
  className = '',
}: DotCloudImageProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 = dispersed, 1 = formed
  const containerRef = useRef<HTMLDivElement>(null);

  // Load particles
  useEffect(() => {
    let mounted = true;

    const loadParticles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const imagePath = `/doticons/${disciplineId}.jpg`;
        const particleData = await imageToParticles({
          imagePath,
          sampleGap: 2,
          densityMultiplier: density,
          canvasSize: 128,
        });

        if (mounted) {
          setParticles(particleData);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load image');
          setIsLoading(false);
        }
      }
    };

    loadParticles();

    return () => {
      mounted = false;
    };
  }, [disciplineId, density]);

  // Scroll-based animation trigger
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress: 0 when out of view, 1 when centered in viewport
      const containerCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;

      // Distance from center
      const distance = Math.abs(containerCenter - viewportCenter);

      // MAXIMUM trigger range: Start forming from entire viewport (100vh away)
      const maxDistance = windowHeight * 1.0;

      // Progress: 1 at center, 0 at far edges
      const progress = Math.max(0, Math.min(1, 1 - distance / maxDistance));

      setScrollProgress(progress);

      // Update individual debug indicator for this component
      // Match the exact disciplineId used (e.g., "cyrwheel-small", "cyrwheel-sparse", etc.)
      const indicatorId = `scroll-indicator-${disciplineId}`;
      const indicator = document.getElementById(indicatorId);
      if (indicator) {
        indicator.textContent = `${progress.toFixed(2)}`;
        indicator.style.color = progress > 0.5 ? '#ffd700' : progress > 0.1 ? '#ffffff' : '#666666';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      handleScroll(); // Initial calculation
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [disciplineId]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-red-500">Failed to load icon</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="dot-cloud-loader" />
      </div>
    );
  }

  // Scale factor from 128px canvas to display size
  const scale = size / 128;

  // Only use scroll progress (no hover)
  const formProgress = scrollProgress;

  return (
    <div
      ref={containerRef}
      className={`dot-cloud-container ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        overflow: 'visible',
      }}
      data-scroll-progress={scrollProgress.toFixed(2)}
    >
      {particles.map((particle, index) => {
        const targetX = particle.targetX * scale;
        const targetY = particle.targetY * scale;

        // Add small random jitter to hover position (no raster)
        const jitterX = (Math.random() - 0.5) * 2;
        const jitterY = (Math.random() - 0.5) * 2;
        const formedX = targetX + jitterX;
        const formedY = targetY + jitterY;

        // Idle position (widely spread)
        const idleX = targetX + particle.offsetX * scale;
        const idleY = targetY + particle.offsetY * scale;

        // Interpolate between idle and formed based on scroll/hover
        const displayX = idleX + (formedX - idleX) * formProgress;
        const displayY = idleY + (formedY - idleY) * formProgress;

        // Scale animation: much larger when idle (1.2-1.8x), normal when formed (0.9-1.1x)
        const idleScale = 1.2 + Math.random() * 0.6;
        const formedScale = 0.9 + Math.random() * 0.2;
        const currentScale = idleScale + (formedScale - idleScale) * formProgress;

        // Opacity: much lower when dispersed, full when formed
        const opacity = 0.2 + formProgress * 0.8;

        return (
          <span
            key={index}
            className="dot-particle"
            style={{
              '--dot-x': `${displayX}px`,
              '--dot-y': `${displayY}px`,
              '--dot-color': color,
              '--dot-size': `${particle.size}px`,
              '--dot-scale': currentScale,
              '--dot-opacity': opacity,
              '--float-delay': `${particle.floatDelay}ms`,
              '--float-speed': `${6 + particle.floatSpeed * 4}s`,
              '--drift-amplitude': `${20 * (1 - formProgress)}px`,
            } as React.CSSProperties}
          />
        );
      })}


      <style>{`
        .dot-cloud-container {
          cursor: default;
        }

        .dot-particle {
          position: absolute;
          width: var(--dot-size, 3px);
          height: var(--dot-size, 3px);
          border-radius: 50%;
          background: var(--dot-color, var(--pepe-gold));
          box-shadow: 0 0 6px var(--pepe-gold-glow);
          transform: translate(var(--dot-x), var(--dot-y)) scale(var(--dot-scale, 1));
          opacity: var(--dot-opacity, 0.7);
          transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1),
                      opacity 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: transform, opacity;
          animation: particleFloat var(--float-speed, 8s) ease-in-out infinite;
          animation-delay: var(--float-delay, 0ms);
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translate(var(--dot-x), var(--dot-y))
                       scale(var(--dot-scale, 1));
          }
          25% {
            transform: translate(
              calc(var(--dot-x) + var(--drift-amplitude, 8px)),
              calc(var(--dot-y) - var(--drift-amplitude, 8px) * 0.7)
            ) scale(calc(var(--dot-scale, 1) * 1.1));
          }
          50% {
            transform: translate(
              calc(var(--dot-x) - var(--drift-amplitude, 8px) * 0.5),
              calc(var(--dot-y) + var(--drift-amplitude, 8px))
            ) scale(calc(var(--dot-scale, 1) * 0.95));
          }
          75% {
            transform: translate(
              calc(var(--dot-x) - var(--drift-amplitude, 8px)),
              calc(var(--dot-y) - var(--drift-amplitude, 8px) * 0.5)
            ) scale(calc(var(--dot-scale, 1) * 1.05));
          }
        }

        .dot-cloud-loader {
          width: 40px;
          height: 40px;
          border: 3px solid var(--pepe-gold-glow);
          border-top-color: var(--pepe-gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Accessibility: reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .dot-particle {
            animation: none !important;
            transition: opacity 0.3s ease;
          }
        }
      `}</style>
    </div>
  );
}
