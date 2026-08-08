/**
 * Zuschnitt-Dialog für Profilbilder.
 *
 * Wer ein Hochformat hochlud, bekam vorher einen Automatik-Ausschnitt: Der
 * Browser schnitt beim Anzeigen mittig zu, und dabei verschwand gern der Kopf
 * oder die Füsse. Hier legt der Artist den Ausschnitt selbst fest: Rahmen
 * verschieben, Grösse über den Regler, fertig. Vorbelegt ist der grösstmögliche
 * mittige Ausschnitt, im Regelfall reicht also Bestätigen.
 *
 * Das Seitenverhältnis kommt aus `PROFILE_ASPECT` und ist 3 zu 4.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, RotateCcw, X, ZoomIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import {
  PROFILE_ASPECT,
  PROFILE_IMAGE_SIZE,
  type CropArea,
  centeredCrop,
  clampCrop,
  cropImage,
  loadImage,
} from '@/lib/imageCrop'

interface ImageCropDialogProps {
  /** Die vom Artist gewählte Datei. `null` hält den Dialog geschlossen. */
  file: File | null
  /** Der fertige Ausschnitt als WebP. */
  onConfirm: (blob: Blob) => void
  /** Abbrechen: die Auswahl wird verworfen. */
  onCancel: () => void
  /** Breite geteilt durch Höhe. Standard ist das Profilbild-Verhältnis. */
  aspect?: number
}

