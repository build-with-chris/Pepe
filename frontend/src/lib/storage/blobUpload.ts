/**
 * Bild- und Dokumentupload — ausschliesslich über das Backend.
 *
 * Es gibt genau einen Upload-Weg: `POST ${VITE_API_URL}/api/upload/image` mit
 * Clerk-Token. Das Backend prüft die Anmeldung, prüft, dass die `artist_id` die
 * eigene ist, und bildet den Ablagepfad selbst.
 *
 * Vorher lief das über eine Vercel-Funktion (`frontend/api/upload.ts`) ohne
 * jede Anmeldung, mit frei wählbarem Pfad aus dem Query-String und
 * `allowOverwrite: true`. Wer die URL kannte, konnte fremde Profilbilder
 * überschreiben (SPEC-4, Befund O2). Die Funktion ist entfernt.
 *
 * Die Ablagepfade bildet das Backend (`_get_storage_path` in
 * `backend/routes/upload_routes.py`), nicht dieses Modul.
 */

import { PROFILE_IMAGE_SIZE } from '@/lib/imageCrop';

export type UploadType = 'profile' | 'hero' | 'gallery' | 'invoice';

const API_URL = import.meta.env.VITE_API_URL;

/** Upload ist fehlgeschlagen. Wird geworfen, nicht stillschweigend geschluckt. */
export class UploadError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'UploadError';
    this.status = status;
  }
}

/**
 * Convert image to WebP format using canvas
 */
async function convertToWebP(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const objectUrl = URL.createObjectURL(file);

    // Die Object-URL in jedem Ausgang freigeben. Vorher blieb sie bei Fehlern
    // liegen und hielt die Datei im Speicher.
    const settle = (fn: () => void) => {
      URL.revokeObjectURL(objectUrl);
      fn();
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        settle(() => reject(new UploadError('Canvas context not available')));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            settle(() => resolve(blob));
          } else {
            settle(() => reject(new UploadError('Bild konnte nicht in WebP umgewandelt werden.')));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => settle(() => reject(new UploadError('Bild konnte nicht gelesen werden.')));
    img.src = objectUrl;
  });
}

/**
 * Upload über den Backend-Endpunkt. Wirft bei jedem Fehlschlag.
 */
async function uploadViaBackend(
  blob: Blob,
  artistId: string,
  type: UploadType,
  authToken: string,
  filename?: string
): Promise<string> {
  if (!authToken) {
    throw new UploadError('Nicht angemeldet — Upload ohne Token ist nicht möglich.');
  }
  if (!artistId) {
    throw new UploadError('Keine Artist-ID — der Upload würde ins Leere laufen.');
  }

  const form = new FormData();
  form.append('file', blob, filename || `${type}.webp`);
  form.append('type', type);
  form.append('artist_id', artistId);

  let res: Response;
  try {
    // Kein Content-Type-Header: Den multipart-Boundary setzt der Browser.
    res = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: form,
    });
  } catch (err: any) {
    throw new UploadError(`Upload nicht erreichbar: ${err?.message || err}`);
  }

  if (!res.ok) {
    // Die Servermeldung durchreichen — sie nennt Grösse, Inhaltstyp oder
    // fehlende Berechtigung konkret.
    const body = await res.json().catch(() => null);
    const detail = body?.message || body?.error || res.statusText;
    throw new UploadError(`Upload fehlgeschlagen (${res.status}): ${detail}`, res.status);
  }

  const data = await res.json().catch(() => null);
  if (!data?.url) {
    throw new UploadError('Upload ohne URL in der Antwort.');
  }
  return data.url as string;
}

/**
 * Upload a profile image
 */
