/**
 * Image to Dots Utility
 * Converts grayscale images to particle arrays based on brightness
 */

export interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  offsetX: number;
  offsetY: number;
  size: number; // Size based on darkness
  brightness: number; // Store brightness for animations
  floatDelay: number; // Stagger animation
  floatSpeed: number; // Variation in movement speed
}

export interface ImageToDotsOptions {
  /** Image path (e.g., /doticons/cyrwheel.jpg) */
  imagePath: string;
  /** Sample every N pixels (default: 2) */
  sampleGap?: number;
  /** Density multiplier (0.1 - 2.0, default: 1.0) */
  densityMultiplier?: number;
  /** Canvas size to sample (default: 128) */
  canvasSize?: number;
  /** Minimum dot size in pixels (default: 0.5) */
  minDotSize?: number;
  /** Maximum dot size in pixels (default: 5.0) */
  maxDotSize?: number;
}

/**
 * Load and sample an image to create particles
 * @param options Configuration options
 * @returns Array of particles with positions
 */
export async function imageToParticles(
  options: ImageToDotsOptions
): Promise<Particle[]> {
  const {
    imagePath,
    sampleGap = 2,
    densityMultiplier = 1.0,
    canvasSize = 128,
    minDotSize = 0.5,
    maxDotSize = 5.0,
  } = options;

  // Load image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imagePath;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
  });

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  // Draw image
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.drawImage(img, 0, 0, canvasSize, canvasSize);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  const { data } = imageData;

  // Sample pixels and create particles
  const particles: Particle[] = [];

  for (let y = 0; y < canvasSize; y += sampleGap) {
    for (let x = 0; x < canvasSize; x += sampleGap) {
      const idx = (y * canvasSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const alpha = data[idx + 3];

      // Skip fully transparent pixels
      if (alpha < 10) continue;

      // Calculate brightness (0-255)
      const brightness = (r + g + b) / 3;

      // Density weight: darker = more likely to appear
      const density = (1 - brightness / 255) * densityMultiplier;

      // Probabilistic sampling based on density
      if (Math.random() < density) {
        // ENHANCED: Larger spread for idle state (30-50px radius)
        const spreadRadius = 25 + Math.random() * 25;
        const angle = Math.random() * Math.PI * 2;
        const offsetX = Math.cos(angle) * spreadRadius * Math.random();
        const offsetY = Math.sin(angle) * spreadRadius * Math.random();

        // ENHANCED: Size variation based on darkness
        // Darker areas = larger dots, lighter = smaller dots (uses user-defined range)
        const darknessFactor = 1 - brightness / 255;
        const sizeRange = maxDotSize - minDotSize;
        const baseSize = minDotSize + darknessFactor * sizeRange;
        const sizeVariation = 0.8 + Math.random() * 0.4; // 0.8-1.2x variation
        const size = baseSize * sizeVariation;

        // ENHANCED: Random animation timing
        const floatDelay = Math.random() * 5000; // 0-5s delay
        const floatSpeed = 0.8 + Math.random() * 0.4; // 0.8-1.2x speed

        particles.push({
          x,
          y,
          targetX: x,
          targetY: y,
          offsetX,
          offsetY,
          size,
          brightness,
          floatDelay,
          floatSpeed,
        });
      }
    }
  }

  return particles;
}
