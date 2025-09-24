import { useEffect, useRef } from "react";

export function useLazyVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const src = v.getAttribute("data-src");
            if (src && !v.src) {
              v.src = src;
              v.load();
              v.play().catch(() => {});
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return videoRef;
}