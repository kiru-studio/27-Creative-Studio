"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ScribbleUnderlineProps {
  color?: "lime" | "pink" | "ink";
  className?: string;
  width?: number | string;
}

/**
 * Expressive hand-drawn scribble underline that draws on when entering viewport.
 * Fully respects prefers-reduced-motion.
 */
export function ScribbleUnderline({
  color = "lime",
  className = "",
  width = "100%",
}: ScribbleUnderlineProps) {
  const shouldReduceMotion = useReducedMotion();
  const strokeColor =
    color === "pink" ? "#FF2DA8" : color === "ink" ? "#0B0B0B" : "#D4FF3F";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none inline-block ${className}`}
      style={{ width, height: "auto" }}
    >
      <motion.path
        d="M3 11C45 4 125 3 237 8C190 12 110 14 35 15C85 16 165 14 220 12"
        stroke={strokeColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.75,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </svg>
  );
}
