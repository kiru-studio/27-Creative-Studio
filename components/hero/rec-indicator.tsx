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
        className="inline-block w-2.5 h-2.5 bg-[#FF2DA8] shadow-[0_0_8px_#FF2DA8]"
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: [1, 0.2, 1] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
        }
        aria-hidden="true"
      />
      <span className="font-mono text-xs uppercase tracking-widest font-bold text-[#FF2DA8]">
        {label}
      </span>
    </div>
  );
}
