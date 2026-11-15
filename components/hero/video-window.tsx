"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { heroConfig } from "@/data/hero";
import { siteContent } from "@/lib/site-content";
import { NeonPlay } from "@/components/ui/neon-icons";

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
        {/* Video Element or 3-Colour Abstract Cine Frame */}
        {siteContent.hero?.videoSrc || heroConfig.videoSrc ? (
          <video
            ref={videoRef}
            src={siteContent.hero?.videoSrc || heroConfig.videoSrc}
            poster={siteContent.hero?.posterSrc || heroConfig.posterSrc || undefined}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            className="w-full h-full object-cover duotone-pink transition-all duration-500 group-hover:filter-none"
            style={{ filter: "url(#duotone-pink)" }}
          />
        ) : (
          <div className="w-full h-full relative overflow-hidden bg-[#0B0B0B] border border-[#FF2DA8] flex items-center justify-center">
            {/* Halftone / Line Grid in Chartreuse and Pink */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#D4FF3F 1px, transparent 1px), radial-gradient(#FF2DA8 1px, #0B0B0B 1px)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 10px 10px",
              }}
            />
            {/* Kinetic Telemetry Label */}
            <div className="relative z-10 flex flex-col items-center gap-2 text-center p-4">
              <span className="font-mono text-xs text-[#D4FF3F] uppercase tracking-widest border border-[#D4FF3F] px-2 py-0.5">
                SONY FX3 // 4K 24FPS
              </span>
              <span className="font-display font-extrabold text-2xl text-[#FF2DA8] uppercase tracking-tight">
                THAMIRA RESTAURANT
              </span>
              <span className="font-mono text-[10px] text-[#D4FF3F] tracking-widest">
                10.1K VIEWS // 00:30 S-LOG3
              </span>
            </div>
          </div>
        )}

        {/* Hover Cue: Viewfinder Play Badge */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="px-4 py-2 bg-[#0B0B0B] border-2 border-[#D4FF3F] text-[#D4FF3F] font-mono text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl">
            <NeonPlay className="size-3 inline-block" />
            <span>PLAY REEL [4K]</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
