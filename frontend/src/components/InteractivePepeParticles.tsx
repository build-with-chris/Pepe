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

      const imageData = await rasterizeLogo(300);
      if (cancelled) return;

      const originalPoints = sampleFromImageData(imageData, 3);
      originalPointsRef.current = originalPoints;

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

      const REPULSE_RADIUS = 420;
      const REPULSE_BASE = 12000;
      const MAX_REPULSE_FORCE = 20;
      const CURSOR_SPEED_BOOST = 0.9;
      const RETURN_STRENGTH = 0.02;
      const IDLE_NOISE = 0.018;
      const DAMPING = 0.96;

      const animate = () => {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        ctx.clearRect(0, 0, width, height);

        const particles = particlesRef.current;
        const mouse = mouseRef.current;
        const lastMouse = lastMouseRef.current;

        particles.forEach(p => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < REPULSE_RADIUS) {
            let h = REPULSE_BASE / (dist * dist + 0.0001);
            const speed = Math.sqrt(lastMouse.vx * lastMouse.vx + lastMouse.vy * lastMouse.vy);
            h *= 1 + Math.min(speed * CURSOR_SPEED_BOOST, 1);
            if (h > MAX_REPULSE_FORCE) h = MAX_REPULSE_FORCE;
            const normX = dx / dist;
            const normY = dy / dist;
            p.vx += normX * h;
            p.vy += normY * h;
          }

          const bx = p.baseX - p.x;
          const by = p.baseY - p.y;
          const bDist = Math.sqrt(bx * bx + by * by);
          if (bDist > 0) {
            const g = bDist * RETURN_STRENGTH;
            p.vx += (bx / bDist) * g;
            p.vy += (by / bDist) * g;
          }

          p.vx += (Math.random() - 0.5) * IDLE_NOISE;
          p.vy += (Math.random() - 0.5) * IDLE_NOISE;

          p.vx *= DAMPING;
          p.vy *= DAMPING;

          p.x += p.vx;
          p.y += p.vy;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      const updateMousePosition = (x: number, y: number) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = x - rect.left;
        mouseRef.current.y = y - rect.top;
      };

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

      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('resize', handleResize);
      window.addEventListener('pointermove', handlePointerMove);

      return () => {
        if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('pointermove', handlePointerMove);
      };
    };

    setup();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative w-full h-full p-0 m-0">
      <canvas ref={canvasRef} className="w-full h-full block p-0 m-0" />
    </div>
  );
}
