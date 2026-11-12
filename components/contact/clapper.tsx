"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ClapperProps {
  isShut: boolean;
  reducedMotion?: boolean;
  onPlayfulSnap?: () => void;
}

export function Clapper({
  isShut,
  reducedMotion = false,
  onPlayfulSnap,
}: ClapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [isHovered, setIsHovered] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const handleArmClick = () => {
    if (isShut || reducedMotion) return;
    setIsSnapping(true);
    onPlayfulSnap?.();
    setTimeout(() => {
      setIsSnapping(false);
    }, 320);
  };

  // Determine arm angle
  // Keep the lid within the contact section at every responsive width.
  // Shut / Submitting / Snapping: 0deg
  // Hover: -3.5deg
  // Pre-scroll: -4deg
  let targetRotation = -4;

  if (reducedMotion) {
    targetRotation = isShut ? 0 : -4;
  } else if (isShut || isSnapping) {
    targetRotation = 0;
  } else if (isHovered) {
    targetRotation = -3.5;
  } else if (!isInView) {
    targetRotation = -4;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full mb-[-1px] select-none"
      aria-hidden="true"
    >
      {/* Top Movable Clapper Arm */}
      <motion.div
        className="relative h-10 w-full rounded-t-lg border border-[#2A2A30] cursor-pointer overflow-hidden z-20 shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
        style={{
          transformOrigin: "bottom left",
          backgroundColor: "#1B1B21",
          backgroundImage:
            "repeating-linear-gradient(-45deg, #F4F1EA 0, #F4F1EA 18px, #0B0B0F 18px, #0B0B0F 36px)",
        }}
        animate={{
          rotate: targetRotation,
          y: isShut || isSnapping ? 0 : -2,
        }}
        transition={
          isShut || isSnapping
            ? { type: "spring", stiffness: 420, damping: 24 }
            : { type: "spring", stiffness: 100, damping: 16 }
        }
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleArmClick}
        title="Click to clap!"
      >
        {/* Subtle Arm Sway on idle (non-reduced motion) */}
        {!isShut && !isSnapping && !isHovered && isInView && !reducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ rotate: [-0.3, 0.3, -0.3] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "bottom left" }}
          />
        )}

        {/* Hinge Pivot on Top Arm */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-[#2A2A30] bg-[#141419] flex items-center justify-center shadow-md">
          <div className="w-2 h-2 rounded-full bg-[#A9A7A0]" />
        </div>
      </motion.div>

      {/* Bottom Fixed Clapper Stick */}
      <div
        className="relative h-10 w-full border border-[#2A2A30] border-t-0 overflow-hidden z-10"
        style={{
          backgroundColor: "#1B1B21",
          backgroundImage:
            "repeating-linear-gradient(-45deg, #F4F1EA 0, #F4F1EA 18px, #0B0B0F 18px, #0B0B0F 36px)",
        }}
      >
        {/* Hinge Pivot on Bottom Bar */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-[#2A2A30] bg-[#141419] flex items-center justify-center shadow-md">
          <div className="w-2 h-2 rounded-full bg-[#A9A7A0]" />
        </div>
      </div>
    </div>
  );
}
