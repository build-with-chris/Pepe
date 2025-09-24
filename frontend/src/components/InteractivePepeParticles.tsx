import { useEffect, useRef } from 'react';
import pepeSvg from '../assets/pepe-logo-path.svg?raw';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
};

// SVG als Image rasterizen und ImageData zurückgeben
async function rasterizeLogo(desiredSize: number): Promise<ImageData> {
  const svgBlob = new Blob([pepeSvg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.src = url;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = (e) => rej(e);
  });
  // Bild proportional skalieren
  const aspect = img.width && img.height ? img.width / img.height : 1;
  const w = desiredSize;
  const h = Math.round(desiredSize / (aspect || 1));
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  return ctx.getImageData(0, 0, w, h);
}

// ImageData zu Partikelzielpunkten mit Lücken (gap) auflösen
function sampleFromImageData(imageData: ImageData, gap: number) {
  const points: { x: number; y: number }[] = [];
  const { data, width, height } = imageData;
  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 10) {
        // zentrieren: Ursprung in der Mitte des Bildes
        points.push({ x: x - width / 2, y: y - height / 2 });
      }
    }
  }
  return points;
}

const pathDs: string[] = [
  // P
  `M0 0 C4.52 -0.09 9.03 -0.15 13.55 -0.18 C14.93 -0.2 16.31 -0.21 17.69 -0.24 C34.13 -0.49 50.65 3.37 62.86 15.12 C76.22 29.99 80.49 48.49 79.95 68.06 C79.2 81.99 74.66 95.37 65.59 106.05 C65.04 106.72 64.49 107.39 63.92 108.08 C53.89 119.23 39.38 123.46 24.8 124.25 C2.51 124.51 2.51 124.51 -2.41 122.05 C-2.41 144.49 -2.41 166.93 -2.41 190.05 C-17.26 190.05 -32.11 190.05 -47.41 190.05 C-47.41 128.01 -47.41 65.97 -47.41 2.05 C-42.04 1.38 -37.06 0.88 -31.69 0.73 C-30.61 0.7 -30.61 0.7 -29.51 0.67 C-27.16 0.6 -24.82 0.54 -22.47 0.48 C-21.66 0.46 -20.86 0.44 -20.03 0.42 C-13.35 0.26 -6.68 0.13 0 0 Z M-1.41 35.05 C-1.41 53.53 -1.41 72.01 -1.41 91.05 C15.73 91.98 15.73 91.98 28.47 84.36 C32.99 77.31 34.11 70.37 33.97 62.11 C33.96 61.23 33.95 60.36 33.94 59.45 C33.72 49.31 33.72 49.31 29.3 40.42 C21 32.62 8.96 35.05 -1.41 35.05 Z`,
  // E
  `M0 0 C38.28 0 76.56 0 116 0 C116 11.88 116 23.76 116 36 C115 37 115 37 112.22 37.12 C110.98 37.12 109.74 37.12 108.46 37.11 C107.78 37.11 107.09 37.11 106.39 37.11 C104.12 37.11 101.86 37.11 99.59 37.1 C98.02 37.1 96.45 37.09 94.89 37.09 C90.75 37.09 86.62 37.08 82.48 37.07 C77.53 37.06 72.57 37.05 67.61 37.05 C60.07 37.04 52.54 37.02 45 37 C45 50.2 45 63.4 45 77 C69.75 77.5 69.75 77.5 95 78 C95 88.56 95 99.12 95 110 C78.83 110.33 62.66 110.66 46 111 C45.67 124.2 45.34 137.4 45 151 C69.09 151 93.18 151 118 151 C118 163.21 118 175.42 118 188 C79.06 188 40.12 188 0 188 C0 125.96 0 63.92 0 0 Z`,
  // P
  `M0 0 C4.52 -0.09 9.03 -0.15 13.55 -0.18 C14.93 -0.2 16.31 -0.21 17.69 -0.24 C34.13 -0.49 50.65 3.37 62.86 15.12 C76.22 29.99 80.49 48.49 79.95 68.06 C79.2 81.99 74.66 95.37 65.59 106.05 C65.04 106.72 64.49 107.39 63.92 108.08 C53.89 119.23 39.38 123.46 24.8 124.25 C2.51 124.51 2.51 124.51 -2.41 122.05 C-2.41 144.49 -2.41 166.93 -2.41 190.05 C-17.26 190.05 -32.11 190.05 -47.41 190.05 C-47.41 128.01 -47.41 65.97 -47.41 2.05 C-42.04 1.38 -37.06 0.88 -31.69 0.73 C-30.61 0.7 -30.61 0.7 -29.51 0.67 C-27.16 0.6 -24.82 0.54 -22.47 0.48 C-21.66 0.46 -20.86 0.44 -20.03 0.42 C-13.35 0.26 -6.68 0.13 0 0 Z M-1.41 35.05 C-1.41 53.53 -1.41 72.01 -1.41 91.05 C15.73 91.98 15.73 91.98 28.47 84.36 C32.99 77.31 34.11 70.37 33.97 62.11 C33.96 61.23 33.95 60.36 33.94 59.45 C33.72 49.31 33.72 49.31 29.3 40.42 C21 32.62 8.96 35.05 -1.41 35.05 Z`,
  // E
  `M0 0 C14.85 -0.02 29.69 -0.04 44.54 -0.05 C51.43 -0.06 58.33 -0.06 65.22 -0.08 C71.86 -0.09 78.51 -0.09 85.16 -0.09 C87.7 -0.1 90.24 -0.1 92.78 -0.11 C96.33 -0.11 99.88 -0.11 103.42 -0.11 C105.02 -0.12 105.02 -0.12 106.64 -0.12 C108.08 -0.12 108.08 -0.12 109.55 -0.12 C110.39 -0.12 111.23 -0.12 112.1 -0.12 C114 0 114 0 115 1 C115.1 3.58 115.14 6.14 115.13 8.72 C115.13 9.49 115.13 10.26 115.14 11.06 C115.14 12.7 115.13 14.34 115.13 15.97 C115.13 18.49 115.13 21 115.14 23.52 C115.14 25.11 115.13 26.69 115.13 28.28 C115.13 29.04 115.14 29.8 115.14 30.58 C115.11 35.89 115.11 35.89 114 37 C111.82 37.09 109.64 37.12 107.46 37.11 C106.78 37.11 106.09 37.11 105.39 37.11 C103.12 37.11 100.86 37.11 98.59 37.1 C97.02 37.1 95.45 37.09 93.89 37.09 C89.75 37.09 85.62 37.08 81.48 37.07 C76.53 37.06 71.57 37.05 66.61 37.05 C59.07 37.04 51.54 37.02 44 37 C44.5 56.8 44.5 56.8 45 77 C69.75 77.5 69.75 77.5 95 78 C95 88.56 95 99.12 95 110 C78.17 110 61.34 110 44 110 C44.5 129.8 44.5 129.8 45 150 C68.76 150.33 92.52 150.66 117 151 C117 163.21 117 175.42 117 188 C101.89 188.02 86.79 188.04 71.68 188.05 C64.66 188.06 57.65 188.06 50.64 188.08 C43.87 188.09 37.11 188.09 30.35 188.09 C27.76 188.1 25.17 188.1 22.59 188.11 C18.98 188.11 15.37 188.11 11.76 188.11 C10.14 188.12 10.14 188.12 8.49 188.12 C7.51 188.12 6.53 188.12 5.52 188.12 C4.67 188.12 3.82 188.12 2.93 188.12 C1 188 1 188 0 187 C-0.1 184.58 -0.13 182.2 -0.12 179.78 C-0.12 179.02 -0.12 178.25 -0.12 177.46 C-0.12 174.88 -0.12 172.3 -0.11 169.72 C-0.11 167.88 -0.11 166.04 -0.11 164.19 C-0.11 159.17 -0.11 154.16 -0.1 149.14 C-0.1 143.9 -0.09 138.66 -0.09 133.42 C-0.09 123.5 -0.08 113.57 -0.07 103.64 C-0.06 92.34 -0.06 81.04 -0.05 69.75 C-0.04 46.5 -0.02 23.25 0 0 Z`,
];

