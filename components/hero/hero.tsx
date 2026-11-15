"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { heroConfig } from "@/data/hero";
import { siteContent } from "@/lib/site-content";
import { HudCorners } from "./hud-corners";
import { LiveTimecode } from "./live-timecode";
import { RecIndicator } from "./rec-indicator";
import { CameraMenu } from "./camera-menu";
import { VideoWindow } from "./video-window";
import { ReelModal } from "./reel-modal";
import { SceneProgress } from "./scene-progress";
import { MagneticPrimaryButton, OutlinedWatchButton } from "./magnetic-button";
import { ViewfinderCursor } from "./viewfinder-cursor";
import { BrandLockup } from "@/components/brand-lockup";
import { BigOutline27 } from "@/components/graphics/BigOutline27";
import { Blob } from "@/components/graphics/Blob";

interface HeroProps {
  enableViewfinderCursor?: boolean;
}

export function Hero({ enableViewfinderCursor = false }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const reelTriggerRef = useRef<HTMLButtonElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isOverCta, setIsOverCta] = useState(false);
  const [lang, setLang] = useState<"en" | "ta">("en");

  const shouldReduceMotion = useHydratedReducedMotion();

  // Tamil copy // TODO(owner): Native Tamil speaker review of copy
  const TAMIL_COPY = {
    eyebrow: "// இன்ஸ்டாகிராம் வளர்ச்சி நிறுவனம் · தூத்துக்குடி",
    titleLines: ["உண்மையான வளர்ச்சி.", "உண்மையான முடிவுகள்."],
    body: "தூத்துக்குடி உள்ளூர் வணிகங்களை மக்கள் விரும்பும் பிராண்டுகளாக மாற்றுகிறோம். உண்மையான ஃபாலோயர்கள், பார்வைகள் மற்றும் விற்பனை.",
    cta: "வாட்ஸ்அப்பில் பேசலாம்",
    secondary: "ரீல்ஸ் பாருங்கள்",
  };

  const defaultEyebrow = siteContent.hero?.eyebrow || heroConfig.eyebrow;
  const eyebrow = lang === "ta" ? TAMIL_COPY.eyebrow : defaultEyebrow;

  const defaultTitleLines = siteContent.hero?.title
    ? (siteContent.hero.title.includes(".")
        ? siteContent.hero.title.split(/(?<=\.)\s+/).filter(Boolean)
        : [siteContent.hero.title])
    : heroConfig.titleLines;
  const titleLines = lang === "ta" ? TAMIL_COPY.titleLines : defaultTitleLines;

  const body = lang === "ta" ? TAMIL_COPY.body : (siteContent.hero?.body || heroConfig.body);
  const ctaText = lang === "ta" ? TAMIL_COPY.cta : (siteContent.hero?.cta || heroConfig.ctaText);
  const ctaHref = heroConfig.ctaHref;
  const secondaryCtaText = lang === "ta" ? TAMIL_COPY.secondary : (siteContent.hero?.secondary || heroConfig.secondaryCtaText);

  return (
    <>
      <section
        ref={heroRef}
        id="hero"
        aria-labelledby="hero-heading"
        className="relative w-full min-h-screen min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[var(--ink,#0B0B0F)] text-[var(--paper,#F3F3F5)] select-none pt-4 pb-16 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8"
      >
        {/* Atmosphere: 4% subtle film-grain overlay */}
        <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

        {/* Phase 2 Reusable Graphics: Atmospheric Big 27 & Organic Blob */}
        <BigOutline27 className="right-4 top-24 w-[340px] sm:w-[480px] pointer-events-none" opacity={0.06} />
        <Blob color="lime" className="w-72 h-72 sm:w-96 sm:h-96 -top-20 -left-20" opacity={0.12} />

        {/* 1. L-Shaped Corner Brackets */}
        <HudCorners
          shouldReduceMotion={shouldReduceMotion}
          insetClassName="inset-4 sm:inset-6 lg:inset-8"
        />

        {/* Optional Viewfinder Custom Cursor */}
        <ViewfinderCursor
          heroRef={heroRef}
          isOverCta={isOverCta}
          shouldReduceMotion={shouldReduceMotion}
          enabled={enableViewfinderCursor}
        />

        {/* ======================================================== */}
        {/* TOP HUD: Unified Grid Container                          */}
        {/* ======================================================== */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Studio mark and recording indicator */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <BrandLockup href="#top" />
            <span className="hidden sm:inline-block text-[var(--line,#333)] font-mono text-xs" aria-hidden="true">
              /
            </span>
            <RecIndicator shouldReduceMotion={shouldReduceMotion} />
            {/* Language Toggle: EN | தமிழ் */}
            <div className="flex items-center gap-1 bg-[#141419] border border-[#2A2A30] rounded-full p-0.5 text-[11px] font-mono ml-1 sm:ml-2">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded-full transition-colors ${lang === "en" ? "bg-[#D4FF3F] text-[#0B0B0B] font-bold" : "text-[#B9B2A5] hover:text-white"}`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("ta")}
                className={`px-2 py-0.5 rounded-full transition-colors ${lang === "ta" ? "bg-[#D4FF3F] text-[#0B0B0B] font-bold" : "text-[#B9B2A5] hover:text-white"}`}
                aria-label="Switch to Tamil"
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* Center: Live 24fps Timecode (Hidden on compact mobile to give breathing room for mobile menu) */}
          <div className="hidden sm:flex items-center justify-center">
            <LiveTimecode />
          </div>

          {/* Right: Camera Readout Cluster & Camera Menu (Desktop/Tablet) or spacer for Mobile hamburger */}
          <div className="hidden sm:flex items-center justify-end shrink-0">
            <CameraMenu />
          </div>
          <div className="sm:hidden w-20 shrink-0" aria-hidden="true" />
        </div>

        {/* ======================================================== */}
        {/* MAIN HERO CONTENT & SLANTED VIDEO WINDOW                */}
        {/* ======================================================== */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 my-auto py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Eyebrow, Headline, Subline, CTAs (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col items-start z-10 w-full">
            {/* Mono Eyebrow */}
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : 0.55,
              }}
              className="font-mono text-xs uppercase tracking-widest text-[var(--industry)] m-0 mb-4 sm:mb-5"
            >
              {eyebrow}
            </motion.p>

            {/* 3. FOCUS-PULL INTRO: Masked Headline lines + Lens Focus Blur Pull */}
            <h1
              id="hero-heading"
              className={`m-0 font-extrabold font-display leading-[0.92] tracking-tight uppercase flex flex-col items-start text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[5.25rem] xl:text-[6rem] w-full ${lang === "ta" ? "font-[family-name:var(--font-next-tamil)] tracking-normal" : ""}`}
            >
              <span className="sr-only">Instagram Reels & Growth Agency in Thoothukudi</span>
              <span className="text-xs sm:text-sm font-mono tracking-widest text-[#FF2DA8] mb-2 uppercase block">
                {lang === "ta" ? "இன்ஸ்டாகிராம் ரீல்ஸ் & வளர்ச்சி நிறுவனம் · தூத்துக்குடி" : "Instagram Reels & Growth Agency · Thoothukudi"}
              </span>
              {titleLines.map((line, idx) => (
                <span
                  key={idx}
                  className="overflow-hidden block leading-[0.92] pb-1 sm:pb-2"
                >
                  <motion.span
                    className="block text-[var(--paper)]"
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            y: "100%",
                            filter: "blur(10px)",
                            scale: 1.03,
                          }
                    }
                    animate={{
                      y: 0,
                      filter: "blur(0px)",
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.9,
                      ease: [0.16, 1, 0.3, 1],
                      delay: shouldReduceMotion ? 0 : 0.15 + idx * 0.1,
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Subline */}
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : 0.63,
              }}
              className="text-base sm:text-lg md:text-xl text-[var(--muted,#999)] mt-5 sm:mt-6 mb-8 sm:mb-10 max-w-xl font-normal leading-relaxed"
            >
              {body}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : 0.71,
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
            >
              {/* Primary: Magnetic Button */}
              <MagneticPrimaryButton
                text={ctaText}
                href={ctaHref}
                shouldReduceMotion={shouldReduceMotion}
                onMouseEnter={() => setIsOverCta(true)}
                onMouseLeave={() => setIsOverCta(false)}
              />

              {/* Secondary: Outlined Reel Trigger Button */}
              <OutlinedWatchButton
                buttonRef={reelTriggerRef}
                text={secondaryCtaText}
                onClick={() => setIsReelModalOpen(true)}
                shouldReduceMotion={shouldReduceMotion}
                onMouseEnter={() => setIsOverCta(true)}
                onMouseLeave={() => setIsOverCta(false)}
              />
            </motion.div>

            {/* Proof Strip under CTAs (4 clients, 6,300+ followers, 6.1x peak) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: shouldReduceMotion ? 0 : 0.8,
                ease: "easeOut",
              }}
              className="mt-8 pt-5 border-t border-[#2A2A30] w-full flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm font-mono text-[#EFE6D8]/80 select-none"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#D4FF3F]" aria-hidden="true" />
                <span><strong className="text-white font-bold">4</strong> clients</span>
              </div>
              <span className="text-[#444]" aria-hidden="true">·</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#FF2DA8]" aria-hidden="true" />
                <span><strong className="text-white font-bold">6,300+</strong> followers</span>
              </div>
              <span className="text-[#444]" aria-hidden="true">·</span>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#D4FF3F]" aria-hidden="true" />
                <span><strong className="text-[#D4FF3F] font-bold">6.1x</strong> peak</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Slanted Video Window (lg:col-span-5) */}
          <div className="lg:col-span-5 w-full flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-md lg:max-w-none h-48 sm:h-64 md:h-80 lg:h-[460px] xl:h-[500px]">
              <VideoWindow
                isMuted={isMuted}
                onOpenReelModal={() => setIsReelModalOpen(true)}
                shouldReduceMotion={shouldReduceMotion}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM HUD: Scene Marker & Page Scroll Progress          */}
        {/* ======================================================== */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">
          <SceneProgress
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            shouldReduceMotion={shouldReduceMotion}
          />
        </div>
      </section>

      {/* Fullscreen Reel Modal Player */}
      <ReelModal
        isOpen={isReelModalOpen}
        onClose={() => setIsReelModalOpen(false)}
        returnFocusTo={reelTriggerRef.current}
      />
    </>
  );
}
export default Hero;
