/**
 * Bildausschnitt für Profilbilder.
 *
 * Bisher lud der Artist ein Bild in beliebigem Format hoch, und der Browser
 * schnitt beim Anzeigen mit `object-cover` mittig zu. Bei einem Hochformat in
 * einem breiteren Rahmen fielen so Kopf oder Füße weg, ohne dass jemand
 * Einfluss darauf hatte.
 *
 * Deshalb wird der Ausschnitt jetzt beim Hochladen festgelegt, vom Artist
 * selbst, und das Bild kommt bereits im Zielformat im Speicher an.
 *
 * Das Seitenverhältnis ist bewusst eine Einstellung und keine feste Annahme:
 * Die Anzeigeorte sind sich im Bestand nicht einig. `PreviewCards` benutzt
 * `aspect-[3/4]`, die öffentliche `ArtistCardFinal` einen Rahmen von etwa
 * 0,9 zu 1, und die kleinen Vorschauen sind quadratisch. Solange das so ist,
 * schneidet jeder Rahmen noch etwas nach; über PROFILE_ASPECT lässt sich der
 * Zuschnitt an einer Stelle umstellen, sobald die Rahmen vereinheitlicht sind.
 */

/** Längste Kante des gespeicherten Profilbilds in Pixeln. */
export const PROFILE_IMAGE_SIZE = 800

/**
 * Seitenverhältnis des Profilbilds als Breite geteilt durch Höhe.
 * 1 ist quadratisch, 0.75 wäre ein Hochformat im Verhältnis 3 zu 4.
 */
export const PROFILE_ASPECT = 1

/**
 * Bildausschnitt in Pixeln des Originalbilds.
 * In Pixeln statt in Anteilen, weil `drawImage` genau das erwartet.
 */
export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface LoadedImage {
  image: HTMLImageElement
  /** Object-URL des Bildes. Der Aufrufer muss sie freigeben, wenn er fertig ist. */
  url: string
}

/**
 * Lädt eine Datei als `HTMLImageElement`.
 *
 * Die Object-URL wird bei Erfolg **nicht** freigegeben: Sie wird noch gebraucht,
 * um dasselbe Bild im Dialog anzuzeigen. Ein früherer Stand gab sie sofort
 * frei — der Dialog zeigte dann nur ein kaputtes Bildsymbol, weil die URL beim
 * Rendern schon tot war. Freigegeben wird sie im Aufrufer, sobald er das Bild
 * nicht mehr braucht.
 */
export function loadImage(file: File | Blob): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ image: img, url })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Bild konnte nicht gelesen werden.'))
    }
    img.src = url
  })
}

/** Begrenzt einen Wert auf [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Der grösstmögliche mittige Ausschnitt im gewünschten Seitenverhältnis.
 * Das ist der Startwert im Dialog, damit der Artist im Regelfall nur noch
 * bestätigen muss.
 */
export function centeredCrop(width: number, height: number, aspect = PROFILE_ASPECT): CropArea {
  // Entweder die Breite oder die Höhe ist der begrenzende Faktor.
  let cropWidth = width
  let cropHeight = width / aspect
  if (cropHeight > height) {
    cropHeight = height
    cropWidth = height * aspect
  }
  return {
    x: (width - cropWidth) / 2,
    y: (height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  }
}

/**
 * Hält einen Ausschnitt vollständig innerhalb des Bildes und im Seitenverhältnis.
 * Ohne das kann durch Ziehen oder Zoomen ein Rand mit leeren Pixeln entstehen.
 */
export function clampCrop(
  crop: CropArea,
  width: number,
  height: number,
  aspect = PROFILE_ASPECT
): CropArea {
  const maxCrop = centeredCrop(width, height, aspect)
  // Untergrenze so wählen, dass ein sinnvoller Ausschnitt bleibt, aber niemals
  // mehr als das Bild hergibt.
  const minWidth = Math.min(48, maxCrop.width)
  const cropWidth = clamp(crop.width, minWidth, maxCrop.width)
  const cropHeight = cropWidth / aspect
  return {
    width: cropWidth,
    height: cropHeight,
    x: clamp(crop.x, 0, width - cropWidth),
    y: clamp(crop.y, 0, height - cropHeight),
  }
}

/**
 * Schneidet den gewählten Bereich aus und skaliert ihn auf höchstens
 * `maxSize` an der längeren Kante.
 *
 * Rückgabe ist ein WebP-Blob. Das Bild wird nie hochskaliert: Ist der
 * Ausschnitt kleiner als `maxSize`, bleibt seine tatsächliche Auflösung
 * erhalten, statt Pixel zu erfinden.
 */
export async function cropImage(
  image: HTMLImageElement,
  crop: CropArea,
  maxSize = PROFILE_IMAGE_SIZE,
  quality = 0.9
): Promise<Blob> {
  const scale = Math.min(1, maxSize / Math.max(crop.width, crop.height))
  const targetWidth = Math.max(1, Math.round(crop.width * scale))
  const targetHeight = Math.max(1, Math.round(crop.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas steht nicht zur Verfügung.')
  }

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, targetWidth, targetHeight
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Bild konnte nicht umgewandelt werden.'))
      },
      'image/webp',
      quality
    )
  })
}
