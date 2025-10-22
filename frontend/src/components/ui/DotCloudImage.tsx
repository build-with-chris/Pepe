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
  /** Disable all glow effects (default: false) */
  noGlow?: boolean;
  /** Reverse scroll direction: start formed (100%), dissolve on scroll down (default: false) */
  reverseScroll?: boolean;
  /** Enable dynamic density reduction during scroll (only works with reverseScroll, default: false) */
  dynamicDensity?: boolean;
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
  noGlow = false,
  reverseScroll = false,
  dynamicDensity = false,
}: DotCloudImageProps) {

  const [particles, setParticles] = useState<Particle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(1); // Start at 1.0 (fully formed) until scroll calculates actual position
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
          console.error("[DotIcon]", disciplineId, "Load error:", err);
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
    if (isManualMode) {
      return;
    }

    // Wait for particles to load before setting up scroll handler
    if (isLoading || particles.length === 0) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      let progress = 0;

      if (reverseScroll) {
        // FIXED SCROLL MODE: Logo stays centered, dissolves over scroll range
        // Uses easeInCubic curve: faster start than easeInQuart
        const scrollY = window.scrollY;

        // Animation starts immediately and runs through hero (100vh) + scroll section (100vh) = 200vh total
        const dissolveStart = 0;
        const dissolveEnd = windowHeight * 2; // 200vh total

        if (scrollY <= dissolveStart) {
          progress = 0.98; // Initial state at 98% (not 100%)
        } else if (scrollY >= dissolveEnd) {
          progress = 0; // Fully dissolved after 200vh
        } else {
          // Linear scroll progress 0-1 over 200vh range
          const scrollProgress = (scrollY - dissolveStart) / (dissolveEnd - dissolveStart);

          // Apply easeInCubic to scrollProgress: faster start than easeInQuart
          // x^3 makes it start sooner, still accelerate at end
          const eased = Math.pow(scrollProgress, 3);

          // Invert to get progress from 0.98 → 0 (formed → dissolved)
          progress = 0.98 - (eased * 0.98);
        }

        // Hide component completely when fully dissolved
        if (progress === 0 && container) {
          container.style.opacity = '0';
          container.style.visibility = 'hidden';
        } else if (container) {
          container.style.opacity = '1';
          container.style.visibility = 'visible';
        }

      } else {
        // NORMAL SCROLL MODE: For elements lower on page
        // Dissolve very soon after scrolling starts
        const isInViewport = rect.top < windowHeight && rect.bottom > 0;

        if (isInViewport) {
          // Dissolve based on scroll: starts dissolving immediately when scrolling
          const topPosition = rect.top / windowHeight;

          if (topPosition >= 0.6) {
            // In lower 40% of viewport - fully formed
            progress = 1.0;
          } else if (topPosition >= 0.1) {
            // Between 10-60% from top - dissolve progressively
            progress = (topPosition - 0.1) / 0.5; // Maps 0.1-0.6 to 0-1
            progress = progress * progress * (3 - 2 * progress); // smoothstep
          } else {
            // Top 10% or scrolled out - fully dissolved
            progress = 0;
          }
        } else {
          progress = 0; // Out of viewport
        }
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

    // Calculate immediately
    handleScroll();

    // Also recalculate after delay to ensure DOM is fully ready
    setTimeout(() => {
      handleScroll();
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [disciplineId, isManualMode, reverseScroll, isLoading, particles.length]);

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

  // Animation phases based on progress (ONLY for reverseScroll mode, not manual mode)
  // Phase 1 (1.0 -> 0.8): Fully formed, growing dots
  // Phase 2 (0.8 -> 0.6): Glitter/glow effect peaks
  // Phase 3 (0.6 -> 0.4): Lights start turning off
  // Phase 4 (0.4 -> 0.2): Dots shrink to 0.5x, start exploding
  // Phase 5 (0.2 -> 0.0): Density reduction, final explosion
  const enableAdvancedEffects = reverseScroll && !isManualMode;

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
      {/* DEBUG: Visual indicator with actual rendered count */}
      {(() => {
        let visibleCount = 0;
        const progressNormalized = formProgress / 0.98;
        const exponentialProgress = Math.pow(progressNormalized, 8);
        const keepRatio = 0.1 + (exponentialProgress * 0.9);
        const threshold = Math.floor(keepRatio * 10);

        if (dynamicDensity && reverseScroll && !isManualMode) {
          visibleCount = particles.filter((_, idx) => (idx % 10) < threshold).length;
        } else {
          visibleCount = particles.length;
        }

        // Debug indicator disabled
        return null;
      })()}
      {particles.map((particle, index) => {
        // Dynamic density: EXTREME aggressive reduction - starts IMMEDIATELY!
        // At threshold 10: 100% particles
        // At threshold 9: 70% particles (30% GONE immediately!)
        // At threshold 7: 50% particles
        // At threshold 5: 30% particles
        // At threshold 1: 10% particles
        if (dynamicDensity && reverseScroll && !isManualMode) {
          // Use power of 8 for SUPER EXTREME aggressive reduction at start
          const progressNormalized = formProgress / 0.98; // Normalize to 0→1
          const exponentialProgress = Math.pow(progressNormalized, 8); // Power of 8!

          // Map to 10% → 100% range
          const keepRatio = 0.1 + (exponentialProgress * 0.9); // 10% to 100%

          // Use modulo 10 for filtering
          const threshold = Math.floor(keepRatio * 10); // 1 to 10
          const moduloCheck = index % 10;

          if (moduloCheck >= threshold) {
            return null; // Remove this particle
          }
        }

        // Phase 5: Progressive density reduction (ONLY for advanced effects)
        if (enableAdvancedEffects && formProgress < 0.2) {
          const densityReduction = formProgress / 0.2; // 0 to 1
          if (Math.random() > densityReduction) return null;
        }

        const targetX = particle.targetX * scaleX;
        const targetY = particle.targetY * scaleY;

        // Minimal jitter for perfect alignment - only when not fully formed
        const jitterX = (Math.random() - 0.5) * 0.5 * (1 - formProgress);
        const jitterY = (Math.random() - 0.5) * 0.5 * (1 - formProgress);
        const formedX = targetX + jitterX;
        const formedY = targetY + jitterY;

        // Phase 4 & 5: Explosion offset (ONLY for advanced effects)
        let explosionX = 0;
        let explosionY = 0;
        if (enableAdvancedEffects && formProgress < 0.4) {
          const explosionProgress = 1 - (formProgress / 0.4); // 0 to 1
          const angle = Math.random() * Math.PI * 2;
          const distance = explosionProgress * 200 * (1 + Math.random());
          explosionX = Math.cos(angle) * distance;
          explosionY = Math.sin(angle) * distance;
        }

        // Idle position (widely spread)
        const idleX = targetX + particle.offsetX * scaleX;
        const idleY = targetY + particle.offsetY * scaleY;

        // Interpolate between idle and formed based on scroll/hover
        const displayX = idleX + (formedX - idleX) * formProgress + explosionX;
        const displayY = idleY + (formedY - idleY) * formProgress + explosionY;

        // Enhanced contrast: darker spots get bigger dots at perfect alignment
        const darknessFactor = 1 - particle.brightness / 255;
        const contrastBoost = 1 + darknessFactor * 0.6 * formProgress; // Up to 60% bigger when dark & formed

        // Phase 1: Dot growth (ONLY for advanced effects)
        let growthScale = 1.0;
        if (enableAdvancedEffects && formProgress > 0.8) {
          growthScale = 1.0 + ((formProgress - 0.8) / 0.2) * 0.5; // 1.0 to 1.5
        }

        // Phase 4: Dot shrinkage (ONLY for advanced effects)
        let shrinkScale = 1.0;
        if (enableAdvancedEffects && formProgress < 0.4 && formProgress > 0.2) {
          shrinkScale = 0.5 + ((formProgress - 0.2) / 0.2) * 0.5; // 0.5 to 1.0
        } else if (enableAdvancedEffects && formProgress <= 0.2) {
          shrinkScale = 0.5;
        }

        // Scale animation: larger when idle, precise when formed
        const idleScale = 1.3 + Math.random() * 0.5;
        const formedScale = 1.0 * contrastBoost * growthScale * shrinkScale;
        const currentScale = idleScale + (formedScale - idleScale) * formProgress;

        // Phase 2 & 3: Glitter/glow effect (ONLY for advanced effects)
        let glowIntensity = 0;
        if (enableAdvancedEffects && formProgress > 0.4 && formProgress < 0.9) {
          // Peak at 0.7, fade in from 0.4, fade out to 0.9
          const distanceFromPeak = Math.abs(formProgress - 0.7);
          glowIntensity = Math.max(0, 1 - (distanceFromPeak / 0.3));
        }

        // Phase 3: Random lights turn off (ONLY for advanced effects)
        let lightOn = true;
        if (enableAdvancedEffects && formProgress < 0.6 && formProgress > 0.4) {
          const lightsOffProgress = 1 - ((formProgress - 0.4) / 0.2); // 0 to 1
          lightOn = Math.random() > lightsOffProgress * 0.7; // Up to 70% lights off
        } else if (enableAdvancedEffects && formProgress <= 0.4) {
          lightOn = Math.random() > 0.7; // 70% lights off
        }

        const glowSize = 8 * glowIntensity;
        const glowOpacity = 0.8 * glowIntensity;
        const boxShadow = glowSize > 0 && lightOn
          ? `0 0 ${glowSize}px rgba(255, 215, 0, ${glowOpacity}), 0 0 ${glowSize * 2}px rgba(255, 215, 0, ${glowOpacity * 0.5})`
          : 'none';

        // Color tween (ONLY for advanced effects)
        // Phase 1-2 (1.0 -> 0.6): White
        // Phase 3 (0.6 -> 0.4): Transition from white to bronze
        // Phase 4-5 (0.4 -> 0.0): Bronze
        let particleColor = color;
        if (enableAdvancedEffects) {
          if (formProgress > 0.6) {
            // Phase 1-2: White
            particleColor = '#FFFFFF';
          } else if (formProgress > 0.4) {
            // Phase 3: Tween from white to bronze
            const tweenProgress = 1 - ((formProgress - 0.4) / 0.2); // 0 to 1
            const white = { r: 255, g: 255, b: 255 };
            const bronze = { r: 205, g: 127, b: 50 }; // CD7F32
            const r = Math.round(white.r + (bronze.r - white.r) * tweenProgress);
            const g = Math.round(white.g + (bronze.g - white.g) * tweenProgress);
            const b = Math.round(white.b + (bronze.b - white.b) * tweenProgress);
            particleColor = `rgb(${r}, ${g}, ${b})`;
          } else {
            // Phase 4-5: Bronze
            particleColor = '#CD7F32';
          }
        }

        // Opacity: fade out when lights are off or during final explosion
        const opacity = lightOn ? 1.0 : 0.3;

        // Mobile: reduce dot size by 50%
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const dotSize = isMobile ? particle.size * 0.5 : particle.size;

        return (
          <span
            key={`${disciplineId}-${index}`}
            className="dot-particle no-float"
            style={{
              left: `${displayX}px`,
              top: `${displayY}px`,
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              background: particleColor,
              transform: `scale(${currentScale})`,
              opacity: opacity,
              boxShadow: boxShadow,
              transition: 'opacity 0.3s ease-out',
            } as React.CSSProperties}
          />
        );
      })}

      {/* Single global glow behind center - very blurry (disabled if noGlow) */}
      {!noGlow && (
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
      )}


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

        .dot-particle.no-float {
          animation: none !important;
        }

        .dot-particle.glow-particle {
          animation: glowPulse 3s ease-in-out infinite !important;
        }

        @keyframes glowPulse {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 2px currentColor);
          }
          50% {
            filter: brightness(1.2) drop-shadow(0 0 5px currentColor);
          }
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
