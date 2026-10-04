"use client";

import { motion } from "framer-motion";

interface HudCornersProps {
  shouldReduceMotion?: boolean;
  className?: string;
  insetClassName?: string;
}

export function HudCorners({
  shouldReduceMotion = false,
  className = "",
  insetClassName = "inset-4 sm:inset-6 lg:inset-8",
}: HudCornersProps) {
  // Spring transition for corner snaps
  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        type: "spring" as const,
        stiffness: 260,
        damping: 22,
        delay: 0.1,
      };

  const corners = [
    {
      key: "top-left",
      pos: "top-0 left-0",
      border: "border-t-2 border-l-2",
      initial: shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -32, y: -32 },
    },
    {
      key: "top-right",
      pos: "top-0 right-0",
      border: "border-t-2 border-r-2",
      initial: shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 32, y: -32 },
    },
    {
      key: "bottom-left",
      pos: "bottom-0 left-0",
      border: "border-b-2 border-l-2",
      initial: shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -32, y: 32 },
    },
    {
      key: "bottom-right",
      pos: "bottom-0 right-0",
      border: "border-b-2 border-r-2",
      initial: shouldReduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 32, y: 32 },
    },
  ];

  return (
    <div
      className={`pointer-events-none absolute ${insetClassName} z-20 ${className}`}
      aria-hidden="true"
    >
      {corners.map((corner) => (
        <motion.div
          key={corner.key}
          className={`absolute ${corner.pos} ${corner.border} border-[var(--industry)] w-5 h-5 sm:w-7 sm:h-7`}
          initial={corner.initial}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={springTransition}
        />
      ))}
    </div>
  );
}
