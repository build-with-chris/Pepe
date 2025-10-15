import { useEffect, useState, useRef } from 'react';
import { imageToParticles, type Particle } from '@/lib/imageToDots';

export interface DotCloudImageProps {
  /** Discipline ID or icon name (e.g., "cyrwheel") */
  disciplineId: string;
  /** Display size in pixels (default: 400) */
  size?: number;
  /** Particle color (default: uses --pepe-gold) */
  color?: string;
  /** Density multiplier (default: 0.3, range: 0.1-2.0) */
  density?: number;
  /** Additional CSS classes */
  className?: string;
  /** Aspect ratio multiplier (default: 1, use 3 for wide logos) */
  aspectRatio?: number;
  /** Manual animation position override (0-100, disables scroll) */
  manualAnimationPosition?: number;
  /** Sample gap (1-250, default: 1) */
  sampleGap?: number;
  /** Minimum dot size (default: 0.5) */
  minDotSize?: number;
  /** Maximum dot size (default: 6.0) */
  maxDotSize?: number;
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
  density = 0.3,
  className = '',
  aspectRatio = 1,
  manualAnimationPosition,
  sampleGap = 1,
  minDotSize = 0.5,
  maxDotSize = 6.0,
}: DotCloudImageProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 = dispersed, 1 = formed
  const containerRef = useRef<HTMLDivElement>(null);

  // Use manual position if provided, otherwise use scroll progress
  const isManualMode = manualAnimationPosition !== undefined;
  const manualProgress = isManualMode ? manualAnimationPosition / 100 : 0;

  // Load particles
  useEffect(() => {
    let mounted = true;

    const loadParticles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Extract base icon name (e.g., "cyrwheel-small" -> "cyrwheel")
        const baseIconName = disciplineId.split('-')[0];
        const imagePath = `/doticons/${baseIconName}.jpg`;
        const particleData = await imageToParticles({
          imagePath,
          sampleGap, // User-configurable (1-250)
          densityMultiplier: density * 1.2, // Increased density for better coverage
          canvasSize: 128,
          minDotSize,
          maxDotSize,
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
  }, [disciplineId, density, sampleGap, minDotSize, maxDotSize]);

  // Scroll-based animation trigger (only when not in manual mode)
  useEffect(() => {
    // Skip scroll handling if in manual mode
    if (isManualMode) return;

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

      // Raw progress: 1 at center, 0 at far edges
      const rawProgress = Math.max(0, Math.min(1, 1 - distance / maxDistance));

      // Apply easing curve with plateau at perfect alignment
      // Reaches 1.0 exactly when centered, with plateau zone for stability
      let progress = rawProgress;

      if (rawProgress >= 0.9) {
        // Plateau zone: reach 1.0 at exact center with wide plateau
        // Maps 0.9-1.0 to 0.95-1.0 with ease-out curve
        const plateauProgress = (rawProgress - 0.9) / 0.1;
        progress = 0.95 + (plateauProgress * plateauProgress) * 0.05;
      } else if (rawProgress >= 0.3) {
        // Middle zone: ease-in-out for smooth transition
        const t = (rawProgress - 0.3) / 0.6;
        progress = 0.3 + (t * t * (3 - 2 * t)) * 0.65;
      } else {
        // Start zone: ease-in for gradual beginning
        const t = rawProgress / 0.3;
        progress = (t * t) * 0.3;
      }

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
  }, [disciplineId, isManualMode]);

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
  const scaleY = size / 128;
  const scaleX = scaleY * aspectRatio; // X axis scales with aspect ratio

  // Use manual progress if in manual mode, otherwise use scroll progress
  const formProgress = isManualMode ? manualProgress : scrollProgress;

  // Calculate container dimensions based on aspect ratio
  const containerWidth = size * aspectRatio;
  const containerHeight = size;

  return (
    <div
      ref={containerRef}
      className={`dot-cloud-container ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        position: 'relative',
        overflow: 'visible',
      }}
      data-scroll-progress={scrollProgress.toFixed(2)}
    >
      {particles.map((particle, index) => {
        const targetX = particle.targetX * scaleX;
        const targetY = particle.targetY * scaleY;

        // Minimal jitter for perfect alignment - only when not fully formed
        const jitterX = (Math.random() - 0.5) * 0.5 * (1 - formProgress);
        const jitterY = (Math.random() - 0.5) * 0.5 * (1 - formProgress);
        const formedX = targetX + jitterX;
        const formedY = targetY + jitterY;

        // Idle position (widely spread)
        const idleX = targetX + particle.offsetX * scaleX;
        const idleY = targetY + particle.offsetY * scaleY;

        // Interpolate between idle and formed based on scroll/hover
        const displayX = idleX + (formedX - idleX) * formProgress;
        const displayY = idleY + (formedY - idleY) * formProgress;

        // Enhanced contrast: darker spots get bigger dots at perfect alignment
        const darknessFactor = 1 - particle.brightness / 255;
        const contrastBoost = 1 + darknessFactor * 0.6 * formProgress; // Up to 60% bigger when dark & formed

        // Scale animation: larger when idle, precise when formed
        const idleScale = 1.3 + Math.random() * 0.5;
        const formedScale = 1.0 * contrastBoost; // Consistent size when formed, boosted by darkness
        const currentScale = idleScale + (formedScale - idleScale) * formProgress;

        // NO TRANSPARENCY - solid opacity for performance
        const opacity = 1.0;

        return (
          <span
            key={`${disciplineId}-${index}`}
            className="dot-particle"
            style={{
              left: `${displayX}px`,
              top: `${displayY}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: color,
              transform: `scale(${currentScale})`,
              animationDelay: `${particle.floatDelay}ms`,
              animationDuration: `${6 + particle.floatSpeed * 4}s`,
              '--drift-x': `${20 * (1 - formProgress)}px`,
              '--drift-y': `${20 * (1 - formProgress)}px`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Single global glow behind center - very blurry */}
      <div
        className="dot-glow"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '80%',
          height: '80%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />


      <style>{`
        .dot-cloud-container {
          cursor: default;
        }

        .dot-particle {
          position: absolute;
          border-radius: 50%;
          transition: left 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
                      top 0.8s cubic-bezier(0.2, 0.8, 0.2, 1),
                      transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: transform;
          animation: particleFloat 8s ease-in-out infinite;
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(var(--drift-x, 8px), calc(var(--drift-y, 8px) * -0.7)) scale(1.05);
          }
          50% {
            transform: translate(calc(var(--drift-x, 8px) * -0.5), var(--drift-y, 8px)) scale(0.98);
          }
          75% {
            transform: translate(calc(var(--drift-x, 8px) * -1), calc(var(--drift-y, 8px) * -0.5)) scale(1.02);
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
