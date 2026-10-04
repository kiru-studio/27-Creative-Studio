"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { heroConfig } from "@/data/hero";

interface VideoWindowProps {
  isMuted?: boolean;
  onOpenReelModal?: () => void;
  shouldReduceMotion?: boolean;
  className?: string;
}

export function VideoWindow({
  isMuted = true,
  onOpenReelModal,
  shouldReduceMotion = false,
  className = "",
}: VideoWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canHover, setCanHover] = useState(false);

  // Parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax offset: up to 10px opposite to mouse movement
  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  // Check hover capability (disable parallax on touch)
  useEffect(() => {
    try {
      const match = window.matchMedia("(hover: hover) and (pointer: fine)");
      setCanHover(match.matches);
      const listener = (e: MediaQueryListEvent) => setCanHover(e.matches);
      match.addEventListener("change", listener);
      return () => match.removeEventListener("change", listener);
    } catch {
      setCanHover(false);
    }
  }, []);

  // Track mouse relative to hero center
  useEffect(() => {
    if (!canHover || shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = (e.clientX / innerWidth) - 0.5;
      const normalizedY = (e.clientY / innerHeight) - 0.5;
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [canHover, shouldReduceMotion, mouseX, mouseY]);

  // Keep video mute in sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const clipPathStyle = heroConfig.clipPath || "polygon(14% 0%, 100% 0%, 86% 100%, 0% 100%)";

  return (
    <motion.div
      ref={containerRef}
      style={{
        x: canHover && !shouldReduceMotion ? parallaxX : 0,
        y: canHover && !shouldReduceMotion ? parallaxY : 0,
      }}
      initial={shouldReduceMotion ? false : { x: "8%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative select-none ${className}`}
      onClick={onOpenReelModal}
      role="button"
      tabIndex={0}
      aria-label="Play featured reel"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenReelModal?.();
        }
      }}
    >
      {/* Outer Slanted Container */}
      <div
        className="relative w-full h-full overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.01] cursor-pointer group"
        style={{
          clipPath: clipPathStyle,
          WebkitClipPath: clipPathStyle,
        }}
      >
        {/* Video Element or Animated Gradient Fallback */}
        {heroConfig.videoSrc ? (
          <video
            ref={videoRef}
            src={heroConfig.videoSrc}
            poster={heroConfig.posterSrc || undefined}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[var(--industry)] via-[#9bc628] to-[var(--ink)]">
            {/* Subtle animated light sweep across lime slab */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              animate={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { x: ["-100%", "200%"] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 4, repeat: Infinity, ease: "linear" }
              }
            />
          </div>
        )}

        {/* Lime Duotone / Brand Tint Overlay (~25% opacity) */}
        <div
          className="absolute inset-0 bg-[var(--industry)]/25 pointer-events-none mix-blend-color transition-opacity group-hover:opacity-15"
          aria-hidden="true"
        />

        {/* Subtle Dark Vignette for Cinematic Look */}
        <div
          className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none"
          aria-hidden="true"
        />

        {/* Hover Cue: Viewfinder Play Badge */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full bg-[var(--ink)]/85 border border-[var(--industry)] text-[var(--industry)] font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
            <span>▶</span>
            <span>PLAY REEL</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
