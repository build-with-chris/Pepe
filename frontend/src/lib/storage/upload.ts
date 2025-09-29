import { SupabaseClient } from "@supabase/supabase-js";

// NEW: Backend-based upload with image processing
export async function uploadImageViaBackend(
  file: File,
  type: 'profile' | 'gallery',
  token: string,
  setDebug: (message: string) => void
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const apiUrl = import.meta.env.VITE_API_URL;

    const response = await fetch(`${apiUrl}/api/artists/me/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    setDebug(`${type} image uploaded and processed successfully`);
    return result.url;

  } catch (error: any) {
    setDebug(`${type} image upload failed: ${error.message}`);
    return null;
  }
}

export async function uploadProfileImage(
  file: File | null,
  artistId: string,
  bucket: string,
  supabase: SupabaseClient,
  setImageUrl: (url: string | null) => void,
  setDebug: (message: string) => void,
  existingUrl: string | null = null
): Promise<string | null> {
  if (!file) {
    return existingUrl;
  }

  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${artistId}/profile.${fileExtension}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    setImageUrl(publicUrl);
    return publicUrl;
  } catch (error: any) {
    setDebug(`Profile image upload failed: ${error.message}`);
    return existingUrl;
  }
}

export async function uploadGalleryImages(
  files: File[],
  artistId: string,
  bucket: string,
  supabase: SupabaseClient,
  existingUrls: string[],
  setGalleryUrls: (urls: string[]) => void
): Promise<string[]> {
  if (!files || files.length === 0) {
    return existingUrls;
  }

  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${artistId}/gallery/${Date.now()}_${index}.${fileExtension}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType: file.type
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    });

    const newUrls = await Promise.all(uploadPromises);
    const allUrls = [...existingUrls, ...newUrls];
    setGalleryUrls(allUrls);
    return allUrls;
  } catch (error: any) {
    console.error('Gallery upload failed:', error);
    return existingUrls;
  }
}