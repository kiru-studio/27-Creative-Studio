import { siteContent } from "@/lib/site-content";

export interface ServiceLandingPageData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  locationFocus: string;
  highlights: { heading: string; detail: string }[];
  relatedPackageIds: string[];
  faqs: { question: string; answer: string }[];
}

export function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SERVICE_LANDING_PAGES: ServiceLandingPageData[] = [
  {
    slug: "instagram-reels-thoothukudi",
    title: "Instagram Reels Agency in Thoothukudi",
    metaTitle: "Instagram Reels Agency in Thoothukudi (Tuticorin) | 27 Creative Studio",
    metaDescription:
      "27 Creative Studio scripts, shoots in 4K, edits & manages high-retention 9:16 Instagram reels in Thoothukudi & Tuticorin. 6,300+ followers driven for local brands.",
    eyebrow: "// SHORT-FORM VIDEO PRODUCTION · THOOTHUKUDI",
    h1: "Instagram Reels Agency in Thoothukudi & Tuticorin",
    intro:
      "We help restaurants, car showrooms, retail stores, and clinics in Thoothukudi turn everyday operations, chef craft, and customer handovers into 4K vertical reels engineered for local reach and real walk-ins.",
    locationFocus: "Thoothukudi & Tuticorin",
    highlights: [
      {
        heading: "9:16 Hook-First Scripting",
        detail:
          "Every shoot is planned around visual hooks tailored for Tamil and English local audiences across Thoothukudi.",
      },
      {
        heading: "Sony FX3 & Prime Cinema Glass",
        detail:
          "On-location filming using 4K cinema cameras, crisp wireless audio, and compact rig setups that never disrupt your staff or customers.",
      },
      {
        heading: "Fast 3–5 Day Cut Turnaround",
        detail:
          "Rhythm-synced cuts, sound design, and color grading delivered in 3–5 business days with optional end-to-end page scheduling.",
      },
    ],
    relatedPackageIds: ["reels-sprint", "instagram-handling", "local-growth"],
    faqs: [
      {
        question: "How fast do you deliver edited Instagram reels in Thoothukudi?",
        answer:
          "Standard first cuts of vertical 9:16 reels are delivered within 3 to 5 business days after the on-location shoot day, complete with sound design, color grading, and two revision rounds.",
      },
      {
        question: "Do you handle full Instagram page posting and captions as well?",
        answer:
          "Yes. Under our Instagram Page Handling and Full Local Dominance engagements, 27 Creative Studio handles content calendars, hooks, local hashtags, posting cadence, and performance tracking.",
      },
    ],
  },
  {
    slug: "commercial-video-production-tamil-nadu",
    title: "Commercial Video Production in Tamil Nadu",
    metaTitle: "Commercial Video Production & Brand Films in Tamil Nadu | 27 Creative Studio",
    metaDescription:
      "4K commercial ad films, showroom walkthroughs, hospitality showcases & documentary brand stories crafted by 27 Creative Studio across Thoothukudi & Tamil Nadu.",
    eyebrow: "// 16:9 BRAND FILMS & AD PRODUCTION · TAMIL NADU",
    h1: "Commercial Video Production & 4K Brand Films in Tamil Nadu",
    intro:
      "Beyond quick vertical social clips, 27 Creative Studio directs widescreen 16:9 brand films, launch commercials, dining documentaries, and AI/education summit features for growing Tamil Nadu businesses.",
    locationFocus: "Thoothukudi, Tirunelveli & Tamil Nadu",
    highlights: [
      {
        heading: "Documentary & Commercial Pacing",
        detail:
          "Widescreen 4K storytelling with deliberate lighting, ambient sound design, and founder/team narrative interviews.",
      },
      {
        heading: "Multi-Format Master Exports",
        detail:
          "Get clean 16:9 master files for websites, YouTube, lobby screens, and investor decks alongside vertical cutdowns.",
      },
      {
        heading: "On-Location Across Southern Tamil Nadu",
        detail:
          "Self-contained cinema lighting and gimbal crew travelling cleanly across Thoothukudi, Tirunelveli, Kovilpatti, Tiruchendur, and nearby cities.",
      },
    ],
    relatedPackageIds: ["local-growth", "reels-sprint"],
    faqs: [
      {
        question: "What types of commercial films does 27 Creative Studio produce?",
        answer:
          "We direct restaurant culinary stories, pre-owned and flagship car showroom walkarounds, educational/AI summit films, retail brand documentaries, and founder authority profiles.",
      },
      {
        question: "Can we use the finished 4K master video across YouTube and ads?",
        answer:
          "Yes. Once final invoices are settled, clients hold perpetual, royalty-free usage rights to publish finished master exports across YouTube, Meta Ads, websites, and in-store displays.",
      },
    ],
  },
  {
    slug: "google-business-profile-thoothukudi",
    title: "Google Business Profile & Local SEO in Thoothukudi",
    metaTitle: "Google Business Profile & Local SEO Setup in Thoothukudi | 27 Creative Studio",
    metaDescription:
      "Rank higher on Google Maps in Thoothukudi & Tuticorin. 27 Creative Studio pairs verified Google Business Profile optimization with short-form video proof and review momentum.",
    eyebrow: "// LOCAL MAPS VISIBILITY & GBP SETUP · THOOTHUKUDI",
    h1: "Google Business Profile Optimization & Local SEO in Thoothukudi",
    intro:
      "When customers in Thoothukudi search for restaurants, showrooms, clinics, or stores nearby, your Google Business Profile and review trust win the walk-in before they even open Instagram.",
    locationFocus: "Thoothukudi (Tuticorin) & Surrounding Areas",
    highlights: [
      {
        heading: "Complete Profile & Category Setup",
        detail:
          "Accurate categories, Polpettai/Tuticorin service areas, NAP consistency, and high-res venue media configured within 48 hours.",
      },
      {
        heading: "Review Velocity & Trust Signals",
        detail:
          "Guided QR/follow-up frameworks that helped local partners build verified Google Maps ratings and consistent customer reviews.",
      },
      {
        heading: "Video + Local Search Flywheel",
        detail:
          "Reels spark local discovery in Thoothukudi while an optimized Google Business Profile captures high-intent searchers ready to call or visit.",
      },
    ],
    relatedPackageIds: ["instagram-handling", "local-growth"],
    faqs: [
      {
        question: "How quickly can you set up or audit our Google Business Profile?",
        answer:
          "Initial Google Business Profile setup and optimization in Thoothukudi is completed within 48 hours of onboarding.",
      },
      {
        question: "Why combine Instagram reels with Google Maps optimization?",
        answer:
          "Instagram reels generate neighborhood awareness and repeat recall, while Google Maps catches buyers actively searching for directions, phone numbers, and reviews right before visiting.",
      },
    ],
  },
  {
    slug: "video-production-tirunelveli",
    title: "Video Production & Instagram Growth in Tirunelveli",
    metaTitle: "Video Production & Reels Studio Serving Tirunelveli | 27 Creative Studio",
    metaDescription:
      "Need 4K Instagram reels or commercial ad films in Tirunelveli? 27 Creative Studio travels from nearby Thoothukudi for scheduled shoot days, strategy & post-production.",
    eyebrow: "// REGIONAL PRODUCTION CREW · TIRUNELVELI & SOUTHERN TAMIL NADU",
    h1: "Commercial Video Production & Instagram Growth Serving Tirunelveli",
    intro:
      "Based less than an hour away in Thoothukudi, 27 Creative Studio brings the exact same 4K Sony FX3 cinema crew, scripting discipline, and rapid editing workflow to restaurants, jewellery/retail showrooms, and colleges across Tirunelveli.",
    locationFocus: "Tirunelveli, Palayamkottai & Southern Tamil Nadu",
    highlights: [
      {
        heading: "Batch Shoot Days in Tirunelveli",
        detail:
          "Efficient single-day location shoots engineered to capture 8 to 16+ vertical reels or a signature brand film in one coordinated call sheet.",
      },
      {
        heading: "Proven Southern Tamil Nadu Track Record",
        detail:
          "Systems tested across Thoothukudi hospitality, automotive, electronics retail, and tech education brands generating 6,300+ new local followers.",
      },
      {
        heading: "Remote Growth Strategy & Delivery",
        detail:
          "Monthly calendars, trend scripting, 4K editing, and WhatsApp coordination continue smoothly every week between shoot visits.",
      },
    ],
    relatedPackageIds: ["reels-sprint", "local-growth"],
    faqs: [
      {
        question: "Does 27 Creative Studio shoot on location in Tirunelveli?",
        answer:
          "Yes. Our crew regularly travels from Thoothukudi for full-day shoots across Tirunelveli, Palayamkottai, Kovilpatti, and Tiruchendur, as well as remote editing/strategy projects worldwide.",
      },
      {
        question: "How many reels can be filmed in a single Tirunelveli shoot day?",
        answer:
          "With a pre-planned shot list and hook sheet ready before arrival, a focused half- or full-day production typically captures enough scenes for multiple high-velocity monthly reels.",
      },
    ],
  },
];

