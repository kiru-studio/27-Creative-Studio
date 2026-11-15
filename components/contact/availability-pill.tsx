"use client";

import { motion } from "framer-motion";

interface AvailabilityPillProps {
  availabilityText: string;
  replyTime: string;
  reducedMotion?: boolean;
}

export function AvailabilityPill({
  availabilityText,
  replyTime,
  reducedMotion = false,
}: AvailabilityPillProps) {
  return (
    <div
      className="inline-flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#FF2DA8] bg-[#0B0B0B]/90 text-xs font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      role="status"
      aria-label={`${availabilityText}. ${replyTime}.`}
    >
      <div className="flex items-center gap-1.5">
        <motion.span
          className="w-2 h-2 rounded-full bg-[#D4FF3F] shadow-[0_0_8px_#D4FF3F]"
          animate={
            reducedMotion
              ? undefined
              : { scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <span className="text-[#D4FF3F] font-semibold">{availabilityText}</span>
      </div>

      <span className="text-[#D4FF3F]/40 select-none" aria-hidden="true">
        /
      </span>

      <span className="text-[#D4FF3F] tracking-wider">{replyTime}</span>
    </div>
  );
}