export default function ImageCropDialog({
  file,
  onConfirm,
  onCancel,
  aspect = PROFILE_ASPECT,
}: ImageCropDialogProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  // Getrennt vom Bild gehalten, weil die Object-URL bis zum Schliessen des
  // Dialogs leben muss und danach freigegeben wird.
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<CropArea | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const frameRef = useRef<HTMLDivElement>(null)
  // Ziehstart, damit der Rahmen dem Finger genau folgt.
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; cropX: number; cropY: number } | null>(null)

  // Datei laden, sobald eine gewählt wurde.
  useEffect(() => {
    if (!file) {
      setImage(null)
      setImageUrl(null)
      setCrop(null)
      setError(null)
      return
    }
    let cancelled = false
    let loadedUrl: string | null = null
    setError(null)
    loadImage(file)
      .then(({ image: img, url }) => {
        loadedUrl = url
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        setImage(img)
        setImageUrl(url)
        setCrop(centeredCrop(img.naturalWidth, img.naturalHeight, aspect))
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
      if (loadedUrl) URL.revokeObjectURL(loadedUrl)
    }
  }, [file, aspect])

  /** Der grösstmögliche Ausschnitt — der Bezugswert für den Regler. */
  const maxCrop = useMemo(
    () => (image ? centeredCrop(image.naturalWidth, image.naturalHeight, aspect) : null),
    [image, aspect]
  )

  /** Umrechnung Bildpixel in Prozent der Anzeigefläche. */
  const overlay = useMemo(() => {
    if (!image || !crop) return null
    return {
      left: (crop.x / image.naturalWidth) * 100,
      top: (crop.y / image.naturalHeight) * 100,
      width: (crop.width / image.naturalWidth) * 100,
      height: (crop.height / image.naturalHeight) * 100,
    }
  }, [image, crop])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!crop) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
    }
  }, [crop])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    const frame = frameRef.current
    if (!drag || !image || !frame || drag.pointerId !== e.pointerId) return

    const rect = frame.getBoundingClientRect()
    // Verhältnis Anzeige zu Originalbild, damit eine Fingerbreite auf dem
    // Schirm derselben Strecke im Bild entspricht.
    const scaleX = image.naturalWidth / rect.width
    const scaleY = image.naturalHeight / rect.height

    setCrop((prev) => prev && clampCrop({
      ...prev,
      x: drag.cropX + (e.clientX - drag.startX) * scaleX,
      y: drag.cropY + (e.clientY - drag.startY) * scaleY,
    }, image.naturalWidth, image.naturalHeight, aspect))
  }, [image, aspect])

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  /** Regler: 100 % ist der grösstmögliche Ausschnitt, 30 % der engste. */
  const zoomPercent = crop && maxCrop ? Math.round((crop.width / maxCrop.width) * 100) : 100

  const setZoom = useCallback((percent: number) => {
    if (!image || !crop || !maxCrop) return
    const nextWidth = (percent / 100) * maxCrop.width
    // Um die Mitte des bisherigen Ausschnitts herum zoomen, nicht um die Ecke:
    // sonst wandert das Motiv beim Zoomen aus dem Rahmen.
    const centerX = crop.x + crop.width / 2
    const centerY = crop.y + crop.height / 2
    setCrop(clampCrop({
      width: nextWidth,
      height: nextWidth / aspect,
      x: centerX - nextWidth / 2,
      y: centerY - nextWidth / aspect / 2,
    }, image.naturalWidth, image.naturalHeight, aspect))
  }, [image, crop, maxCrop, aspect])

  const reset = useCallback(() => {
    if (image) setCrop(centeredCrop(image.naturalWidth, image.naturalHeight, aspect))
  }, [image, aspect])

  const confirm = useCallback(async () => {
    if (!image || !crop) return
    setBusy(true)
    setError(null)
    try {
      onConfirm(await cropImage(image, crop))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Zuschnitt fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }, [image, crop, onConfirm])

  return (
    <Dialog open={file !== null} onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ausschnitt wählen</DialogTitle>
          <DialogDescription>
            Auf den Künstlerkarten wird dein Bild auf ein festes Format gebracht.
            Zieh den Rahmen dorthin, wo du am besten zu sehen bist.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-300" role="alert">{error}</p>
        )}

        {image && imageUrl && overlay ? (
          <>
            {/* Der Rahmen nimmt seine Groesse vom Bild, nicht das Bild vom
                Rahmen. Ein fester Container mit aspect-ratio und max-height
                verfehlte das Verhaeltnis, sobald die Hoehe begrenzt wurde: der
                Ausschnitt erschien dann rechteckig statt quadratisch. So passt
                die Flaeche immer genau auf das angezeigte Bild, und die
                Prozentwerte des Rahmens stimmen. */}
            <div className="flex justify-center">
              <div
                ref={frameRef}
                className="relative inline-block cursor-move touch-none select-none overflow-hidden rounded-lg bg-black/40"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                className="pointer-events-none block max-h-[50vh] w-auto max-w-full"
              />
              {/* Alles ausserhalb des Rahmens abdunkeln, damit sichtbar ist,
                  was später wegfällt. Vier Flächen sind hier robuster als ein
                  clip-path, weil sie in jedem Browser gleich rechnen. */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 bg-black/55" style={{ height: `${overlay.top}%` }} />
                <div
                  className="absolute inset-x-0 bottom-0 bg-black/55"
                  style={{ height: `${Math.max(0, 100 - overlay.top - overlay.height)}%` }}
                />
                <div
                  className="absolute left-0 bg-black/55"
                  style={{ top: `${overlay.top}%`, height: `${overlay.height}%`, width: `${overlay.left}%` }}
                />
                <div
                  className="absolute right-0 bg-black/55"
                  style={{
                    top: `${overlay.top}%`,
                    height: `${overlay.height}%`,
                    width: `${Math.max(0, 100 - overlay.left - overlay.width)}%`,
                  }}
                />
                <div
                  className="absolute rounded-sm border-2 border-white/90"
                  style={{
                    left: `${overlay.left}%`,
                    top: `${overlay.top}%`,
                    width: `${overlay.width}%`,
                    height: `${overlay.height}%`,
                  }}
                />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ZoomIn className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              <Slider
                aria-label="Grösse des Ausschnitts"
                min={30}
                max={100}
                step={1}
                value={[zoomPercent]}
                onValueChange={([v]) => setZoom(v)}
              />
              <button
                type="button"
                onClick={reset}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-200"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Zurücksetzen
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Original {image.naturalWidth} mal {image.naturalHeight} Pixel.
              Gespeichert wird der Ausschnitt auf höchstens {PROFILE_IMAGE_SIZE} Pixel verkleinert.
            </p>
          </>
        ) : (
          !error && <p className="py-8 text-center text-sm text-gray-400">Bild wird geladen…</p>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Abbrechen
          </Button>
          <Button type="button" onClick={confirm} disabled={busy || !image || !crop}>
            <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            {busy ? 'Wird zugeschnitten…' : 'Ausschnitt übernehmen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
