"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { Package, packages as defaultPackages, getStatsKeys } from "@/data/packages";
import { siteConfig } from "@/data/siteConfig";

export interface PackagesTableProps {
  packageList?: Package[];
  className?: string;
}

export function PackagesTable({
  packageList = defaultPackages,
  className = "",
}: PackagesTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const shouldReduceMotion = useHydratedReducedMotion();

  const statsKeys = getStatsKeys(packageList);
  const hasStats = statsKeys.length > 0;

  return (
    <div
      id="packages"
      className={`packages-container relative w-full mb-12 sm:mb-16 bg-[#0B0B0B] ${className}`}
    >
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
              className="relative flex flex-col justify-between p-6 sm:p-7 border border-[#FF2DA8]/40 bg-[#0B0B0B] transition-colors duration-300 hover:border-[#D4FF3F] group"
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
                <div className="flex items-center justify-between gap-2 mb-4 select-none">
                  <span className="font-mono text-xs tracking-widest uppercase text-[#FF2DA8] group-hover:text-[#D4FF3F] transition-colors font-bold">
                    WAY // 0{index + 1}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full bg-[#D4FF3F] group-hover:bg-[#FF2DA8] transition-colors"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="font-display font-black uppercase text-2xl sm:text-3xl tracking-tight text-[#FF2DA8] m-0 leading-tight">
                  {pkg.name}
                </h3>

                <p className="text-xs sm:text-sm font-mono text-[#D4FF3F] mt-2 mb-4 m-0 leading-relaxed min-h-[2.5rem]">
                  {pkg.tagline}
                </p>

                {hasStats && pkg.stats && (
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#FF2DA8]/30 mb-4 font-mono">
                    {statsKeys.map((key) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#FF2DA8] font-bold">
                          {key}
                        </span>
                        <span className="text-xs sm:text-sm text-[#D4FF3F] mt-0.5 font-bold">
                          {pkg.stats?.[key] || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer CTA */}
              <div className="pt-4 border-t border-[#FF2DA8]/20">
                <a
                  href={siteConfig.contactAnchor || "#contact"}
                  className="w-full text-center py-3 px-4 text-xs font-mono font-bold uppercase tracking-widest bg-[#D4FF3F] text-[#0B0B0B] hover:bg-[#FF2DA8] transition-colors block"
                >
                  {pkg.cta || "TALK TO US"}
                </a>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

export default PackagesTable;
