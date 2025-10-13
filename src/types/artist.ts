

// Shared Artist type and small utilities used by ArtistCard components
// ---------------------------------------------------------------

export interface Artist {
  /** Unique identifier */
  id?: number;
  /** Full display name */
  name: string;
  /** Primary/cover image URL shown on the front */
  image?: string;
  /** Alternative field for profile image from API */
  profile_image_url?: string;
  /** Full biography text (may contain multiple sentences) */
  bio?: string;
  /** List of disciplines/skills shown as badges */
  disciplines?: string[];
  /** Optional short quote; if missing, derive the first sentence from bio */
  quote?: string;
  /** Optional gallery with relative/local paths */
  gallery?: string[];
  /** Optional gallery with absolute/external URLs */
  gallery_urls?: string[];
  /** Instagram handle or full URL (e.g. "@myname" or "https://instagram.com/myname") */
  instagram?: string;
  /** Price range for services */
  price_range?: string;
  /** Availability status */
  availability?: string;
  /** Social media links */
  social_links?: {
    instagram?: string;
    website?: string;
  };
  /** Video links */
  videos?: {
    main?: string;
    gallery?: string[];
  };
}

/**
 * Returns the first sentence from a text without forcing extra punctuation.
 * If the text has no clear sentence end, returns the original string trimmed.
 */
export function getFirstSentence(text: string | undefined | null): string {
  const t = (text ?? "").trim();
  if (!t) return "";
  // Match up to the first ., !, ?, or … followed by a space or end of string
  const match = t.match(/^(.*?[\.!\?…])(\s|$)/u);
  return (match && match[1]) ? match[1].trim() : t;
}

/**
 * Merges `gallery` and `gallery_urls` into a single, de-duplicated list.
 */
export function mergeGallery(artist: Artist): string[] {
  const local = Array.isArray(artist.gallery) ? artist.gallery : [];
  const remote = Array.isArray(artist.gallery_urls) ? artist.gallery_urls : [];
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const src of [...local, ...remote]) {
    if (typeof src !== "string") continue;
    const s = src.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    merged.push(s);
  }
  return merged;
}

/**
 * Gets the primary image for an artist (their main profile image).
 * Checks both 'image' and 'profile_image_url' fields for compatibility.
 */
export function getPrimaryImage(artist: Artist): string | undefined {
  // Try both possible field names for the main image
  const imageUrl = artist.image?.trim() || artist.profile_image_url?.trim();
  return imageUrl || undefined;
}

/**
 * Normalizes an Instagram handle or URL to a full URL.
 * - "@user" -> https://instagram.com/user
 * - "user"  -> https://instagram.com/user
 * - already a URL -> returned as-is
 */
export function normalizeInstagram(instagram?: string): string | undefined {
  if (!instagram) return undefined;
  const raw = instagram.trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.startsWith("@") ? raw.slice(1) : raw;
  return `https://instagram.com/${encodeURIComponent(handle)}`;
}