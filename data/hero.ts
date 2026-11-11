// ==========================================
// HERO CONFIGURATION & SINGLE SOURCE OF TRUTH
// ==========================================

import { siteContent } from "@/lib/site-content";

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
  logoSrc?: string;          // Brand logo showcase
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
  videoSrc: siteContent.hero.videoSrc ?? "",
  posterSrc: siteContent.hero.posterSrc ?? "",
  // Video for the fullscreen "Watch the reel" modal
  reelVideoSrc: "/videos/hero-showreel.mp4",
  reelPosterSrc: "/images/hero-poster.jpg",
  logoSrc: "/images/27-logo.png",
  cameraReadout: {
    resolution: "4K",
    fps: "24fps",
    aperture: "f/2.8",
    iso: "ISO 800",
  },
  // Section IDs for live scene tracking
  scenes: [
    { id: "hero", number: "01", label: "home" },
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
  eyebrow: siteContent.hero.eyebrow,
  titleLines: siteContent.hero.title.split("\n"),
  body: siteContent.hero.body,
  ctaText: siteContent.hero.cta,
  ctaHref: "#contact",
  secondaryCtaText: siteContent.hero.secondary,
  reelLabel: siteContent.hero.posterLabel,
  brandTag: `${siteContent.brand.name} ${siteContent.brand.descriptor}`,
};
