"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LiveTimecode } from "./live-timecode";

interface SlateHeaderProps {
  businessName?: string;
  businessTypeLabel?: string;
  sceneCode: string;
  rollCode: string;
  takeCount: number;
  isSubmitting?: boolean;
  isFrozen?: boolean;
  frozenTimecode?: string;
  onTimecodeUpdate?: (tc: string) => void;
  reducedMotion?: boolean;
}

export function SlateHeader({
  businessName,
  businessTypeLabel,
  sceneCode,
  rollCode,
  takeCount,
  isSubmitting = false,
  isFrozen = false,
  frozenTimecode,
  onTimecodeUpdate,
  reducedMotion = false,
}: SlateHeaderProps) {
  const displayProd = businessName?.trim() ? businessName.trim() : "27 STUDIO";

  return (
    <div className="clapper-slate-header flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#2A2A30] font-mono text-xs uppercase tracking-wider">
      {/* PROD: Displays business name as typed with fallback REC + red dot */}
      <div className="flex items-center gap-2 max-w-[240px] sm:max-w-[320px]">
        <span className="text-[#A9A7A0] shrink-0">PROD.</span>
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-[#F4F1EA] font-bold truncate">{displayProd}</span>
          <span
            className="w-2 h-2 rounded-full bg-[#FF3B30] shadow-[0_0_8px_#FF3B30] shrink-0 animate-pulse"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Central Running Timecode (hidden on mobile) */}
      <div className="hidden md:flex items-center justify-center">
        <LiveTimecode
          isFrozen={isFrozen || isSubmitting}
          frozenValue={frozenTimecode}
          onTimecodeUpdate={onTimecodeUpdate}
        />
      </div>

      {/* ROLL / SCENE / TAKE Meta */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* ROLL */}
        <div className="flex items-center gap-1.5" title="Deliverables Roll Code">
          <span className="text-[#A9A7A0]">ROLL</span>
          <span className="text-[#F4F1EA] font-bold">{rollCode}</span>
        </div>

        {/* SCENE */}
        <div
          className="flex items-center gap-1.5 cursor-help"
          title={businessTypeLabel ? `Business scene: ${businessTypeLabel}` : "Scene category"}
        >
          <span className="text-[#A9A7A0]">SCENE</span>
          <span className="text-[#F4F1EA] font-bold">{sceneCode}</span>
        </div>

        {/* TAKE: Rolling number */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#A9A7A0]">TAKE</span>
          <div className="relative h-4 overflow-hidden inline-flex items-center min-w-[28px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={takeCount}
                initial={reducedMotion ? false : { y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reducedMotion ? undefined : { y: -14, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="text-[#C6FF3D] font-bold block"
              >
                #{String(takeCount).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
