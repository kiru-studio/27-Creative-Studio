"use client";

import { motion } from "framer-motion";

interface RecIndicatorProps {
  label?: string;
  shouldReduceMotion?: boolean;
  className?: string;
}

export function RecIndicator({
  label = "rec",
  shouldReduceMotion = false,
  className = "",
}: RecIndicatorProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${className}`}
      aria-label="Recording indicator"
    >
      <motion.span
        className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--rec,#FF3B30)] shadow-[0_0_8px_rgba(255,59,48,0.7)]"
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: [1, 0.25, 1] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
        }
        aria-hidden="true"
      />
      <span className="font-mono text-xs uppercase tracking-wider text-[var(--paper)]">
        {label}
      </span>
    </div>
  );
}
