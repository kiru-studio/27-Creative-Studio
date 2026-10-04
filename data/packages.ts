// ==========================================
// PACKAGES / WAYS OF WORKING DATA LAYER
// ==========================================
// Flexible engagement tiers based on 27 Creative Studio's core offerings.

export interface Package {
  id: string;
  name: string;
  tagline: string;
  includes: string;
  cta: string;
  stats?: Record<string, string>;
}

export const packages: Package[] = [
  {
    id: "instagram-handling",
    name: "Instagram page handling",
    tagline: "Full-service management for steady follower growth and local reach.",
    includes: "Reels production · story updates · posting & hashtags · Google profile setup",
    cta: "Talk to us",
  },
  {
    id: "reels-sprint",
    name: "Reels & video sprint",
    tagline: "High-impact video content for campaigns, festivals, and showroom events.",
    includes: "Concept planning · on-location shoot · viral hooks & motion design",
    cta: "Talk to us",
  },
  {
    id: "local-growth",
    name: "Full local growth",
    tagline: "End-to-end dominance across Instagram, multi-accounts, and Google Maps.",
    includes: "Instagram handling · 2nd account scaling · event coverage · Google reviews setup",
    cta: "Talk to us",
  },
];

/**
 * Derives the unique union of stats keys across all packages if defined.
 */
export function getStatsKeys(packageList: Package[]): string[] {
  const keysSet = new Set<string>();
  for (const pkg of packageList) {
    if (pkg.stats) {
      for (const k of Object.keys(pkg.stats)) {
        keysSet.add(k);
      }
    }
  }
  return Array.from(keysSet);
}
