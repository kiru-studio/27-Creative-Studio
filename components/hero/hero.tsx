"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { heroConfig } from "@/data/hero";
import { HudCorners } from "./hud-corners";
import { LiveTimecode } from "./live-timecode";
import { RecIndicator } from "./rec-indicator";
import { CameraMenu } from "./camera-menu";
import { VideoWindow } from "./video-window";
import { ReelModal } from "./reel-modal";
import { SceneProgress } from "./scene-progress";
import { MagneticPrimaryButton, OutlinedWatchButton } from "./magnetic-button";
import { ViewfinderCursor } from "./viewfinder-cursor";

interface HeroProps {
  enableViewfinderCursor?: boolean;
}

export function Hero({ enableViewfinderCursor = false }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const reelTriggerRef = useRef<HTMLButtonElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isOverCta, setIsOverCta] = useState(false);

  const shouldReduceMotion = Boolean(useReducedMotion());

  const {
    titleLines,
    eyebrow,
    body,
    ctaText,
    ctaHref,
    secondaryCtaText,
    brandTag,
  } = heroConfig;

  return (
    <>
      <section
        ref={heroRef}
        id="hero"
        aria-labelledby="hero-heading"
        className="relative w-full min-h-screen min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[var(--ink,#0B0B0F)] text-[var(--paper,#F3F3F5)] select-none pt-4 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8"
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
          {/* Left: Brand Tag (hidden < 640px) & REC indicator (always visible) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <a
              href="#top"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--paper)] hover:text-[var(--industry)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--industry)] rounded px-1 -mx-1"
            >
              <span className="text-[var(--industry)]">●</span>
              <span>{brandTag}</span>
            </a>

            <span className="hidden sm:inline-block text-[var(--line,#333)] font-mono text-xs" aria-hidden="true">
              /
            </span>

            <RecIndicator shouldReduceMotion={shouldReduceMotion} />
          </div>

          {/* Center: Live 24fps Timecode */}
          <div className="flex items-center justify-center">
            <LiveTimecode />
          </div>

          {/* Right: Camera Readout Cluster & Camera Menu (Desktop/Tablet) or spacer for Mobile hamburger */}
          <div className="hidden sm:flex items-center justify-end shrink-0">
            <CameraMenu />
          </div>
          <div className="sm:hidden w-8 shrink-0" aria-hidden="true" />
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
              className="m-0 font-extrabold font-display leading-[0.92] tracking-tight uppercase flex flex-col items-start text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[5.25rem] xl:text-[6rem] w-full"
            >
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