export async function uploadProfileImage(
  file: File | null,
  artistId: string,
  setImageUrl: (url: string | null) => void,
  setDebug: ((message: string) => void) | undefined,
  existingUrl: string | null,
  authToken: string
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  // Profilbilder laufen durch den Zuschnitt-Dialog (ImageCropDialog) und kommen
  // dort bereits im Zielformat, verkleinert und als WebP heraus. Sie hier
  // erneut umzuwandeln waere ein zweiter Verlustschritt ohne jeden Gewinn.
  // Alles andere wird wie bisher umgewandelt, damit kein Weg offen bleibt, auf
  // dem ein Kamera-Original in Originalgroesse durchrutscht.
  let blob: Blob = file;
  if (file.type !== 'image/webp') {
    setDebug?.('Profilbild wird zu WebP umgewandelt...');
    blob = await convertToWebP(file, PROFILE_IMAGE_SIZE, PROFILE_IMAGE_SIZE, 0.9);
  }

  setDebug?.('Profilbild wird hochgeladen...');
  const url = await uploadViaBackend(blob, artistId, 'profile', authToken);

  setImageUrl(url);
  setDebug?.('Profilbild hochgeladen.');
  return url;
}

/**
 * Upload a hero/banner image
 */
export async function uploadHeroImage(
  file: File | null,
  artistId: string,
  setImageUrl: (url: string | null) => void,
  setDebug: ((message: string) => void) | undefined,
  existingUrl: string | null,
  authToken: string
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  setDebug?.('Titelbild wird zu WebP umgewandelt...');
  const webpBlob = await convertToWebP(file, 1920, 1080, 0.85);

  setDebug?.('Titelbild wird hochgeladen...');
  const url = await uploadViaBackend(webpBlob, artistId, 'hero', authToken);

  setImageUrl(url);
  setDebug?.('Titelbild hochgeladen.');
  return url;
}

/**
 * Upload multiple gallery images
 */
export async function uploadGalleryImages(
  files: File[],
  artistId: string,
  existingUrls: string[],
  setGalleryUrls: (urls: string[]) => void,
  setDebug: ((message: string) => void) | undefined,
  authToken: string
): Promise<string[]> {
  if (!files || files.length === 0) {
    return existingUrls;
  }

  setDebug?.(`${files.length} Galeriebilder werden hochgeladen...`);

  // Nacheinander statt Promise.all: Beim ersten Fehler bricht es ab, und was
  // bereits hochgeladen wurde, steht fest. Parallel liefe der Rest weiter, und
  // der Aufrufer wüsste am Ende nicht, was angekommen ist.
  const newUrls: string[] = [];
  for (const file of files) {
    const webpBlob = await convertToWebP(file, 1200, 1200, 0.85);
    newUrls.push(await uploadViaBackend(webpBlob, artistId, 'gallery', authToken));
  }

  const allUrls = [...existingUrls, ...newUrls];
  setGalleryUrls(allUrls);
  setDebug?.(`Galerie vollständig: ${newUrls.length} Bilder ergänzt.`);
  return allUrls;
}

/**
 * Upload an invoice document
 */
export async function uploadInvoice(
  file: File,
  artistId: string,
  authToken: string,
  setDebug?: (message: string) => void
): Promise<string> {
  setDebug?.(`Rechnung wird hochgeladen: ${file.name}`);
  const url = await uploadViaBackend(file, artistId, 'invoice', authToken, file.name);
  setDebug?.('Rechnung hochgeladen.');
  return url;
}

/**
 * Delete a file (via backend)
 */
export async function deleteFromBlob(url: string, authToken?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/upload/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ url }),
    });
    return res.ok;
  } catch (error) {
    console.error('Delete from blob failed:', error);
    return false;
  }
}

/**
 * Delete a gallery image and update the URLs array
 */
export async function deleteGalleryImage(
  urlToDelete: string,
  currentUrls: string[],
  setGalleryUrls: (urls: string[]) => void,
  authToken?: string
): Promise<string[]> {
  const success = await deleteFromBlob(urlToDelete, authToken);
  if (success) {
    const newUrls = currentUrls.filter(url => url !== urlToDelete);
    setGalleryUrls(newUrls);
    return newUrls;
  }
  return currentUrls;
}
