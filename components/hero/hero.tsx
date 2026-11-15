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

interface HeroProps {
  enableViewfinderCursor?: boolean;
}

export function Hero({ enableViewfinderCursor = false }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const reelTriggerRef = useRef<HTMLButtonElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isOverCta, setIsOverCta] = useState(false);

  const shouldReduceMotion = useHydratedReducedMotion();

  const eyebrow = siteContent.hero?.eyebrow || heroConfig.eyebrow;
  const maximalistHeadline = [
    "WE MAKE",
    "BRANDS",
    "IMPOSSIBLE",
    "TO IGNORE.",
  ];
  const titleLinesToRender = maximalistHeadline;
  const body = siteContent.hero?.body || heroConfig.body;
  const ctaText = siteContent.hero?.cta || heroConfig.ctaText;
  const ctaHref = heroConfig.ctaHref;
  const secondaryCtaText = siteContent.hero?.secondary || heroConfig.secondaryCtaText;

  return (
    <>
      <section
        ref={heroRef}
        id="hero"
        aria-labelledby="hero-heading"
        className="relative w-full min-h-screen min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#0B0B0B] text-[#FF2DA8] select-none pt-4 pb-16 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8"
      >
        {/* Atmosphere: 4% subtle film-grain overlay */}
        <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

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
            <span className="hidden sm:inline-block text-[#FF2DA8]/40 font-mono text-xs" aria-hidden="true">
              /
            </span>
            <RecIndicator shouldReduceMotion={shouldReduceMotion} />
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
            {/* Brutalist Stickers Cluster */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 mb-5 select-none"
            >
              <span className="brutal-sticker-lime">
                THOOTHUKUDI HQ // 8.8049° N, 78.1460° E
              </span>
              <span className="brutal-sticker-pink">
                SONY FX3 4K 24FPS DCI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-[#D4FF3F] bg-[#0B0B0B] border-2 border-[#D4FF3F] px-2 py-0.5 font-bold uppercase shadow-[2px_2px_0px_#FF2DA8]">
                <span>●</span>
                <span>NO TEMPLATES</span>
              </span>
            </motion.div>

            {/* 3. FOCUS-PULL INTRO: Masked Headline lines + Lens Focus Blur Pull */}
            <h1
              id="hero-heading"
              className="m-0 font-black font-display leading-[0.88] tracking-tighter uppercase flex flex-col items-start text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.75rem] xl:text-[6.75rem] w-full"
            >
              {titleLinesToRender.map((line, idx) => (
                <span
                  key={idx}
                  className="overflow-hidden block leading-[0.86] pb-1 sm:pb-2"
                >
                  <motion.span
                    className={`block ${
                      idx % 2 === 0
                        ? "text-[#FF2DA8]"
                        : "text-[#D4FF3F]"
                    } ${idx === 2 ? "italic font-black" : ""}`}
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
                      duration: 0.85,
                      ease: [0.16, 1, 0.3, 1],
                      delay: shouldReduceMotion ? 0 : 0.12 + idx * 0.08,
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
              className="text-base sm:text-lg md:text-xl text-[#FF2DA8] mt-5 sm:mt-6 mb-8 sm:mb-10 max-w-xl font-mono font-bold leading-relaxed"
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

      {/* Colossal Maximum Brutalist Marquee Tape */}
      <div className="w-full border-y-4 border-[#FF2DA8] bg-[#0B0B0B] py-3.5 overflow-hidden select-none" aria-hidden="true">
        <div className="flex items-center gap-6 whitespace-nowrap font-display font-black text-lg sm:text-2xl uppercase tracking-tighter text-[#D4FF3F]">
          <span className="bg-[#FF2DA8] text-[#0B0B0B] px-3 py-0.5 text-xs font-mono font-black -rotate-1">VERIFIED METRICS</span>
          <span>6,300+ NEW FOLLOWERS</span>
          <span className="text-[#FF2DA8]">/////</span>
          <span>SONY FX3 ACTIVE</span>
          <span className="text-[#FF2DA8]">/////</span>
          <span>4K 24FPS DCI</span>
          <span className="text-[#FF2DA8]">/////</span>
          <span>6.1X PEAK MULTIPLIER</span>
          <span className="text-[#FF2DA8]">/////</span>
          <span className="bg-[#D4FF3F] text-[#0B0B0B] px-3 py-0.5 text-xs font-mono font-black rotate-1">TAMIL NADU</span>
          <span>ZERO FILLER FRAMES</span>
          <span className="text-[#FF2DA8]">/////</span>
          <span>THOOTHUKUDI HQ</span>
        </div>
      </div>

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
