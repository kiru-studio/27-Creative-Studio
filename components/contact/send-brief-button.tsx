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
        backgroundColor: "var(--industry, #D4FF3F)",
        color: "var(--ink, #0B0B0B)",
      }}
      className="group relative flex-1 min-h-[48px] px-6 py-3 rounded-none font-mono text-xs font-black uppercase tracking-widest border-2 border-[#0B0B0B] shadow-[5px_5px_0px_#FF2DA8] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#FF2DA8] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none flex items-center justify-center gap-2 cursor-pointer"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#FF2DA8] animate-pulse" />
          <span style={{ color: "#0B0B0B" }}>DISPATCHING BRIEF...</span>
        </div>
      ) : (
        <>
          <span style={{ color: "#0B0B0B" }}>SEND BRIEF TO STUDIO</span>
          <ArrowUpRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
            style={{ stroke: "#0B0B0B" }}
            aria-hidden="true"
          />
        </>
      )}
    </motion.button>
  );
}
