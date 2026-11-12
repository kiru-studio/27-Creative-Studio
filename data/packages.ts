// ==========================================
// PACKAGES / WAYS OF WORKING DATA LAYER
// ==========================================
// Flexible engagement tiers based on 27 Creative Studio's core offerings.

export interface Package {
  id: string;
  tierNumber: string;
  tierLabel?: string;
  name: string;
  tagline: string;
  deliverables: string[];
  includes?: string;
  cta: string;
  serial?: string;
  badge?: string;
  popular?: boolean;
  stats?: Record<string, string>;
}

export const packages: Package[] = [
  {
    id: "instagram-handling",
    tierNumber: "WAY / 01",
    name: "Instagram Page Handling",
    tagline: "Full-service management for steady follower growth and local reach.",
    deliverables: [
      "Reels production",
      "story updates",
      "posting & hashtags",
      "Google profile setup",
    ],
    cta: "TALK TO US",
    serial: "BM0104650090G",
    popular: false,
  },
  {
    id: "reels-sprint",
    tierNumber: "WAY / 02",
    name: "Reels & Video Sprint",
    tagline: "High-impact video content for campaigns, festivals, and showroom events.",
    deliverables: [
      "Concept planning",
      "on-location shoot",
      "viral hooks & motion design",
    ],
    cta: "TALK TO US",
    serial: "BM0204650090G",
    popular: false,
  },
  {
    id: "local-growth",
    tierNumber: "WAY / 03",
    name: "Full Local Growth",
    tagline: "End-to-end dominance across Instagram, multi-accounts, and Google Maps.",
    deliverables: [
      "Instagram handling",
      "2nd account scaling",
      "event coverage",
      "Google reviews setup",
    ],
    cta: "TALK TO US",
    serial: "BM0304650090G",
    popular: false,
  },
];

export interface ComparisonRow {
  feature: string;
  tier1: string | boolean;
  tier2: string | boolean;
  tier3: string | boolean;
}

export const packageComparisonRows: ComparisonRow[] = [
  {
    feature: "Reel Production & Cinematography",
    tier1: "4-6 / month",
    tier2: "8-12 Sprint Reels",
    tier3: "16+ High-Velocity Reels",
  },
  {
    feature: "Story Updates & Audience Engagement",
    tier1: "Weekly Batches",
    tier2: "Event Stories",
    tier3: "Daily Active Stories",
  },
  {
    feature: "On-Location Shoot Access",
    tier1: "Half-Day / mo",
    tier2: "Full Production Sprint",
    tier3: "Dedicated Multi-Day Access",
  },
  {
    feature: "Viral Script & Hook Ideation",
    tier1: true,
    tier2: true,
    tier3: true,
  },
  {
    feature: "Showroom & Live Event Coverage",
    tier1: false,
    tier2: "Optional Add-on",
    tier3: true,
  },
  {
    feature: "Multi-Account & 2nd Brand Scaling",
    tier1: false,
    tier2: false,
    tier3: true,
  },
  {
    feature: "Google Maps & Local Search Visibility",
    tier1: true,
    tier2: false,
    tier3: true,
  },
  {
    feature: "Delivery Turnaround Time",
    tier1: "48 - 72 Hours",
    tier2: "24 - 48 Hours",
    tier3: "Priority Same-Day",
  },
  {
    feature: "Dedicated WhatsApp Access",
    tier1: "Standard Access",
    tier2: "Direct WhatsApp Line",
    tier3: "24/7 Priority Director",
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
