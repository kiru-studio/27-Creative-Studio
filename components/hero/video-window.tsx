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
      {/* Outer Container with Floating Transparent Logo */}
      <div
        className="hero-logo-window relative w-full h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group bg-transparent flex items-center justify-center"
      >
        {/* 27 Creative Studio Transparent Logo */}
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
          <img
            src={heroConfig.logoSrc || "/images/27-logo.png"}
            alt="27 Creative Studio"
            className="w-full h-full object-contain max-w-[90%] max-h-[90%] drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] transition-transform duration-500 group-hover:scale-105 select-none"
            loading="eager"
          />

        </div>

        {/* Hover Cue: Viewfinder Play Showreel Badge */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none bg-black/20 backdrop-blur-[2px] rounded-2xl">
          <div className="px-4 py-2 rounded-full bg-[var(--ink,#0B0B0F)]/90 border border-[var(--industry,#C6FF3D)] text-[var(--industry,#C6FF3D)] font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_24px_rgba(198,255,61,0.35)]">
            <span className="size-2 rounded-full bg-[var(--rec,#FF3B30)] animate-pulse" />
            <span className="font-bold">WATCH SHOWREEL</span>
          </div>
        </div>

        {/* Bottom studio watermark */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none">
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/40 group-hover:text-[var(--industry,#C6FF3D)]/80 transition-colors">
            STUDIO 27 // THOOTHUKUDI
          </span>
        </div>
      </div>
    </motion.div>
  );
}
