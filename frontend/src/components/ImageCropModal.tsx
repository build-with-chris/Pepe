import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Crop as CropIcon, X, RotateCw, ZoomIn } from "lucide-react";

interface ImageCropModalProps {
  file: File;
  onCropped: (croppedFile: File) => void;
  onCancel: () => void;
  onNewImage: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropModal({ file, onCropped, onCancel, onNewImage }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const crop = centerAspectCrop(naturalWidth, naturalHeight, 1);
    setCrop(crop);
  }, []);

  const handleCrop = useCallback(async () => {
    if (!imgRef.current || !crop) return;
    setProcessing(true);

    try {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelCrop = {
        x: (crop.x / 100) * image.naturalWidth,
        y: (crop.y / 100) * image.naturalHeight,
        width: (crop.width / 100) * image.naturalWidth,
        height: (crop.height / 100) * image.naturalHeight,
      };

      // Use percentage-based crop if unit is %, otherwise use pixel values
      const cropX = crop.unit === "%" ? pixelCrop.x : crop.x * scaleX;
      const cropY = crop.unit === "%" ? pixelCrop.y : crop.y * scaleY;
      const cropW = crop.unit === "%" ? pixelCrop.width : crop.width * scaleX;
      const cropH = crop.unit === "%" ? pixelCrop.height : crop.height * scaleY;

      // Output at max 800x800
      const outputSize = Math.min(cropW, 800);
      canvas.width = outputSize;
      canvas.height = outputSize;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        outputSize,
        outputSize
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
              type: "image/webp",
            });
            onCropped(croppedFile);
          }
          setProcessing(false);
        },
        "image/webp",
        0.9
      );
    } catch {
      setProcessing(false);
    }
  }, [crop, file, onCropped]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CropIcon className="w-5 h-5 text-[#D4A574]" />
              Bild zuschneiden
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Wähle den quadratischen Ausschnitt für dein Profilbild
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-5 flex justify-center bg-black/30">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={1}
              circularCrop={false}
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Zuschneiden"
                onLoad={onImageLoad}
                className="max-h-[50vh] object-contain"
                crossOrigin="anonymous"
              />
            </ReactCrop>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-5 border-t border-white/10 gap-3">
          <Button
            variant="outline"
            onClick={onNewImage}
            className="border-white/10 text-gray-300 hover:bg-white/5"
          >
            Anderes Bild
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-white/10 text-gray-300 hover:bg-white/5"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCrop}
              disabled={processing || !crop}
              className="bg-[#D4A574] hover:bg-[#E6B887] text-black font-semibold shadow-lg shadow-[#D4A574]/20"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Wird zugeschnitten…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CropIcon className="w-4 h-4" />
                  Zuschneiden & Übernehmen
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
