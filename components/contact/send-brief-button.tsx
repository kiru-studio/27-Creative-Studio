"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface SendBriefButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  reducedMotion?: boolean;
}

export function SendBriefButton({
  isLoading,
  disabled = false,
  reducedMotion = false,
}: SendBriefButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Magnetic hover tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 250, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion || !buttonRef.current || isLoading || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    // Limit to max 6px
    mouseX.set(Math.max(-6, Math.min(6, x * 0.15)));
    mouseY.set(Math.max(-6, Math.min(6, y * 0.15)));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.button
      ref={buttonRef}
      type="submit"
      disabled={isLoading || disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: reducedMotion ? 0 : smoothX,
        y: reducedMotion ? 0 : smoothY,
        backgroundColor: "var(--industry, #C6FF3D)",
        color: "var(--ink, #0B0B0F)",
      }}
      className="group relative flex-1 min-h-[48px] px-6 py-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(198,255,61,0.25)] hover:shadow-[0_0_24px_rgba(198,255,61,0.45)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF3B30] shadow-[0_0_8px_#FF3B30] animate-pulse" />
          <span style={{ color: "#0B0B0F" }}>Recording...</span>
        </div>
      ) : (
        <>
          <span style={{ color: "#0B0B0F" }}>Send brief</span>
          <ArrowUpRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ stroke: "#0B0B0F" }}
            aria-hidden="true"
          />
        </>
      )}
    </motion.button>
  );
}
