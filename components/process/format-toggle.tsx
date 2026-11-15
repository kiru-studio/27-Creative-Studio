"use client";

import { motion } from "framer-motion";
import type { TurnaroundFormat, TurnaroundFormatId } from "@/data/process";

interface FormatToggleProps {
  formats: TurnaroundFormat[];
  activeFormatId: TurnaroundFormatId;
  onSelectFormat: (id: TurnaroundFormatId) => void;
  reducedMotion?: boolean;
}

export function FormatToggle({
  formats,
  activeFormatId,
  onSelectFormat,
  reducedMotion = false,
}: FormatToggleProps) {
  return (
    <div
      role="group"
      aria-label="Turnaround format selection"
      className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#FF2DA8]/30 w-full"
    >
      <span className="font-mono text-xs text-[#FF2DA8] uppercase tracking-wider mr-2 select-none font-bold">
        FORMAT SPEC:
      </span>
      {formats.map((format) => {
        const isActive = activeFormatId === format.id;
        return (
          <button
            key={format.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelectFormat(format.id)}
            className={`relative px-3.5 py-1.5 border text-xs font-mono tracking-wider transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F] cursor-pointer ${
              isActive
                ? "text-[#0B0B0B] font-bold border-[#D4FF3F] bg-[#D4FF3F]"
                : "text-[#D4FF3F] border-[#FF2DA8]/40 bg-[#0B0B0B] hover:text-[#FF2DA8] hover:border-[#D4FF3F]"
            }`}
          >
            <span className="relative z-10 uppercase">{format.fullLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
