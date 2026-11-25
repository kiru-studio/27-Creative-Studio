export const SITE_ENTRANCE_KEY = "27_site_entrance_ts";

declare global {
  interface Window {
    __27SiteEntranceTs?: number;
  }
}

/**
 * Records the timestamp of the user's first entrance in this browser session.
 * Safe to call multiple times; preserves the earliest timestamp.
 */
export function recordSiteEntrance(): number {
  const now = Date.now();
  if (typeof window === "undefined") return now;

  try {
    const existing = sessionStorage.getItem(SITE_ENTRANCE_KEY);
    if (existing) {
      const parsed = Number(existing);
      if (Number.isFinite(parsed) && parsed > 0) {
        window.__27SiteEntranceTs = parsed;
        return parsed;
      }
    }
    sessionStorage.setItem(SITE_ENTRANCE_KEY, String(now));
  } catch {
    // Ignore sessionStorage errors in private/restricted contexts
  }

  if (!window.__27SiteEntranceTs) {
    window.__27SiteEntranceTs = now;
  }
  return window.__27SiteEntranceTs;
}

/**
 * Returns the recorded first-entrance timestamp (ms since epoch), or null if unavailable.
 */
export function getSiteEntranceTime(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(SITE_ENTRANCE_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  } catch {
    // Ignore storage errors
  }

  if (typeof window.__27SiteEntranceTs === "number" && window.__27SiteEntranceTs > 0) {
    return window.__27SiteEntranceTs;
  }
  return null;
}

/**
 * Formats a duration in milliseconds into a human-readable string (e.g. "42s", "3m 18s", "1h 12m 5s").
 */
export function formatTimeOnSite(ms: number): string {
  const safeMs = Math.max(0, ms);
  const totalSec = Math.round(safeMs / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m ${secs}s`;
}

/**
 * Extracts the formatted "Time on site" duration from CRM inquiry notes.
 */
export function extractTimeOnSiteFromNotes(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/Time on site:\s*([^.]+)/i);
  return match?.[1]?.trim() || null;
}
