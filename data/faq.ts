import { Package } from "@/data/packages";
import { siteConfig } from "@/data/siteConfig";

// ==========================================
// FAQ DATA & TOKEN RESOLUTION
// ==========================================

export type FaqCategory =
  | "Packages"
  | "Process"
  | "Pricing"
  | "Shoot day"
  | "Delivery"
  | "Rights"
  | "Posting"
  | "Working together";

export interface FaqItem {
  id: string;
  category: FaqCategory | string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  // Packages
  {
    id: "pkg-right-package",
    category: "Packages",
    question: "Which option is right for my business?",
    answer:
      "Look at our 3 ways of working above ({packageNames}): steady monthly growth suits 'Instagram page handling', targeted campaign assets suit 'Reels & video sprint', and total local dominance across multiple accounts and Google Maps becomes 'Full local growth'. We tailor every scope to what drives footfall and sales in Thoothukudi.",
  },
  {
    id: "pkg-fixed-numbers",
    category: "Packages",
    question: "Why don't you offer rigid, one-size-fits-all quotas?",
    answer:
      "Every business in Thoothukudi has different dynamics—a restaurant needs mouthwatering food close-ups and ambience, while a car showroom needs customer delivery trust and vehicle walkarounds. Forcing a rigid formula creates filler content. We shape every shoot to move real business metrics.",
  },
  {
    id: "pkg-reel-vs-film",
    category: "Packages",
    question: "What counts as a reel and a film?",
    answer:
      "A reel is a punchy vertical piece (9:16) made for high-velocity social attention and trending audio. A film is a cinematic brand cut (16:9) that anchors your business story, website, and showroom displays.",
  },
  {
    id: "pkg-customise",
    category: "Packages",
    question: "Can I customize an option with event coverage or a 2nd ID?",
    answer:
      "Yes! Like we did for Surya Mobiles (launching a 2nd ID to scale from 0 to 1,059 followers in 30 days) and ThoorigAI Infotech (full AICCI National Startup Summit stall coverage), we customize every project to your expansion goals.",
  },
  {
    id: "pkg-industries",
    category: "Packages",
    question: "Which industries in Thoothukudi do you work with?",
    answer:
      "We actively work with restaurants & cafés (like Thamira Restaurant), automobile showrooms (like MM Cars), retail electronics & mobile stores (like Surya Mobiles), training institutes & colleges (like ThoorigAI Infotech), and other ambitious local brands.",
  },

  // Process
  {
    id: "proc-start-to-finish",
    category: "Process",
    question: "How does the growth process work from start to finish?",
    answer:
      "We begin with a brief and local market audit, followed by concept planning, on-location shooting, rapid video editing with viral hooks and Tamil/English captions, and scheduled posting paired with Google Business Profile optimization.",
  },
  {
    id: "proc-what-needed",
    category: "Process",
    question: "What do you need from me before we start shooting?",
    answer:
      "Access to your location (kitchen, showroom, or classroom), your key promotions/products, and one point of contact. We handle the creative directing, camera gear, lighting, and script hooks.",
  },
  {
    id: "proc-lead-time",
    category: "Process",
    question: "How far ahead should I book a shoot?",
    answer:
      "{config.leadTime}. If you have an upcoming festival, sale, or store launch in Thoothukudi, tell us early so we can plan the content runway.",
  },
  {
    id: "proc-concept-script",
    category: "Process",
    question: "Do you help with hooks, scripts, and trending concepts?",
    answer:
      "Yes. Creative ideation, trend research, and script hooks are included in every engagement.",
  },

  // Pricing
  {
    id: "price-cost",
    category: "Pricing",
    question: "How much does it cost?",
    answer:
      "{config.startingFrom} Each project is scoped to your goals. WhatsApp or call us at 83004 78244 for a straightforward quotation.",
  },
  {
    id: "price-payment-terms",
    category: "Pricing",
    question: "What are your payment terms?",
    answer:
      "{config.paymentTerms}",
  },
  {
    id: "price-extra-costs",
    category: "Pricing",
    question: "Are there any hidden costs?",
    answer:
      "No surprises. Quotes include shoot, edit, revisions, and page management. {config.exclusions}.",
  },

