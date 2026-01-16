import { put, del } from "@vercel/blob";

/**
 * Vercel Blob Storage Upload Service
 *
 * Folder Structure:
 * - artists/{artistId}/profile.webp     - Profile image (1 per artist)
 * - artists/{artistId}/hero.webp        - Hero/banner image (1 per artist)
 * - artists/{artistId}/gallery/{ts}.webp - Gallery images (multiple)
 * - invoices/{artistId}/{filename}      - Invoice documents
 */

export type UploadType = 'profile' | 'hero' | 'gallery' | 'invoice';

interface UploadResult {
  url: string;
  pathname: string;
}

/**
 * Generate the storage path based on upload type
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
 * Convert image to WebP format using canvas
 */
async function convertToWebP(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Resize if needed while maintaining aspect ratio
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
 * Upload a profile image to Vercel Blob
 */
export async function uploadProfileImage(
  file: File | null,
  artistId: string,
  setImageUrl: (url: string | null) => void,
  setDebug?: (message: string) => void,
  existingUrl: string | null = null
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  try {
    setDebug?.('Converting profile image to WebP...');
    const webpBlob = await convertToWebP(file, 800, 800, 0.9);
    const pathname = getStoragePath(artistId, 'profile');

    setDebug?.(`Uploading to Vercel Blob: ${pathname}`);
    const { url } = await put(pathname, webpBlob, {
      access: 'public',
      contentType: 'image/webp',
    });

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
 * Upload a hero/banner image to Vercel Blob
 */
export async function uploadHeroImage(
  file: File | null,
  artistId: string,
  setImageUrl: (url: string | null) => void,
  setDebug?: (message: string) => void,
  existingUrl: string | null = null
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  try {
    setDebug?.('Converting hero image to WebP...');
    const webpBlob = await convertToWebP(file, 1920, 1080, 0.85);
    const pathname = getStoragePath(artistId, 'hero');

    setDebug?.(`Uploading hero to Vercel Blob: ${pathname}`);
    const { url } = await put(pathname, webpBlob, {
      access: 'public',
      contentType: 'image/webp',
    });

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
 * Upload multiple gallery images to Vercel Blob
 */
export async function uploadGalleryImages(
  files: File[],
  artistId: string,
  existingUrls: string[],
  setGalleryUrls: (urls: string[]) => void,
  setDebug?: (message: string) => void
): Promise<string[]> {
  if (!files || files.length === 0) {
    return existingUrls;
  }

  try {
    setDebug?.(`Uploading ${files.length} gallery images...`);

    const uploadPromises = files.map(async (file, index) => {
      const webpBlob = await convertToWebP(file, 1200, 1200, 0.85);
      // Add index to ensure unique timestamps
      const pathname = `artists/${artistId}/gallery/${Date.now()}_${index}.webp`;

      const { url } = await put(pathname, webpBlob, {
        access: 'public',
        contentType: 'image/webp',
      });

      return url;
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
 * Upload an invoice document to Vercel Blob
 */
export async function uploadInvoice(
  file: File,
  artistId: string,
  setDebug?: (message: string) => void
): Promise<string | null> {
  try {
    const pathname = getStoragePath(artistId, 'invoice', file.name);

    setDebug?.(`Uploading invoice: ${pathname}`);
    const { url } = await put(pathname, file, {
      access: 'public',
      contentType: file.type || 'application/pdf',
    });

    setDebug?.(`Invoice uploaded: ${url}`);
    return url;
  } catch (error: any) {
    setDebug?.(`Invoice upload failed: ${error.message}`);
    console.error('Invoice upload error:', error);
    return null;
  }
}

/**
 * Delete a file from Vercel Blob
 */
export async function deleteFromBlob(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
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
  setGalleryUrls: (urls: string[]) => void
): Promise<string[]> {
  const success = await deleteFromBlob(urlToDelete);
  if (success) {
    const newUrls = currentUrls.filter(url => url !== urlToDelete);
    setGalleryUrls(newUrls);
    return newUrls;
  }
  return currentUrls;
}
