import masterContent from "@/content/site-content.json";

export type AccentKey =
  | "lime"
  | "amber"
  | "coral"
  | "orange"
  | "teal"
  | "blue"
  | "paper";

export type Industry = {
  id: string;
  label: string;
  accent: AccentKey;
  pitch: string;
};

export type WorkItem = {
  title: string;
  type: string;
  label: string;
  meta: string;
  industries: string[];
  client?: string;
  delivered?: string;
  goal?: string;
  format?: string;
  result?: string;
  shot?: string;
  posterSrc?: string;
  videoSrc?: string;
  handle?: string;
  location?: string;
  growthMultiplier?: string;
  followersStart?: string;
  followersNow?: string;
  newFollowers?: string;
  topViews?: string;
  postsCount?: string;
  googleRating?: string;
  googleReviews?: string;
};

export type SiteContent = {
  brand: {
    name: string;
    descriptor: string;
    logoMark: string;
    logoFull: string;
  };
  adminCopy: Record<string, string>;
  nav: string[];
  hero: {
    title: string;
    body: string;
    cta: string;
    secondary: string;
    posterLabel: string;
    posterSrc?: string;
    videoSrc?: string;
    eyebrow?: string;
    cameraReadout?: {
      resolution: string;
      fps: string;
      aperture: string;
      iso: string;
    };
  };
  industries: Industry[];
  proof: string[];
  reels: WorkItem[];
  films: WorkItem[];
  speed: { title: string; body: string; meta?: string }[];
  caseStudies: WorkItem[];
  packages: {
    id?: string;
    tierNumber?: string;
    tierLabel?: string;
    name: string;
    tagline?: string;
    description?: string;
    deliverables?: string[];
    reels?: string;
    films?: string;
    shootDays?: string;
    detail?: string;
    price?: string;
    cta?: string;
    serial?: string;
    popular?: boolean;
  }[];
  people: {
    name: string;
    role: string;
    bio: string;
    workLabel: string;
    photoSrc?: string;
    tagline?: string;
    gear?: string;
    focalLength?: string;
    passId?: string;
    access?: string;
    stats?: string;
  }[];
  turnaround: string[];
  testimonials: { quote: string; name: string; role: string }[];
  faqs: { id?: string; category?: string; question: string; answer: string }[];
  ui: Record<string, string>;
  contact: {
    heading: string;
    body: string;
    email: string;
    instagram: string;
    serviceArea: string;
    whatsappLabel: string;
    whatsappMessage: string;
    whatsappNumber: string;
  };
  footer: {
    line: string;
    nav: string[];
    socials: { label: string; href: string }[];
  };
  seo: {
    title: string;
    description: string;
    siteName: string;
    url: string;
    locale: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: "summary" | "summary_large_image" | "app" | "player";
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    favicon: string;
    robots: string;
    sitemap: string;
    business: {
      name: string;
      description: string;
      telephone: string;
      email: string;
      url: string;
      areaServed: string[];
      address: {
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
      };
      sameAs: string[];
    };
  };
};

export const siteContent = masterContent as SiteContent;

export function getSiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (siteContent.seo.url && !siteContent.seo.url.includes("localhost") && !siteContent.seo.url.includes("27creativestudio.com")) {
    return siteContent.seo.url.replace(/\/$/, "");
  }
  return "https://27-creative-studio.vercel.app";
}

export const whatsappHref = `https://wa.me/${siteContent.contact.whatsappNumber}?text=${encodeURIComponent(siteContent.contact.whatsappMessage)}`;

export type IndustryId = SiteContent["industries"][number]["id"];