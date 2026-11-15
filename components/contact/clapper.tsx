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
        className="relative h-12 w-full rounded-none border-3 border-[#FF2DA8] cursor-pointer overflow-hidden z-20 shadow-[6px_6px_0px_#D4FF3F]"
        style={{
          transformOrigin: "bottom left",
          backgroundColor: "#0B0B0B",
          backgroundImage:
            "repeating-linear-gradient(-45deg, #D4FF3F 0, #D4FF3F 18px, #0B0B0B 18px, #0B0B0B 36px)",
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-none border-2 border-[#FF2DA8] bg-[#0B0B0B] flex items-center justify-center shadow-[2px_2px_0px_#D4FF3F]">
          <div className="w-2.5 h-2.5 rounded-none bg-[#D4FF3F]" />
        </div>
      </motion.div>

      {/* Bottom Fixed Clapper Stick */}
      <div
        className="relative h-12 w-full border-3 border-[#FF2DA8] border-t-0 overflow-hidden z-10"
        style={{
          backgroundColor: "#0B0B0B",
          backgroundImage:
            "repeating-linear-gradient(-45deg, #D4FF3F 0, #D4FF3F 18px, #0B0B0B 18px, #0B0B0B 36px)",
        }}
      >
        {/* Hinge Pivot on Bottom Bar */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-none border-2 border-[#FF2DA8] bg-[#0B0B0B] flex items-center justify-center shadow-[2px_2px_0px_#D4FF3F]">
          <div className="w-2.5 h-2.5 rounded-none bg-[#D4FF3F]" />
        </div>
      </div>
    </div>
  );
}
