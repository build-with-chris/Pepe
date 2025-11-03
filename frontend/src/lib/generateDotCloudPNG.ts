import { imageToParticles, type Particle } from './imageToDots';

export interface DotCloudPNGConfig {
  /** Discipline ID or icon name (e.g., "cyrwheel") */
  disciplineId: string;
  /** Display size in pixels */
  size: number;
  /** Particle color */
  color: string;
  /** Density multiplier */
  density: number;
  /** Sample gap (1-250) */
  sampleGap: number;
  /** Minimum dot size */
  minDotSize: number;
  /** Maximum dot size */
  maxDotSize: number;
  /** Aspect ratio multiplier */
  aspectRatio?: number;
  /** Add glow effect */
  withGlow?: boolean;
  /** Output filename (without extension) */
  outputFilename: string;
}

/**
 * Generate a PNG image from dot cloud configuration
 * Returns a data URL that can be saved as PNG
 */
export async function generateDotCloudPNG(config: DotCloudPNGConfig): Promise<string> {
  const {
    disciplineId,
    size,
    color,
    density,
    sampleGap,
    minDotSize,
    maxDotSize,
    aspectRatio = 1,
    withGlow = false,
  } = config;

  // Load particles
  const baseIconName = disciplineId.split('-')[0];
  const imagePath = `/doticons/${baseIconName}.jpg`;
  const particles = await imageToParticles({
    imagePath,
    sampleGap,
    densityMultiplier: density * 1.2,
    canvasSize: 128,
    minDotSize,
    maxDotSize,
  });

  // Create canvas with full size
  const containerWidth = size * aspectRatio;
  const containerHeight = size;
  const canvas = document.createElement('canvas');
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Clear canvas (transparent background)
  ctx.clearRect(0, 0, containerWidth, containerHeight);

  // Scale factor
  const scaleY = size / 128;
  const scaleX = scaleY * aspectRatio;

  // Parse color (support CSS variables and hex/rgb)
  const resolvedColor = resolveColor(color);
  const glowColor = resolvedColor.startsWith('#')
    ? hexToRgb(resolvedColor)
    : resolvedColor;

  // Draw global glow layer if enabled (behind all particles)
  if (withGlow) {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const glowRadius = Math.min(containerWidth, containerHeight) * 0.5;

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      glowRadius
    );

    gradient.addColorStop(0, `rgba(${glowColor}, 0.25)`);
    gradient.addColorStop(0.5, `rgba(${glowColor}, 0.125)`);
    gradient.addColorStop(1, `rgba(${glowColor}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, containerWidth, containerHeight);
  }

  // Draw particles (fully formed state)
  particles.forEach((particle) => {
    const targetX = particle.targetX * scaleX;
    const targetY = particle.targetY * scaleY;

    // Minimal jitter for alignment
    const jitterX = (Math.random() - 0.5) * 0.5 * 0; // formProgress = 1 (fully formed)
    const jitterY = (Math.random() - 0.5) * 0.5 * 0;
    const displayX = targetX + jitterX;
    const displayY = targetY + jitterY;

    // Contrast boost
    const darknessFactor = 1 - particle.brightness / 255;
    const contrastBoost = 1 + darknessFactor * 0.6; // Same as live version

    const currentScale = 1.0 * contrastBoost;
    const dotSize = particle.size * currentScale;

    // Draw the dot
    ctx.fillStyle = resolvedColor;
    ctx.beginPath();
    ctx.arc(displayX, displayY, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Return data URL
  return canvas.toDataURL('image/png');
}

/**
 * Resolve CSS color to hex/rgb
 */
function resolveColor(color: string): string {
  // Handle CSS variables
  if (color.startsWith('var(')) {
    const varName = color.match(/var\((--[^)]+)\)/)?.[1];
    if (varName) {
      const computedColor = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      return computedColor || '#CD7F32'; // fallback to bronze
    }
  }
  return color;
}

/**
 * Convert hex color to RGB string for rgba()
 */
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

/**
 * Download PNG to user's computer
 */
export function downloadPNG(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Batch generate all discipline PNGs for BookingWizard
 * Returns array of {filename, dataUrl} for each generated PNG
 */
export async function generateAllDisciplinePNGs(): Promise<Array<{filename: string, dataUrl: string}>> {
  const disciplines = [
    'magician',
    'luftakrobatik',
    'flooracrobatics',
    'partnerakrobatik',
    'contemporary',
    'breakdance',
    'juggling',
    'pantomime',
    'cyrwheel',
    'handstand',
    'hulahoop',
    'pole',
    'moderation',
  ];

  const config = {
    size: 150,
    density: 0.35,
    sampleGap: 1,
    minDotSize: 0.8,
    maxDotSize: 3.0,
    aspectRatio: 1,
  };

  const results: Array<{filename: string, dataUrl: string}> = [];

  for (const disciplineId of disciplines) {
    // Active version (pepe-gold with glow)
    const activeDataUrl = await generateDotCloudPNG({
      ...config,
      disciplineId,
      color: '#D4A574', // --pepe-gold
      withGlow: true,
      outputFilename: `${disciplineId}-active`,
    });
    results.push({
      filename: `${disciplineId}-active.png`,
      dataUrl: activeDataUrl
    });

    // Inactive version (pepe-line border color, no glow)
    const inactiveDataUrl = await generateDotCloudPNG({
      ...config,
      disciplineId,
      color: '#333333', // --pepe-line (inactive border color)
      withGlow: false,
      outputFilename: `${disciplineId}-inactive`,
    });
    results.push({
      filename: `${disciplineId}-inactive.png`,
      dataUrl: inactiveDataUrl
    });
  }

  console.log('✅ All PNG exports complete!');
  return results;
}
