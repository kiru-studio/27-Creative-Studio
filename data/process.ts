import type { ComponentType } from "react";
import { FileText, Clapperboard, Scissors, Send } from "lucide-react";

export type TurnaroundFormatId = "reels" | "films" | "campaigns";

export interface TurnaroundFormat {
  id: TurnaroundFormatId;
  label: string;
  turnaround: string;
  fullLabel: string;
  description: string;
}

export interface LensConfig {
  aperture: string;
  shutterSpeed: string;
  iso: string;
  apertureScale: number;
  mode: "brief" | "shoot" | "edit" | "delivered";
}

export interface ProcessStep {
  id: string;
  stepNumber: string;
  title: string;
  tagline: string;
  description: string;
  days: Record<TurnaroundFormatId, string>;
  happens: string[];
  needs: string[];
  icon: ComponentType<{ size?: number | string; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  lensConfig: LensConfig;
  nextLabel: string;
}

export const turnaroundFormats: TurnaroundFormat[] = [
  {
    id: "reels",
    label: "Reels",
    turnaround: "3–5 days",
    fullLabel: "Reels / 3–5 days",
    description: "Rapid vertical cuts tuned for high-velocity Instagram feeds.",
  },
  {
    id: "films",
    label: "Films",
    turnaround: "7 days",
    fullLabel: "Films / 7 days",
    description: "Cinematic storytelling for restaurants, showrooms, and summits.",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    turnaround: "10 days",
    fullLabel: "Campaigns / 10 days",
    description: "Full local growth launch with reels, festival creatives, and Google Maps setup.",
  },
];

export const processSteps: ProcessStep[] = [
  {
    id: "brief",
    stepNumber: "01",
    title: "Brief",
    tagline: "Find the hook.",
    description: "We analyze your local market in Thoothukudi, clarify the narrative hook, and plan every scene before turning on the camera.",
    days: {
      reels: "Day 01",
      films: "Day 01",
      campaigns: "Days 01–02",
    },
    happens: [
      "Clarify narrative core & viral hook",
      "Frame visual tone and shot list",
    ],
    needs: [
      "Target audience & offer priorities",
      "Location access & point of contact",
    ],
    icon: FileText,
    lensConfig: {
      aperture: "f/1.4",
      shutterSpeed: "1/60",
      iso: "400",
      apertureScale: 0.88,
      mode: "brief",
    },
    nextLabel: "Shoot",
  },
  {
    id: "shoot",
    stepNumber: "02",
    title: "Shoot",
    tagline: "Get the good stuff.",
    description: "Lean crew on location at your restaurant, showroom, or institute. Fast glass, precise lighting, capturing authentic customer reactions without disrupting business.",
    days: {
      reels: "Day 02",
      films: "Days 02–03",
      campaigns: "Days 03–05",
    },
    happens: [
      "On-location multi-angle filming",
      "Food close-ups, cars, or student moments",
    ],
    needs: [
      "Staff & customer availability",
      "Showroom or kitchen clearance",
    ],
    icon: Clapperboard,
    lensConfig: {
      aperture: "f/2.8",
      shutterSpeed: "1/250",
      iso: "800",
      apertureScale: 0.5,
      mode: "shoot",
    },
    nextLabel: "Edit",
  },
  {
    id: "edit",
    stepNumber: "03",
    title: "Edit",
    tagline: "Cut it sharp.",
    description: "Rapid viral pacing, trending audio, bold on-screen captions, and rich color grading tuned for mobile screens.",
    days: {
      reels: "Days 03–04",
      films: "Days 04–06",
      campaigns: "Days 06–08",
    },
    happens: [
      "Pacing, rhythm & audio synchronization",
      "Captions, motion graphics, and color grade",
    ],
    needs: [
      "Feedback on first cut within 24h",
      "Approval of thumbnail and hook",
    ],
    icon: Scissors,
    lensConfig: {
      aperture: "f/5.6",
      shutterSpeed: "1/500",
      iso: "200",
      apertureScale: 0.28,
      mode: "edit",
    },
    nextLabel: "Delivered",
  },
  {
    id: "delivered",
    stepNumber: "04",
    title: "Delivered",
    tagline: "Ready to grow.",
    description: "Export-ready reels posted and boosted. Integrated with Google Business Profile to turn digital views into local walk-ins and phone calls.",
    days: {
      reels: "Day 05",
      films: "Day 07",
      campaigns: "Day 10",
    },
    happens: [
      "Scheduled publishing & hashtag strategy",
      "Google Business Profile optimization",
    ],
    needs: [
      "Instagram account access / approvals",
      "Final delivery sign-off",
    ],
    icon: Send,
    lensConfig: {
      aperture: "f/1.2",
      shutterSpeed: "1/1000",
      iso: "100",
      apertureScale: 1.0,
      mode: "delivered",
    },
    nextLabel: "Brief",
  },
];

