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
  {
    id: "faq-services",
    category: "Services",
    question: "What services does 27 Creative Studio provide?",
    answer:
      "We specialize in end-to-end Instagram growth and local visibility for Thoothukudi businesses: Instagram page handling, viral reels and video content, festival and offer creatives, event coverage, Google Business Profile setup, and growth strategy.",
  },
  {
    id: "faq-which-option",
    category: "Packages",
    question: "Which option is right for my business?",
    answer:
      "Look at our 3 ways of working above: steady monthly growth suits 'Instagram page handling', targeted campaign assets suit 'Reels & video sprint', and total local dominance across multiple accounts and Google Maps becomes 'Full local growth'. We tailor every scope to what drives footfall and sales in Thoothukudi.",
  },
  {
    id: "faq-cost",
    category: "Pricing",
    question: "How much does it cost?",
    // TODO(owner): confirm wording and check it agrees with the hidden-costs answer.
    answer:
      "We don't use fixed price lists. We quote based on how many reels you need, shoot days, and extras like event coverage or a second account. Tell us what you need on WhatsApp and we'll send a clear quote.",
  },
  {
    id: "faq-payment-terms",
    category: "Pricing",
    question: "What are your payment terms?",
    answer:
      "We work on structured milestone terms per project or monthly cycle. Reach out on WhatsApp at +91 83004 78244 for our clear payment schedule and project agreement.",
  },
  {
    id: "faq-reel-vs-film",
    category: "Production",
    question: "What counts as a reel and a film?",
    answer:
      "A reel is a punchy vertical piece (9:16) made for high-velocity social attention and trending audio. A film is a cinematic brand cut (16:9) that anchors your business story, website, and showroom displays.",
  },
  {
    id: "faq-turnaround",
    category: "Production",
    question: "How fast is turnaround for finished videos?",
    answer:
      "First drafts are typically delivered within 48 to 72 hours following the shoot. For urgent festival creatives or event coverage, we provide rapid same-week turnaround.",
  },
  {
    id: "faq-revisions",
    category: "Production",
    question: "What if I need changes or revisions to an edit?",
    answer:
      "Every package includes dedicated revision rounds with timecoded feedback so you can request text, pacing, color, or audio adjustments before final delivery.",
  },
  {
    id: "faq-rights",
    category: "Rights",
    question: "Who owns the rights to the videos?",
    answer:
      "You receive full commercial usage rights for all delivered video assets across your social media channels, website, paid ads, and in-store displays in perpetuity.",
  },
  {
    id: "faq-what-needed",
    category: "Process",
    question: "What do you need from me before we start shooting?",
    answer:
      "Access to your location (kitchen, showroom, or shop), your key promotions/products, and one point of contact. We handle the creative directing, camera gear, lighting, and script hooks.",
  },
  {
    id: "faq-call-before-booking",
    category: "Contact",
    question: "Can we talk before booking?",
    answer:
      "Definitely. Call or WhatsApp us directly at +91 83004 78244 for a friendly intro chat. We can discuss your goals and local market opportunities in Thoothukudi.",
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
