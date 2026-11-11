"use client";

import { motion } from "framer-motion";

interface FocusRingProps {
  stepIndex: number;
  reducedMotion?: boolean;
}

export function FocusRing({ stepIndex, reducedMotion }: FocusRingProps) {
  const rotationAngle = stepIndex * 60;

  return (
    <div className="absolute inset-0 pointer-events-none rounded-full" aria-hidden="true">
      {/* Outer focus ring housing */}
      <div className="absolute inset-0 rounded-full border border-[var(--line)] bg-[var(--panel)]/80 shadow-[inset_0_0_24px_rgba(0,0,0,0.9)]" />

      {/* 48 radial tick marks with rotation */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: reducedMotion ? 0 : rotationAngle }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        {Array.from({ length: 48 }, (_, i) => {
          const isMajor = i % 6 === 0;
          const angle = i * 7.5;
          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-46%)`,
              }}
            >
              <div
                className={`w-[1.5px] transition-colors duration-300 ${
                  isMajor ? "h-3 bg-[var(--paper)]" : "h-1.5 bg-[var(--muted)]/35"
                }`}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Concentric knurled ridges */}
      <div className="absolute inset-[10%] rounded-full border border-[var(--line)] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]" />
      <div className="absolute inset-[16%] rounded-full border border-dashed border-[var(--line)]/80" />
      <div className="absolute inset-[22%] rounded-full border border-[var(--line)]" />
      
      {/* Aperture ring glass rim with subtle specular highlight */}
      <div className="absolute inset-[24%] rounded-full border border-[var(--muted)]/20 bg-gradient-to-br from-white/5 via-transparent to-black/60" />
    </div>
  );
}

