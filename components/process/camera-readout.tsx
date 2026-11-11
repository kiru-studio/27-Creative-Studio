"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LensConfig } from "@/data/process";

interface CameraReadoutProps {
  lensConfig: LensConfig;
  reducedMotion?: boolean;
}

export function CameraReadout({ lensConfig, reducedMotion }: CameraReadoutProps) {
  const { aperture, shutterSpeed, iso } = lensConfig;

  return (
    <div
      className="relative flex items-center justify-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0B0F]/90 border border-[#2A2A30] font-mono text-[10px] sm:text-[11px] text-[#C6FF3D] tracking-wider select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] overflow-hidden"
      role="status"
      aria-label={`Camera readout: ${aperture}, ${shutterSpeed}, ${iso}`}
    >
      {/* Subtle LCD scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(198,255,61,0.2)_1px,transparent_1px)] bg-[size:100%_2px]"
        aria-hidden="true"
      />

      {/* Aperture Roll */}
      <div className="relative h-4 overflow-hidden inline-flex items-center min-w-[28px] justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={aperture}
            initial={reducedMotion ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="block whitespace-nowrap font-semibold"
          >
            {aperture}
          </motion.span>
        </AnimatePresence>
      </div>

      <span className="text-[#A9A7A0]/60 text-[9px] select-none" aria-hidden="true">
        ·
      </span>

      {/* Shutter Speed Roll */}
      <div className="relative h-4 overflow-hidden inline-flex items-center min-w-[34px] justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={shutterSpeed}
            initial={reducedMotion ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="block whitespace-nowrap text-[#F4F1EA]"
          >
            {shutterSpeed}
          </motion.span>
        </AnimatePresence>
      </div>

      <span className="text-[#A9A7A0]/60 text-[9px] select-none" aria-hidden="true">
        ·
      </span>

      {/* ISO Roll */}
      <div className="relative h-4 overflow-hidden inline-flex items-center min-w-[48px] justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={iso}
            initial={reducedMotion ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="block whitespace-nowrap text-[#A9A7A0]"
          >
            {iso}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