export function getServicePageBySlug(slug: string): ServiceLandingPageData | undefined {
  return SERVICE_LANDING_PAGES.find((s) => s.slug === slug);
}

export interface CaseStudySlugItem {
  slug: string;
  index: number;
  title: string;
  client: string;
  label: string;
  meta: string;
  type: string;
  industries: string[];
  location?: string;
  handle?: string;
  growthMultiplier?: string;
  followersStart?: string;
  followersNow?: string;
  newFollowers?: string;
  topViews?: string;
  postsCount?: string;
  googleRating?: string;
  googleReviews?: string;
  goal?: string;
  shot?: string;
  result?: string;
  posterSrc?: string;
  videoSrc?: string;
}

export function getCaseStudyPages(): CaseStudySlugItem[] {
  return (siteContent.caseStudies || []).map((cs, index) => {
    const baseName = cs.client || cs.title || `case-${index + 1}`;
    return {
      slug: slugifyText(baseName),
      index,
      title: cs.title,
      client: cs.client || cs.title,
      label: cs.label,
      meta: cs.meta,
      type: cs.type,
      industries: cs.industries || [],
      location: cs.location,
      handle: cs.handle,
      growthMultiplier: cs.growthMultiplier,
      followersStart: cs.followersStart,
      followersNow: cs.followersNow,
      newFollowers: cs.newFollowers,
      topViews: cs.topViews,
      postsCount: cs.postsCount,
      googleRating: cs.googleRating,
      googleReviews: cs.googleReviews,
      goal: cs.goal,
      shot: cs.shot,
      result: cs.result,
      posterSrc: cs.posterSrc,
      videoSrc: cs.videoSrc,
    };
  });
}

export function getCaseStudyBySlug(slug: string): CaseStudySlugItem | undefined {
  return getCaseStudyPages().find((c) => c.slug === slug);
}
