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
      className="flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--line)] w-full"
    >
      <span className="font-mono text-xs text-[var(--muted)] uppercase tracking-wider mr-2 select-none">
        Format:
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
            className={`relative px-3.5 py-1.5 rounded-full border text-xs font-mono tracking-wider transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] cursor-pointer ${
              isActive
                ? "text-[var(--paper)] font-semibold border-transparent"
                : "text-[var(--muted)] border-[var(--line)] bg-[var(--panel)]/60 hover:text-[var(--paper)] hover:border-[var(--industry)]/40"
            }`}
          >
            {/* Active lime pill border & subtle glow */}
            {isActive && (
              <motion.div
                layoutId="active-format-pill"
                className="absolute inset-0 rounded-full border-2 border-[var(--industry)] bg-[var(--industry)]/10 shadow-[0_0_12px_rgba(198,255,61,0.2)]"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 30 }
                }
              />
            )}
            <span className="relative z-10">{format.fullLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

