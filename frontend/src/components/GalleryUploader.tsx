import React, { useMemo, useEffect, useRef, useState } from "react";
import { downscaleImages, downscaleImage } from "@/lib/storage/upload";

export interface GalleryUploaderProps {
  galleryUrls: string[];
  setGalleryUrls: React.Dispatch<React.SetStateAction<string[]>>;
  galleryFiles: File[];
  setGalleryFiles: React.Dispatch<React.SetStateAction<File[]>>;
  disabled?: boolean;
  max?: number; // optional: max number of total images (urls + files)
}

export default function GalleryUploader({
  galleryUrls = [],
  setGalleryUrls,
  galleryFiles = [],
  setGalleryFiles,
  disabled = false,
  max = 9,
}: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [optimizing, setOptimizing] = useState(false);
  const [optProgress, setOptProgress] = useState(0); // 0..100

  // Stable previews for local files
  const previews = useMemo(() => (galleryFiles || []).map((f) => URL.createObjectURL(f)), [galleryFiles]);
  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previews]);

  const mergedSources = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(galleryUrls)) list.push(...galleryUrls);
    if (Array.isArray(previews)) list.push(...previews);
    return list;
  }, [galleryUrls, previews]);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerOpen(false);
      if (e.key === "ArrowLeft") setViewerIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setViewerIndex((i) => Math.min(mergedSources.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, mergedSources.length]);

  const currentCount = (galleryUrls?.length ?? 0) + (galleryFiles?.length ?? 0);
  const remaining = Math.max(0, max - currentCount);

  // ---- Handlers ----
  const onPickFiles = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const pickedAll = Array.from(e.target.files);
    const picked = remaining > 0 ? pickedAll.slice(0, remaining) : [];
    if (picked.length === 0) {
      e.currentTarget.value = "";
      return;
    }

    setOptimizing(true);
    setOptProgress(0);
    try {
      const scaled: File[] = [];
      for (let i = 0; i < picked.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const s = await downscaleImage(picked[i], 1600, 0.85);
        scaled.push(s);
        setOptProgress(Math.round(((i + 1) / picked.length) * 100));
      }
      setGalleryFiles((prev) => [...prev, ...scaled]);
    } finally {
      setOptimizing(false);
      // reset input so picking the same file again still triggers onChange
      e.currentTarget.value = "";
    }
  };

  const removeUrl = (index: number) => {
    if (disabled) return;
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    if (disabled) return;
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveWithin = <T,>(arr: T[], from: number, to: number): T[] => {
    if (to < 0 || to >= arr.length) return arr;
    const copy = arr.slice();
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    return copy;
  };

  const moveUrl = (from: number, dir: -1 | 1) => {
    if (disabled) return;
    setGalleryUrls((prev) => moveWithin(prev, from, from + dir));
  };

  const moveFile = (from: number, dir: -1 | 1) => {
    if (disabled) return;
    setGalleryFiles((prev) => moveWithin(prev, from, from + dir));
  };

  // ---- Render ----
  return (
    <div>
      {/* Upload Button */}
      <div className="mb-3">
        <button
          type="button"
          onClick={onPickFiles}
          disabled={disabled || optimizing || remaining === 0}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {optimizing ? 'Optimiere Bilder…' : 'Bilder hinzufügen'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || optimizing || remaining === 0}
          onChange={onFilesSelected}
          className="hidden"
        />
        {max !== undefined && (
          <span className="ml-3 align-middle text-xs text-gray-400">
            {currentCount}/{max}
          </span>
        )}
        <div className="mt-1 text-xs text-gray-400">
          Bilder werden automatisch optimiert (max. 1600px) – für schnellere Uploads.
        </div>

        {optimizing && (
          <div className="mt-2 h-2 w-full overflow-hidden rounded bg-white/10">
            <div
              className="h-2 bg-blue-500 transition-all"
              style={{ width: `${optProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Existing URLs */}
        {galleryUrls?.map((url, i) => (
          <Tile
            key={`url-${i}-${url}`}
            src={url}
            onPreview={() => { setViewerIndex(i); setViewerOpen(true); }}
            onRemove={() => removeUrl(i)}
            onMoveLeft={() => moveUrl(i, -1)}
            onMoveRight={() => moveUrl(i, +1)}
            canMoveLeft={i > 0}
            canMoveRight={i < galleryUrls.length - 1}
            disabled={disabled}
          />
        ))}

        {/* New Files (previews) */}
        {previews.map((src, i) => (
          <Tile
            key={`file-${i}`}
            src={src}
            onPreview={() => { setViewerIndex((galleryUrls?.length || 0) + i); setViewerOpen(true); }}
            onRemove={() => removeFile(i)}
            onMoveLeft={() => moveFile(i, -1)}
            onMoveRight={() => moveFile(i, +1)}
            canMoveLeft={i > 0}
            canMoveRight={i < previews.length - 1}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Info */}
      {remaining === 0 && (
        <p className="mt-2 text-xs text-gray-400">Maximale Anzahl erreicht.</p>
      )}

      {viewerOpen && mergedSources.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewerOpen(false)}>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img src={mergedSources[viewerIndex]} alt="Vorschau" className="max-h-[90vh] max-w-[90vw] object-contain" />
            <button
              type="button"
              className="absolute right-2 top-2 rounded bg-white/20 px-3 py-1 text-white hover:bg-white/30"
              onClick={() => setViewerOpen(false)}
            >
              ✕
            </button>
            <div className="absolute inset-x-0 bottom-2 flex items-center justify-between px-2">
              <button
                type="button"
                className="rounded bg-white/20 px-3 py-1 text-white hover:bg-white/30 disabled:opacity-40"
                onClick={() => setViewerIndex((i) => Math.max(0, i - 1))}
                disabled={viewerIndex === 0}
              >
                ◄
              </button>
              <span className="text-xs text-white/80">{viewerIndex + 1} / {mergedSources.length}</span>
              <button
                type="button"
                className="rounded bg-white/20 px-3 py-1 text-white hover:bg-white/30 disabled:opacity-40"
                onClick={() => setViewerIndex((i) => Math.min(mergedSources.length - 1, i + 1))}
                disabled={viewerIndex >= mergedSources.length - 1}
              >
                ►
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Single tile with image + controls
function Tile({
  src,
  onPreview,
  onRemove,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  disabled,
}: {
  src: string;
  onPreview?: () => void;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <img
        src={src}
        alt="Galeriebild"
        loading="lazy"
        className="h-28 w-full cursor-zoom-in object-cover sm:h-32"
        onClick={onPreview}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={disabled || !canMoveLeft}
            className="rounded bg-white/15 px-2 py-1 text-xs text-white enabled:hover:bg-white/25 disabled:opacity-40"
            aria-label="Nach links"
          >
            ◄
          </button>
          <button
            type="button"
            onClick={onMoveRight}
            disabled={disabled || !canMoveRight}
            className="rounded bg-white/15 px-2 py-1 text-xs text-white enabled:hover:bg-white/25 disabled:opacity-40"
            aria-label="Nach rechts"
          >
            ►
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="rounded bg-red-600 px-2 py-1 text-xs text-white enabled:hover:bg-red-500 disabled:opacity-40"
          aria-label="Entfernen"
        >
          ✕
        </button>
      </div>
    </div>
  );
}