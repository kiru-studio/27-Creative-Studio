// ==========================================
// HERO CONFIGURATION & SINGLE SOURCE OF TRUTH
// ==========================================

export interface CameraReadout {
  resolution: string; // e.g. "4K"
  fps: string;        // e.g. "24fps"
  aperture: string;   // e.g. "f/2.8"
  iso: string;        // e.g. "ISO 800"
}

export interface SceneMarker {
  id: string;     // Target DOM section ID
  number: string; // Display number: "01", "02", etc.
  label: string;  // Scene title: "intro", "films", "crew", etc.
}

export interface HeroConfig {
  videoSrc: string;          // Main background video (mp4/webm)
  posterSrc: string;         // Poster image fallback
  reelVideoSrc: string;      // Video played in "Watch the reel" modal
  reelPosterSrc: string;     // Poster for "Watch the reel" modal
  cameraReadout: CameraReadout;
  scenes: SceneMarker[];
  clipPath: string;          // Parallelogram polygon
  eyebrow: string;
  titleLines: string[];
  body: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText: string;
  reelLabel: string;
  brandTag: string;
}

export const heroConfig: HeroConfig = {
  // Video source: can be set to any local/remote video path (e.g. "/videos/hero-showreel.mp4")
  videoSrc: "",
  posterSrc: "",
  // Video for the fullscreen "Watch the reel" modal
  reelVideoSrc: "",
  reelPosterSrc: "",
  cameraReadout: {
    resolution: "4K",
    fps: "24fps",
    aperture: "f/2.8",
    iso: "ISO 800",
  },
  // Section IDs for live scene tracking
  scenes: [
    { id: "hero", number: "01", label: "intro" },
    { id: "work", number: "02", label: "reels" },
    { id: "films", number: "03", label: "films" },
    { id: "process", number: "04", label: "process" },
    { id: "cases", number: "05", label: "cases" },
    { id: "about", number: "06", label: "about" },
    { id: "packages", number: "07", label: "packages" },
    { id: "contact", number: "08", label: "contact" },
  ],
  // Slanted parallelogram shape matching design
  clipPath: "polygon(14% 0%, 100% 0%, 86% 100%, 0% 100%)",
  eyebrow: "27 creative studio / thoothukudi",
  titleLines: ["Real Growth.", "Real Results."],
  body: "Instagram growth and local visibility for Thoothukudi businesses, handled end-to-end by 27 Creative Studio.",
  ctaText: "Grow your brand",
  ctaHref: "#contact",
  secondaryCtaText: "Watch client reels",
  reelLabel: "Thamira Restaurant / 10.1K views / 00:30",
  brandTag: "27 creative studio",
};
