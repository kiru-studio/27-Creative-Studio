"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Package, packages as defaultPackages, getStatsKeys } from "@/data/packages";
import { siteConfig } from "@/data/siteConfig";

// ==========================================
// PACKAGES / WAYS OF WORKING COMPONENT
// ==========================================
// Flexible, cinematic presentation without rigid deliverable promises or fixed numbers.

export interface PackagesTableProps {
  packageList?: Package[];
  className?: string;
}

export function PackagesTable({
  packageList = defaultPackages,
  className = "",
}: PackagesTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  const statsKeys = getStatsKeys(packageList);
  const hasStats = statsKeys.length > 0;

  return (
    <div
      id="packages"
      className={`packages-container relative w-full mb-12 sm:mb-16 ${className}`}
    >
      {/* 3-CARD CINEMATIC ENGAGEMENT GRID (Count-Agnostic) */}
      <div
        role="region"
        aria-label="Ways of working"
        className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
      >
        {packageList.map((pkg, index) => {
          const isHovered = hoveredId === pkg.id;
          const isOtherHovered = hoveredId !== null && !isHovered;

          return (
            <motion.article
              key={pkg.id}
              role="article"
              aria-label={pkg.name}
              className="relative flex flex-col justify-between p-6 sm:p-7 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--panel)]/50 backdrop-blur-xs transition-colors duration-300 hover:border-[var(--industry)] group"
              style={{
                opacity: isOtherHovered && !shouldReduceMotion ? 0.6 : 1,
              }}
              onMouseEnter={() => setHoveredId(pkg.id)}
              onMouseLeave={() => setHoveredId((curr) => (curr === pkg.id ? null : curr))}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{
                opacity: isOtherHovered && !shouldReduceMotion ? 0.6 : 1,
                y: isHovered && !shouldReduceMotion ? -4 : 0,
              }}
              transition={{
                duration: 0.35,
                delay: shouldReduceMotion ? 0 : index * 0.08,
                ease: "easeOut",
              }}
            >
              {/* Card Body */}
              <div>
                {/* Micro Header / Timecode marker */}
                <div className="flex items-center justify-between gap-2 mb-4 select-none">
                  <span className="font-mono text-[11px] tracking-widest uppercase text-[var(--muted)] group-hover:text-[var(--industry)] transition-colors">
                    WAY / 0{index + 1}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[var(--line)] group-hover:bg-[var(--industry)] transition-colors"
                    aria-hidden="true"
                  />
                </div>

                {/* Name */}
                <h3 className="font-display font-bold uppercase text-2xl sm:text-3xl tracking-tight text-[var(--paper)] m-0 leading-tight">
                  {pkg.name}
                </h3>

                {/* Tagline */}
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-2 mb-4 m-0 leading-relaxed min-h-[2.5rem]">
                  {pkg.tagline}
                </p>

                {/* Optional Stats (if ever supplied in data) */}
                {hasStats && pkg.stats && (
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-[var(--line)] mb-4">
                    {statsKeys.map((key) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                          {key}
                        </span>
                        <span className="font-mono text-xs sm:text-sm text-[var(--paper)] mt-0.5">
                          {pkg.stats?.[key] || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hairline Divider */}
                <div
                  className="h-px w-full bg-[var(--line)] group-hover:bg-[var(--industry)]/40 transition-colors my-4"
                  aria-hidden="true"
                />

                {/* Includes / Scope Line */}
                <div className="text-xs sm:text-sm font-mono text-[var(--paper)] tracking-wide leading-relaxed">
                  <span className="text-[var(--muted)] block text-[10px] uppercase tracking-wider mb-1 select-none">
                    Scope
                  </span>
                  {pkg.includes}
                </div>
              </div>

              {/* Card Footer: CTA Action */}
              <div className="mt-8 pt-2">
                <a
                  href={siteConfig.contactAnchor || "#contact"}
                  style={{ color: "#0B0B0F" }}
                  className="w-full text-center py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-[var(--radius-control)] bg-[var(--industry)] !text-[var(--industry-ink)] inline-flex items-center justify-center gap-1.5 hover:brightness-110 transition-all group/cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)]"
                >
                  <span className="!text-[var(--industry-ink)]" style={{ color: "var(--industry-ink)" }}>{pkg.cta}</span>
                  <span
                    className="inline-block transition-transform duration-250 group-hover/cta:translate-x-1 !text-[var(--industry-ink)]"
                    style={{ color: "#0B0B0F" }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </a>
              </div>

              {/* Viewfinder L-bracket Corner Accent on Hover */}
              <div
                className="absolute top-0 right-0 w-6 h-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute top-2 right-2 w-2 h-[2px] bg-[var(--industry)]" />
                <div className="absolute top-2 right-2 h-2 w-[2px] bg-[var(--industry)]" />
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

export default PackagesTable;
export { PackagesTable as PackagesCards };
