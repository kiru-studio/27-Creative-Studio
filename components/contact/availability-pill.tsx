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
      className="inline-flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#2A2A30] bg-[#141419]/90 text-xs font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      role="status"
      aria-label={`${availabilityText}. ${replyTime}.`}
    >
      <div className="flex items-center gap-1.5">
        <motion.span
          className="w-2 h-2 rounded-full bg-[#C6FF3D] shadow-[0_0_8px_#C6FF3D]"
          animate={
            reducedMotion
              ? undefined
              : { scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <span className="text-[#F4F1EA] font-semibold">{availabilityText}</span>
      </div>

      <span className="text-[#A9A7A0]/40 select-none" aria-hidden="true">
        /
      </span>

      <span className="text-[#A9A7A0] tracking-wider">{replyTime}</span>
    </div>
  );
}
