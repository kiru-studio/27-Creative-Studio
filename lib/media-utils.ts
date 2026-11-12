/**
 * Smart Media Utilities for 27 Creative Studio Admin & Site.
 * Handles Google Drive link conversion, free CDN optimization, and media detection.
 */

export interface ParsedMediaUrl {
  original: string;
  isGoogleDrive: boolean;
  googleDriveId?: string;
  streamUrl: string;
  previewUrl: string;
  posterSuggestionUrl?: string;
  type: "video" | "image" | "unknown";
}

/**
 * Extracts Google Drive File ID from various share link formats:
 * - https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C4D5E
 * - https://drive.google.com/uc?id=1A2B3C4D5E
 * - https://drive.google.com/file/d/1A2B3C4D5E/edit
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  return null;
}

/**
 * Formats a Google Drive link into direct usable URLs:
 * - For images: high-resolution direct thumbnail (`lh3.googleusercontent.com/d/ID=w1920`)
 * - For videos: direct download/stream URL (`drive.google.com/uc?export=download&id=ID`)
 */
export function parseMediaUrl(url: string, explicitType?: "video" | "image"): ParsedMediaUrl {
  const trimmed = (url || "").trim();
  const driveId = extractGoogleDriveId(trimmed);

  if (driveId) {
    const isVideo = explicitType === "video" || /video/i.test(trimmed);
    const streamUrl = isVideo
      ? `https://drive.google.com/uc?export=download&id=${driveId}`
      : `https://lh3.googleusercontent.com/d/${driveId}=w1920`;

    return {
      original: trimmed,
      isGoogleDrive: true,
      googleDriveId: driveId,
      streamUrl,
      previewUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      posterSuggestionUrl: `https://lh3.googleusercontent.com/d/${driveId}=w1920`,
      type: isVideo ? "video" : "image",
    };
  }

  // Cloudinary detection & poster helper
  let posterSuggestion: string | undefined;
  if (/res\.cloudinary\.com/i.test(trimmed) && /\.(mp4|webm|mov)$/i.test(trimmed)) {
    posterSuggestion = trimmed.replace(/\.(mp4|webm|mov)$/i, ".jpg");
  }

  const isVideo =
    explicitType === "video" ||
    /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(trimmed) ||
    /video/i.test(trimmed);

  return {
    original: trimmed,
    isGoogleDrive: false,
    streamUrl: trimmed,
    previewUrl: trimmed,
    posterSuggestionUrl: posterSuggestion,
    type: isVideo ? "video" : "image",
  };
}

/**
 * Normalizes any user-entered media URL before saving to content JSON.
 * If user pasted a Google Drive share link, automatically converts it
 * to the direct streamable/embeddable format.
 */
export function normalizeMediaInput(rawUrl: string, mediaType: "video" | "image"): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  const driveId = extractGoogleDriveId(trimmed);
  if (!driveId) return trimmed;

  if (mediaType === "image") {
    // High-resolution Google Photos CDN link for drive images
    return `https://lh3.googleusercontent.com/d/${driveId}=w1920`;
  }

  // Direct video stream format
  return `https://drive.google.com/uc?export=download&id=${driveId}`;
}
