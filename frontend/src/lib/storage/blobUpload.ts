/**
 * Image Upload Service - uploads via Vercel Serverless Function
 *
 * Folder Structure:
 * - artists/{artistId}/profile.webp     - Profile image (1 per artist)
 * - artists/{artistId}/hero.webp        - Hero/banner image (1 per artist)
 * - artists/{artistId}/gallery/{ts}.webp - Gallery images (multiple)
 * - invoices/{artistId}/{filename}      - Invoice documents
 */

export type UploadType = 'profile' | 'hero' | 'gallery' | 'invoice';

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
 * Get storage path based on upload type
 */
function getStoragePath(artistId: string, type: UploadType, filename?: string): string {
  const timestamp = Date.now();

  switch (type) {
    case 'profile':
      return `artists/${artistId}/profile.webp`;
    case 'hero':
      return `artists/${artistId}/hero.webp`;
    case 'gallery':
      return `artists/${artistId}/gallery/${timestamp}.webp`;
    case 'invoice':
      return `invoices/${artistId}/${filename || `invoice_${timestamp}.pdf`}`;
    default:
      return `misc/${artistId}/${timestamp}`;
  }
}

/**
 * Upload file via Vercel Serverless Function at /api/upload
 */
async function uploadViaServerless(
  blob: Blob,
  pathname: string,
  contentType: string = 'image/webp'
): Promise<string> {
  const res = await fetch(`/api/upload?pathname=${encodeURIComponent(pathname)}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.url;
}

/**
 * Upload a profile image
 */
export async function uploadProfileImage(
  file: File | null,
  artistId: string,
  setImageUrl: (url: string | null) => void,
  setDebug?: (message: string) => void,
  existingUrl: string | null = null,
  _authToken?: string
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  try {
    setDebug?.('Converting profile image to WebP...');
    const webpBlob = await convertToWebP(file, 800, 800, 0.9);
    const pathname = getStoragePath(artistId, 'profile');

    setDebug?.(`Uploading profile image...`);
    const url = await uploadViaServerless(webpBlob, pathname);

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
 * Upload a hero/banner image
 */
export async function uploadHeroImage(
  file: File | null,
  artistId: string,
  setImageUrl: (url: string | null) => void,
  setDebug?: (message: string) => void,
  existingUrl: string | null = null,
  _authToken?: string
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  try {
    setDebug?.('Converting hero image to WebP...');
    const webpBlob = await convertToWebP(file, 1920, 1080, 0.85);
    const pathname = getStoragePath(artistId, 'hero');

    setDebug?.(`Uploading hero image...`);
    const url = await uploadViaServerless(webpBlob, pathname);

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
 * Upload multiple gallery images
 */
export async function uploadGalleryImages(
  files: File[],
  artistId: string,
  existingUrls: string[],
  setGalleryUrls: (urls: string[]) => void,
  setDebug?: (message: string) => void,
  _authToken?: string
): Promise<string[]> {
  if (!files || files.length === 0) {
    return existingUrls;
  }

  try {
    setDebug?.(`Uploading ${files.length} gallery images...`);

    const uploadPromises = files.map(async (file, index) => {
      const webpBlob = await convertToWebP(file, 1200, 1200, 0.85);
      const pathname = `artists/${artistId}/gallery/${Date.now()}_${index}.webp`;
      return uploadViaServerless(webpBlob, pathname);
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
 * Upload an invoice document
 */
export async function uploadInvoice(
  file: File,
  artistId: string,
  setDebug?: (message: string) => void,
  _authToken?: string
): Promise<string | null> {
  try {
    const pathname = getStoragePath(artistId, 'invoice', file.name);
    setDebug?.(`Uploading invoice: ${file.name}`);
    const url = await uploadViaServerless(file, pathname, file.type || 'application/pdf');

    setDebug?.(`Invoice uploaded: ${url}`);
    return url;
  } catch (error: any) {
    setDebug?.(`Invoice upload failed: ${error.message}`);
    console.error('Invoice upload error:', error);
    return null;
  }
}

/**
 * Delete a file (via backend)
 */
export async function deleteFromBlob(url: string, authToken?: string): Promise<boolean> {
  try {
    const API_URL = import.meta.env.VITE_API_URL;
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
