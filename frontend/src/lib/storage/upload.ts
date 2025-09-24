import { SupabaseClient } from "@supabase/supabase-js";

const PROFILE_BUCKET = import.meta.env.VITE_SUPABASE_PROFILE_BUCKET || "profiles";

export async function uploadProfileImage(
  file: File | null,
  artistId: string,
  bucket: string,
  supabaseClient: SupabaseClient,
  setProfileImageUrl: (url: string) => void,
  setBackendDebug: (msg: string) => void,
  existingUrl: string | null = ""
) {
  if (!file) return existingUrl || "";
  let ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ext || ext.length > 5) {
    const mime = file.type;
    if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
    else if (mime.includes("png")) ext = "png";
    else if (mime.includes("webp")) ext = "webp";
    else ext = "jpg";
  }
  const path = `artist/${artistId}/${Date.now()}.${ext}`;
  const { error } = await supabaseClient.storage.from(PROFILE_BUCKET).upload(path, file, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(PROFILE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadGalleryImages(
  files: File[],
  artistId: string,
  bucket: string,
  supabaseClient: SupabaseClient,
  existingUrls: string[],
  setGalleryUrls: (urls: string[]) => void
) {
  if (!files || files.length === 0) return existingUrls || [];
  const out: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    let ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!ext || ext.length > 5) {
      const mime = f.type;
      if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
      else if (mime.includes("png")) ext = "png";
      else if (mime.includes("webp")) ext = "webp";
      else ext = "jpg";
    }
    const path = `artist/${artistId}/gallery/${Date.now()}-${i}.${ext}`;
    const { error } = await supabaseClient.storage.from(PROFILE_BUCKET).upload(path, f, {
      contentType: f.type || `image/${ext}`,
      upsert: false,
    });
    if (error) continue;
    const { data } = supabaseClient.storage.from(PROFILE_BUCKET).getPublicUrl(path);
    if (data?.publicUrl) out.push(data.publicUrl);
  }
  return [...existingUrls, ...out];
}

/**
 * Downscale an image File in-browser using Canvas.
 * - Respects aspect ratio
 * - Limits longest edge to `maxSize`
 * - Encodes to JPEG/WebP depending on browser support
 */
export async function downscaleImage(
  file: File,
  maxSize: number = 1600,
  quality: number = 0.85
): Promise<File> {
  if (!/^image\//.test(file.type)) return file;

  const img = document.createElement('img');
  const objectUrl = URL.createObjectURL(file);
  img.src = objectUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  let { width, height } = img;
  if (width <= maxSize && height <= maxSize) {
    URL.revokeObjectURL(objectUrl);
    return file;
  }

  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height >= width && height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(objectUrl);

  const mimeCandidates = ['image/webp', 'image/jpeg'];
  let outType = 'image/jpeg';
  for (const m of mimeCandidates) {
    if (canvas.toDataURL(m).startsWith(`data:${m}`)) {
      outType = m;
      break;
    }
  }

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || new Blob([file], { type: file.type })), outType, quality)
  );

  const newName = file.name.replace(/\.[^.]+$/, outType === 'image/webp' ? '.webp' : '.jpg');
  return new File([blob], newName, { type: outType, lastModified: Date.now() });
}

/** Downscale multiple images sequentially. */
export async function downscaleImages(
  files: File[],
  maxSize = 1600,
  quality = 0.85
): Promise<File[]> {
  const out: File[] = [];
  for (const f of files) {
    // eslint-disable-next-line no-await-in-loop
    out.push(await downscaleImage(f, maxSize, quality));
  }
  return out;
}