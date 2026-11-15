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
      {/* Maximum Brutalist Video Chassis */}
      <div className="relative w-full border-4 border-[#FF2DA8] bg-[#0B0B0B] shadow-[8px_8px_0px_#D4FF3F] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_#D4FF3F] transition-all cursor-pointer group rounded-none overflow-hidden">
        {/* Top Heavy Metadata Ribbon */}
        <div className="bg-[#FF2DA8] text-[#0B0B0B] px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-between border-b-2 border-[#0B0B0B] select-none">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0B0B0B] animate-pulse" />
            <span>CAM A // SONY FX3</span>
          </div>
          <span className="bg-[#0B0B0B] text-[#D4FF3F] px-1.5 py-0.5 text-[10px] font-mono">
            4K DCI · 24FPS
          </span>
        </div>

        {/* Video Screen Container */}
        <div className="relative aspect-[9/13] sm:aspect-[9/14] md:aspect-[9/12] w-full overflow-hidden bg-[#0B0B0B]">
          {/* Viewfinder Crosshairs */}
          <div className="absolute inset-2 pointer-events-none z-20 flex flex-col justify-between" aria-hidden="true">
            <div className="flex justify-between items-start text-[#D4FF3F] font-mono text-xs font-bold">
              <span>┌</span>
              <span className="text-[10px] bg-[#0B0B0B]/80 px-1 border border-[#D4FF3F]">S-LOG3</span>
              <span>┐</span>
            </div>
            <div className="flex justify-center items-center text-[#D4FF3F]/70 font-mono text-sm">
              <span>+</span>
            </div>
            <div className="flex justify-between items-end text-[#D4FF3F] font-mono text-xs font-bold">
              <span>└</span>
              <span className="text-[10px] bg-[#0B0B0B]/80 px-1 border border-[#D4FF3F]">ISO 800</span>
              <span>┘</span>
            </div>
          </div>

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
              className="w-full h-full object-cover transition-all duration-300"
              style={{ filter: "url(#duotone-pink)" }}
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden bg-[#0B0B0B] flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(#D4FF3F 1px, transparent 1px), radial-gradient(#FF2DA8 1px, #0B0B0B 1px)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                }}
              />
              <div className="relative z-10 flex flex-col items-center gap-2 text-center p-4">
                <span className="font-mono text-xs text-[#D4FF3F] uppercase tracking-widest border-2 border-[#D4FF3F] px-2 py-0.5 bg-[#0B0B0B] font-bold">
                  SONY FX3 // 4K 24FPS
                </span>
                <span className="font-display font-black text-2xl text-[#FF2DA8] uppercase tracking-tight">
                  THAMIRA RESTAURANT
                </span>
                <span className="font-mono text-xs text-[#D4FF3F] font-bold">
                  10.1K VIEWS // 00:30 S-LOG3
                </span>
              </div>
            </div>
          )}

          {/* Hover Cue: Viewfinder Play Badge */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 z-30 pointer-events-none bg-[#0B0B0B]/40">
            <div className="px-5 py-2.5 bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_#FF2DA8] border-2 border-[#0B0B0B]">
              <NeonPlay className="size-3.5 inline-block text-[#0B0B0B]" />
              <span>PLAY REEL [4K]</span>
            </div>
          </div>
        </div>

        {/* Bottom Brutalist Diagnostic Readout */}
        <div className="bg-[#0B0B0B] border-t-2 border-[#FF2DA8] px-3 py-2 flex items-center justify-between text-xs font-mono select-none">
          <span className="text-[#FF2DA8] font-bold">THAMIRA // RESTAURANT</span>
          <span className="text-[#D4FF3F] font-black">10.1K VIEWS</span>
        </div>
      </div>
    </motion.div>
  );
}