  // Shoot day
  {
    id: "shoot-how-long",
    category: "Shoot day",
    question: "How long does a typical shoot take?",
    answer:
      "A focused reel shoot is typically 2 to 4 hours. A full content day or multi-camera brand film is usually 5 to 7 hours.",
  },
  {
    id: "shoot-business-disruption",
    category: "Shoot day",
    question: "Will the shoot disrupt our daily business operations?",
    answer:
      "No. We work with lean cinema equipment and fast glass, working around your staff, chefs, and customers without obstructing your floor or dining space.",
  },
  {
    id: "shoot-weather-rain",
    category: "Shoot day",
    question: "What if it rains during outdoor shots?",
    answer:
      "{config.reschedulePolicy}",
  },

  // Delivery
  {
    id: "del-how-fast",
    category: "Delivery",
    question: "How fast will I get the final reels?",
    answer:
      "{config.turnaround}. We prioritize urgent festival creatives and event highlights for rapid publishing.",
  },
  {
    id: "del-revisions",
    category: "Delivery",
    question: "What if I need changes to an edit?",
    answer:
      "Every package includes {config.revisions} so you can request text, pacing, or audio adjustments.",
  },
  {
    id: "del-file-formats",
    category: "Delivery",
    question: "What formats do you deliver in?",
    answer:
      "Export-ready 4K and 1080p 9:16 vertical reels optimized for Instagram and YouTube Shorts, plus 16:9 master files for website and display usage.",
  },

  // Rights
  {
    id: "rights-usage",
    category: "Rights",
    question: "Who owns the rights to the videos?",
    answer:
      "{config.usageRights}",
  },
  {
    id: "rights-paid-ads",
    category: "Rights",
    question: "Can I use the reels as sponsored Instagram ads?",
    answer:
      "Yes. Let us know before the shoot so we design hooks, framing, and clear calls-to-action specifically tuned for high-converting Meta ads.",
  },

  // Posting
  {
    id: "post-posting-service",
    category: "Posting",
    question: "Do you handle page posting and Instagram management?",
    answer:
      "{config.postingPolicy}",
  },
  {
    id: "post-rollout-plan",
    category: "Posting",
    question: "Do you help with Google Business Profile & Maps visibility?",
    answer:
      "Yes. We set up, verify, and optimize your Google Business Profile to capture local high-intent searches in Thoothukudi, like we did for Thamira Restaurant (150 reviews at 4.5/5) and MM Cars.",
  },

  // Working together
  {
    id: "work-call-first",
    category: "Working together",
    question: "Can we talk before booking?",
    answer:
      "Definitely. Call or WhatsApp us directly at 83004 78244 for a {config.introCall}.",
  },
  {
    id: "work-location",
    category: "Working together",
    question: "Where are you based?",
    answer:
      "We are based in {config.city}, Tamil Nadu. {config.travelPolicy}",
  },
  {
    id: "work-uncertain-needs",
    category: "Working together",
    question: "What if I'm not sure which social strategy to take?",
    answer:
      "That's exactly what we're here for. We audit your current page and local competitors, then craft a clear, actionable plan to grow your followers and customer walk-ins.",
  },
];

/**
 * Resolves template tokens in FAQ answer strings at runtime:
 * - {packageCount}: Total number of packages
 * - {packageNames}: Human-readable list of package names ("A, B or C")
 * - {config.key}: Arbitrary key from siteConfig
 */
export function resolveTokens(
  template: string,
  packageList: Package[],
  config: Record<string, string> = siteConfig,
): string {
  const packageCount = String(packageList.length);
  const packageNames =
    packageList.length === 0
      ? ""
      : packageList.length === 1
      ? packageList[0].name
      : packageList.length === 2
      ? `${packageList[0].name} or ${packageList[1].name}`
      : `${packageList
          .slice(0, -1)
          .map((p) => p.name)
          .join(", ")}, or ${packageList[packageList.length - 1].name}`;

  return template
    .replace(/\{packageCount\}/g, packageCount)
    .replace(/\{packageNames\}/g, packageNames)
    .replace(/\{config\.([a-zA-Z0-9_]+)\}/g, (_, key) => config[key] ?? "");
}