export default function InteractivePepeParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const originalPointsRef = useRef<{ x: number; y: number }[]>([]);
  const transformRef = useRef<{ scale: number; offsetX: number; offsetY: number }>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const lastMouseRef = useRef({ x: -9999, y: -9999, time: performance.now(), vx: 0, vy: 0 });

  const computeTransform = (
    canvasWidth: number,
    canvasHeight: number,
    points: { x: number; y: number }[]
  ) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
    const pathWidth = maxX - minX;
    const pathHeight = maxY - minY;
    const targetSize = Math.min(canvasWidth, canvasHeight) * 0.7;
    const scale = targetSize / Math.max(pathWidth, pathHeight);
    const offsetX = (canvasWidth - pathWidth * scale) / 2 - minX * scale;
    const offsetY = (canvasHeight - pathHeight * scale) / 2 - minY * scale;
    return { scale, offsetX, offsetY };
  };

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpi = window.devicePixelRatio || 1;

      // 1. SVG in ImageData umwandeln (z.B. 300px Breite)
      const imageData = await rasterizeLogo(300);
      if (cancelled) return;

      // 2. Punkte sampeln (Abstand gap = 3)
      const originalPoints = sampleFromImageData(imageData, 3);
      originalPointsRef.current = originalPoints;

      // Resize / Transform / Particle-Init
      const resize = () => {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width * dpi;
        canvas.height = height * dpi;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpi, dpi);

        const { scale, offsetX, offsetY } = computeTransform(width, height, originalPoints);
        transformRef.current = { scale, offsetX, offsetY };

        particlesRef.current = originalPoints.map(p => {
          const baseX = p.x * scale + offsetX;
          const baseY = p.y * scale + offsetY;
          // Einschwebe-Effekt: initial 60px nach links versetzt
          return {
            x: baseX - 60,
            y: baseY,
            baseX,
            baseY,
            vx: 0,
            vy: 0,
          };
        });
      };

      resize();

      // Konfigurationsvariablen (reaktiver & stärker)
      const REPULSE_RADIUS = 420;         // früher reagieren (vorher ~100)
      const REPULSE_BASE = 12000;         // Grundstärke der Repulsion (inverse square)
      const MAX_REPULSE_FORCE = 20;       // Obergrenze pro Frame
      const CURSOR_SPEED_BOOST = 0.9;     // Verstärkung je nach Cursor-Geschwindigkeit
      const RETURN_STRENGTH = 0.02;       // Rückstellfeder (proportional zur Distanz)
      const IDLE_NOISE = 0.018;           // leichtes Rauschen für Lebendigkeit
      const DAMPING = 0.96;               // weniger Dämpfung => längerer Nachlauf
      let frameCount = 0;

      const animate = () => {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        // leichte Trail-Fade statt harter Löschung
        ctx.clearRect(0, 0, width, height);

        const particles = particlesRef.current;
        const mouse = mouseRef.current;
        const lastMouse = lastMouseRef.current;


        particles.forEach(p => {
          // Repulsion: inverse-quadratisch + boost bei schneller Mausbewegung
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < REPULSE_RADIUS) {
            // Basisrepulsion (inverse square with softening)
            let h = REPULSE_BASE / (dist * dist + 0.0001);
            // Geschwindigkeit des Cursors
            const speed = Math.sqrt(lastMouse.vx * lastMouse.vx + lastMouse.vy * lastMouse.vy);
            h *= 1 + Math.min(speed * CURSOR_SPEED_BOOST, 1); // boost bei schnelleren Bewegungen
            if (h > MAX_REPULSE_FORCE) h = MAX_REPULSE_FORCE;
            const normX = dx / dist;
            const normY = dy / dist;
            p.vx += normX * h;
            p.vy += normY * h;
          }

          // Rückkehr zur Basis (federnd, proportional zur Entfernung)
          const bx = p.baseX - p.x;
          const by = p.baseY - p.y;
          const bDist = Math.sqrt(bx * bx + by * by);
          if (bDist > 0) {
            const g = bDist * RETURN_STRENGTH;
            p.vx += (bx / bDist) * g;
            p.vy += (by / bDist) * g;
          }

          // leichtes idle-noise
          p.vx += (Math.random() - 0.5) * IDLE_NOISE;
          p.vy += (Math.random() - 0.5) * IDLE_NOISE;

          // Dämpfung
          p.vx *= DAMPING;
          p.vy *= DAMPING;

          p.x += p.vx;
          p.y += p.vy;

          // zeichnen
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // debug: Animation läuft (alle 120 Frames)
        frameCount++;
        if (frameCount % 120 === 0) {
          console.log('animation tick', particles.length);
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      const updateMousePosition = (x: number, y: number) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = x - rect.left;
        mouseRef.current.y = y - rect.top;
      };

      const handleMouseMove = (e: MouseEvent) => {
        const now = performance.now();
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        const dt = Math.max(now - lastMouseRef.current.time, 1);
        lastMouseRef.current.vx = dx / dt;
        lastMouseRef.current.vy = dy / dt;
        lastMouseRef.current.x = e.clientX;
        lastMouseRef.current.y = e.clientY;
        lastMouseRef.current.time = now;

        updateMousePosition(e.clientX, e.clientY);
        console.log('mouse moved to', mouseRef.current);
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const handleMouseLeave = () => {
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      };

      const handleResize = () => {
        resize();
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('resize', handleResize);

      const handlePointerMove = (e: PointerEvent) => {
        const now = performance.now();
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        const dt = Math.max(now - lastMouseRef.current.time, 1);
        lastMouseRef.current.vx = dx / dt;
        lastMouseRef.current.vy = dy / dt;
        lastMouseRef.current.x = e.clientX;
        lastMouseRef.current.y = e.clientY;
        lastMouseRef.current.time = now;

        updateMousePosition(e.clientX, e.clientY);
        // debug pointer fallback
        // console.log('pointer moved to', mouseRef.current);
      };
      window.addEventListener('pointermove', handlePointerMove);

      return () => {
        if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('pointermove', handlePointerMove);
      };
    };

    const cleanup = setup();
    return () => {
      // signal cancel
      (async () => {
        // nothing extra for now
      })();
    };
  }, []);

  return (
    <div className="relative w-full h-full p-0 m-0">
      <canvas ref={canvasRef} className="w-full h-full block p-0 m-0" />
    </div>
  );
}