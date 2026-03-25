/**
 * Image Upload Service - uploads via backend API
 *
 * Folder Structure (handled by backend):
 * - artists/{artistId}/profile.webp     - Profile image (1 per artist)
 * - artists/{artistId}/hero.webp        - Hero/banner image (1 per artist)
 * - artists/{artistId}/gallery/{ts}.webp - Gallery images (multiple)
 * - invoices/{artistId}/{filename}      - Invoice documents
 */

export type UploadType = 'profile' | 'hero' | 'gallery' | 'invoice';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Convert image to WebP format using canvas
 */
async function convertToWebP(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert to WebP'));
            }
          },
          'image/webp',
          quality
        );
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload file to backend which proxies to Vercel Blob
 */
async function uploadToBackend(
  blob: Blob,
  artistId: string,
  type: UploadType,
  token: string,
  filename?: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, filename || `${type}.webp`);
  formData.append('type', type);
  formData.append('artist_id', artistId);

  const res = await fetch(`${API_URL}/api/upload/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.url;
}

/**
 * Get the auth token from the current session
 */
function getAuthToken(): string {
  // Will be passed from calling code
  return '';
}

/**
 * Upload a profile image via backend
 */
export async function uploadProfileImage(
  file: File | null,
  artistId: string,
  setImageUrl: (url: string | null) => void,
  setDebug?: (message: string) => void,
  existingUrl: string | null = null,
  authToken?: string
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  try {
    setDebug?.('Converting profile image to WebP...');
    const webpBlob = await convertToWebP(file, 800, 800, 0.9);

    setDebug?.(`Uploading profile image...`);
    const url = await uploadToBackend(webpBlob, artistId, 'profile', authToken || '');

    setImageUrl(url);
    setDebug?.(`Profile image uploaded: ${url}`);
    return url;
  } catch (error: any) {
    setDebug?.(`Profile image upload failed: ${error.message}`);
    console.error('Profile upload error:', error);
    return existingUrl;
  }
}

/**
 * Upload a hero/banner image via backend
 */
export async function uploadHeroImage(
  file: File | null,
  artistId: string,
  setImageUrl: (url: string | null) => void,
  setDebug?: (message: string) => void,
  existingUrl: string | null = null,
  authToken?: string
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  try {
    setDebug?.('Converting hero image to WebP...');
    const webpBlob = await convertToWebP(file, 1920, 1080, 0.85);

    setDebug?.(`Uploading hero image...`);
    const url = await uploadToBackend(webpBlob, artistId, 'hero', authToken || '');

    setImageUrl(url);
    setDebug?.(`Hero image uploaded: ${url}`);
    return url;
  } catch (error: any) {
    setDebug?.(`Hero image upload failed: ${error.message}`);
    console.error('Hero upload error:', error);
    return existingUrl;
  }
}

/**
 * Upload multiple gallery images via backend
 */
export async function uploadGalleryImages(
  files: File[],
  artistId: string,
  existingUrls: string[],
  setGalleryUrls: (urls: string[]) => void,
  setDebug?: (message: string) => void,
  authToken?: string
): Promise<string[]> {
  if (!files || files.length === 0) {
    return existingUrls;
  }

  try {
    setDebug?.(`Uploading ${files.length} gallery images...`);

    const uploadPromises = files.map(async (file) => {
      const webpBlob = await convertToWebP(file, 1200, 1200, 0.85);
      return uploadToBackend(webpBlob, artistId, 'gallery', authToken || '');
    });

    const newUrls = await Promise.all(uploadPromises);
    const allUrls = [...existingUrls, ...newUrls];
    setGalleryUrls(allUrls);
    setDebug?.(`Gallery upload complete: ${newUrls.length} images added`);
    return allUrls;
  } catch (error: any) {
    setDebug?.(`Gallery upload failed: ${error.message}`);
    console.error('Gallery upload error:', error);
    return existingUrls;
  }
}

/**
 * Upload an invoice document via backend
 */
export async function uploadInvoice(
  file: File,
  artistId: string,
  setDebug?: (message: string) => void,
  authToken?: string
): Promise<string | null> {
  try {
    setDebug?.(`Uploading invoice: ${file.name}`);
    const url = await uploadToBackend(file, artistId, 'invoice', authToken || '', file.name);

    setDebug?.(`Invoice uploaded: ${url}`);
    return url;
  } catch (error: any) {
    setDebug?.(`Invoice upload failed: ${error.message}`);
    console.error('Invoice upload error:', error);
    return null;
  }
}

/**
 * Delete a file via backend
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
