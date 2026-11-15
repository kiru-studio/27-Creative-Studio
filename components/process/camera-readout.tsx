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
      className="relative flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0B0B0B] border border-[#FF2DA8]/60 font-mono text-[10px] sm:text-[11px] text-[#D4FF3F] tracking-widest uppercase select-none shadow-[0_0_15px_rgba(255,45,168,0.15)] overflow-hidden"
      role="status"
      aria-label={`Camera readout: ${aperture}, ${shutterSpeed}, ${iso}`}
    >
      {/* LCD scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(rgba(212,255,63,0.25)_1px,transparent_1px)] bg-[size:100%_2px]"
        aria-hidden="true"
      />

      {/* Aperture Roll */}
      <div className="relative h-4 overflow-hidden inline-flex items-center min-w-[32px] justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={aperture}
            initial={reducedMotion ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="block whitespace-nowrap font-bold text-[#D4FF3F]"
          >
            {aperture}
          </motion.span>
        </AnimatePresence>
      </div>

      <span className="text-[#FF2DA8] text-[9px] select-none" aria-hidden="true">
        //
      </span>

      {/* Shutter Speed Roll */}
      <div className="relative h-4 overflow-hidden inline-flex items-center min-w-[38px] justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={shutterSpeed}
            initial={reducedMotion ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="block whitespace-nowrap font-bold text-[#FF2DA8]"
          >
            {shutterSpeed}
          </motion.span>
        </AnimatePresence>
      </div>

      <span className="text-[#D4FF3F] text-[9px] select-none" aria-hidden="true">
        //
      </span>

      {/* ISO Roll */}
      <div className="relative h-4 overflow-hidden inline-flex items-center min-w-[52px] justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={iso}
            initial={reducedMotion ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="block whitespace-nowrap font-bold text-[#D4FF3F]"
          >
            {iso}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
