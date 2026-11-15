"use client";

import React, { useRef, useState, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, Minus, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import {
  Package,
  packages as defaultPackages,
  packageComparisonRows,
} from "@/data/packages";
import { siteConfig } from "@/data/siteConfig";
import { siteContent } from "@/lib/site-content";

// ==========================================
// PACKAGES / WAYS OF WORKING SECTION
// ==========================================

export interface PackagesSectionProps {
  packageList?: Package[];
  className?: string;
}

export function PackagesSection({
  packageList,
  className = "",
}: PackagesSectionProps) {
  const activePackages: Package[] = useMemo(() => {
    if (packageList && packageList.length > 0) return packageList;
    if (siteContent.packages && siteContent.packages.length > 0) {
      return siteContent.packages.map((pkg, idx) => ({
        id: pkg.id || `package-${idx + 1}`,
        tierNumber: pkg.tierNumber || `TIER // 0${idx + 1}`,
        tierLabel: pkg.tierLabel || "",
        name: pkg.name,
        tagline: pkg.tagline || pkg.description || "",
        deliverables: pkg.deliverables || (pkg.detail ? pkg.detail.split(" · ") : ["Full production"]),
        cta: pkg.cta || "RESERVE DATES",
        serial: pkg.serial || `FX3-0${idx + 1}-27CREATIVE-TN`,
        popular: Boolean(pkg.popular),
      }));
    }
    return defaultPackages;
  }, [packageList]);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="packages"
      aria-labelledby="packages-heading"
      className={`packages-section relative min-h-screen w-full flex flex-col justify-center py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-[#FF2DA8]/20 bg-[#0B0B0B] overflow-hidden ${className}`}
    >
      <div className="relative z-10 mx-auto max-w-7xl w-full">
        {/* ------------------------------------------ */}
        {/* SECTION HEADER                             */}
        {/* ------------------------------------------ */}
        <div className="section-intro mb-16 sm:mb-20">
          <motion.div
            className="mb-3 select-none"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-[#D4FF3F] font-bold block m-0">
              // {siteContent.ui.packagesKicker}
            </p>
          </motion.div>

          <h2 id="packages-heading" className="flex flex-col items-start m-0">
            <span className="overflow-hidden block leading-none">
              <motion.span
                className="block font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-[#FF2DA8]"
                initial={shouldReduceMotion ? false : { y: "100%" }}
                animate={isInView ? { y: 0 } : { y: "100%" }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1] as const,
                  delay: shouldReduceMotion ? 0 : 0.1,
                }}
              >
                PICK THE SHAPE
              </motion.span>
            </span>
            <span className="overflow-hidden block leading-none">
              <motion.span
                className="block font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-[#D4FF3F]"
                initial={shouldReduceMotion ? false : { y: "100%" }}
                animate={isInView ? { y: 0 } : { y: "100%" }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1] as const,
                  delay: shouldReduceMotion ? 0 : 0.2,
                }}
              >
                OF THE WORK.
              </motion.span>
            </span>
          </h2>

          <motion.p
            className="text-base sm:text-lg text-[#D4FF3F]/90 mt-4 max-w-2xl leading-relaxed m-0 font-mono"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            Three commercial retainer structures to produce cinematic vertical reels, build brand authority, and dominate Tamil Nadu search & feeds.
          </motion.p>
        </div>

        {/* ------------------------------------------ */}
        {/* 3-CARD HARDWARE RACK / SD-CARD MATRIX     */}
        {/* ------------------------------------------ */}
        <div
          role="region"
          aria-label="Ways of working"
          className="flex flex-col gap-8 md:grid md:grid-cols-3 md:gap-7 lg:gap-8 items-stretch pt-2"
        >
          {activePackages.map((pkg, index) => {
            const isHovered = hoveredId === pkg.id;
            const isOtherHovered = hoveredId !== null && !isHovered;

            const sdClipPath =
              "polygon(28px 0%, 100% 0%, 100% 72px, calc(100% - 6px) 72px, calc(100% - 6px) 118px, 100% 118px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 152px, 6px 152px, 6px 132px, 0% 132px, 0% 28px)";

            return (
              <motion.article
                key={pkg.id}
                role="article"
                aria-label={pkg.name}
                className="relative group transition-all duration-300 min-h-[580px] flex flex-col"
                style={{
                  opacity: isOtherHovered && !shouldReduceMotion ? 0.65 : 1,
                }}
                onMouseEnter={() => setHoveredId(pkg.id)}
                onMouseLeave={() => setHoveredId((curr) => (curr === pkg.id ? null : curr))}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{
                  opacity: isOtherHovered && !shouldReduceMotion ? 0.65 : 1,
                  y: isHovered && !shouldReduceMotion ? -8 : 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: shouldReduceMotion ? 0 : 0.15 + index * 0.08,
                  ease: "easeOut",
                }}
              >
                {/* Outer Card Housing */}
                <div
                  className="p-[1.5px] bg-[#FF2DA8] group-hover:bg-[#D4FF3F] transition-colors duration-300 shadow-[0_0_25px_rgba(255,45,168,0.25)] group-hover:shadow-[0_0_35px_rgba(212,255,63,0.35)] w-full h-full flex flex-col"
                  style={{
                    clipPath: sdClipPath,
                  }}
                >
                  {/* Inner Chassis */}
                  <div
                    className="bg-[#0B0B0B] overflow-hidden flex flex-col justify-between w-full h-full relative"
                    style={{
                      clipPath: sdClipPath,
                    }}
                  >
                    {/* Top Hardware Terminal Pins */}
                    <div className="relative bg-[#0B0B0B] border-b-2 border-[#FF2DA8]/40 pt-2 pb-2.5 px-3 select-none">
                      {/* Pins Row */}
                      <div className="flex items-stretch h-11 gap-[3px] ml-4.5 mr-1">
                        {/* Chamfer Corner Contact */}
                        <div className="w-5 h-7 self-end bg-[#0B0B0B] border border-[#FF2DA8] p-[2px] flex items-center justify-center mr-1">
                          <div className="w-full h-full bg-[#D4FF3F] shadow-[0_0_8px_#D4FF3F]" />
                        </div>

                        {/* 8 Primary Chartreuse Conductive Pins */}
                        <div className="flex-1 flex items-stretch gap-[3px] bg-[#0B0B0B] p-[2px] border border-[#FF2DA8]/60">
                          {Array.from({ length: 8 }).map((_, pIdx) => (
                            <React.Fragment key={pIdx}>
                              <div className="flex-1 bg-[#D4FF3F] shadow-[0_0_6px_#D4FF3F] relative overflow-hidden group-hover:bg-[#FF2DA8] group-hover:shadow-[0_0_8px_#FF2DA8] transition-colors duration-300" />
                              {pIdx < 7 && (
                                <div className="w-[3px] bg-[#0B0B0B] border-x border-[#FF2DA8]/40 self-stretch" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Stepped Shelf Ridge Line */}
                      <div className="h-[2px] bg-[#FF2DA8]/40 w-full mt-2" />
                    </div>

                    {/* Card Body Content */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header: Tier with Status Pin Dot */}
                        <div className="flex items-center justify-between mb-3 select-none">
                          <span className="font-mono text-xs tracking-widest uppercase text-[#D4FF3F] font-bold">
                            {pkg.tierNumber}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-[#D4FF3F] group-hover:bg-[#FF2DA8] group-hover:shadow-[0_0_8px_#FF2DA8] transition-all" />
                        </div>

                        {/* Service Name */}
                        <h3 className="font-display font-black uppercase text-xl sm:text-2xl text-[#FF2DA8] m-0 leading-tight tracking-tight group-hover:text-[#D4FF3F] transition-colors [word-break:keep-all] [overflow-wrap:normal]">
                          {pkg.name}
                        </h3>

                        {/* Positioning / Outcome Subtitle */}
                        <p className="text-sm font-mono text-[#D4FF3F] mt-2.5 mb-5 leading-relaxed min-h-[2.75rem]">
                          {pkg.tagline}
                        </p>

                        {/* Hairline Divider */}
                        <div className="h-px w-full bg-[#FF2DA8]/30 group-hover:bg-[#D4FF3F]/40 transition-colors my-4" />

                        {/* Deliverables Section: SCOPE */}
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#FF2DA8] font-bold mb-3 select-none">
                          [ PRODUCTION SCOPE ]
                        </div>

                        {/* Key Deliverables inline with chartreuse separators */}
                        <div className="text-sm font-mono text-[#D4FF3F] leading-relaxed mb-6">
                          {pkg.deliverables.map((item, dIdx) => (
                            <React.Fragment key={dIdx}>
                              <span>{item}</span>
                              {dIdx < pkg.deliverables.length - 1 && (
                                <span className="text-[#FF2DA8] mx-2 font-bold select-none">
                                  //
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Card Action CTA & Laser-Etched Serial */}
                      <div className="pt-2">
                        <a
                          href={siteConfig.contactAnchor || "#contact"}
                          className="w-full text-center py-3.5 px-6 text-xs font-mono font-black uppercase tracking-widest bg-[#D4FF3F] text-[#0B0B0B] inline-flex items-center justify-center gap-2 hover:bg-[#FF2DA8] hover:text-[#0B0B0B] transition-colors group/cta shadow-[0_0_15px_rgba(212,255,63,0.3)]"
                        >
                          <span>{pkg.cta || "TALK TO US"}</span>
                          <ArrowRight
                            className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-1.5"
                            aria-hidden="true"
                          />
                        </a>

                        {/* Laser-Etched Serial Stamp */}
                        <div
                          className="text-center font-mono text-[9px] tracking-widest uppercase text-[#FF2DA8] mt-3.5 select-none font-bold"
                          aria-hidden="true"
                        >
                          {pkg.serial || `FX3-0${index + 1}-27CREATIVE`} • SONY FX3 4K
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ------------------------------------------ */}
        {/* INTERACTIVE SPECIFICATION MATRIX DRAWER    */}
        {/* ------------------------------------------ */}
        <div className="mt-16 sm:mt-20 text-center">
          <button
            type="button"
            onClick={() => setShowComparison((prev) => !prev)}
            aria-expanded={showComparison}
            aria-controls="packages-comparison-table"
            className="inline-flex items-center gap-2.5 py-3.5 px-7 border border-[#FF2DA8] bg-[#0B0B0B] hover:border-[#D4FF3F] hover:text-[#D4FF3F] transition-all font-mono text-xs uppercase tracking-widest text-[#FF2DA8] shadow-[0_0_15px_rgba(255,45,168,0.2)] group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F]"
          >
            <SlidersHorizontal
              className="w-4 h-4 text-[#D4FF3F] transition-transform duration-300 group-hover:rotate-180"
              aria-hidden="true"
            />
            <span>
              {showComparison
                ? "[ COLLAPSE TECHNICAL SPECIFICATIONS ▲ ]"
                : "[ EXPAND TECHNICAL SPECIFICATION MATRIX ▼ ]"}
            </span>
          </button>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                id="packages-comparison-table"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden mt-8 text-left"
              >
                <div className="border border-[#FF2DA8] bg-[#0B0B0B] p-5 sm:p-7 lg:p-9 shadow-[0_0_30px_rgba(255,45,168,0.25)] overflow-x-auto">
                  <div className="mb-5 pb-3 border-b border-[#FF2DA8]/30 flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-black text-2xl uppercase tracking-tight text-[#FF2DA8] m-0">
                        Detailed Deliverable Matrix
                      </h4>
                      <p className="font-mono text-xs text-[#D4FF3F] mt-1 m-0">
                        Side-by-side technical comparison across studio engagement tiers.
                      </p>
                    </div>
                    <span className="hidden sm:inline-block font-mono text-[10px] text-[#0B0B0B] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#D4FF3F]">
                      STUDIO SPEC MATRIX
                    </span>
                  </div>

                  <table className="w-full border-collapse font-mono text-xs sm:text-sm text-left">
                    <thead>
                      <tr className="border-b border-[#FF2DA8]/40 text-xs font-mono uppercase tracking-wider text-[#FF2DA8]">
                        <th className="py-3.5 pr-4 font-bold">Deliverable / Capability</th>
                        <th className="py-3.5 px-3 font-bold text-center w-1/4 text-[#D4FF3F]">
                          01 / Starter
                        </th>
                        <th className="py-3.5 px-3 font-bold text-center w-1/4 text-[#FF2DA8]">
                          02 / Recommended
                        </th>
                        <th className="py-3.5 px-3 font-bold text-center w-1/4 text-[#D4FF3F]">
                          03 / Full Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FF2DA8]/20">
                      {packageComparisonRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-[#FF2DA8]/5 transition-colors"
                        >
                          <td className="py-3.5 pr-4 text-[#D4FF3F] font-bold">
                            {row.feature}
                          </td>

                          {/* Tier 1 */}
                          <td className="py-3.5 px-3 text-center">
                            {typeof row.tier1 === "boolean" ? (
                              row.tier1 ? (
                                <Check className="w-4 h-4 mx-auto text-[#D4FF3F]" />
                              ) : (
                                <Minus className="w-4 h-4 mx-auto text-[#FF2DA8]/40" />
                              )
                            ) : (
                              <span className="font-mono text-xs text-[#D4FF3F]">
                                {row.tier1}
                              </span>
                            )}
                          </td>

                          {/* Tier 2 */}
                          <td className="py-3.5 px-3 text-center">
                            {typeof row.tier2 === "boolean" ? (
                              row.tier2 ? (
                                <Check className="w-4 h-4 mx-auto text-[#FF2DA8]" />
                              ) : (
                                <Minus className="w-4 h-4 mx-auto text-[#FF2DA8]/40" />
                              )
                            ) : (
                              <span className="font-mono text-xs text-[#FF2DA8] font-bold">
                                {row.tier2}
                              </span>
                            )}
                          </td>

                          {/* Tier 3 */}
                          <td className="py-3.5 px-3 text-center">
                            {typeof row.tier3 === "boolean" ? (
                              row.tier3 ? (
                                <Check className="w-4 h-4 mx-auto text-[#D4FF3F]" />
                              ) : (
                                <Minus className="w-4 h-4 mx-auto text-[#FF2DA8]/40" />
                              )
                            ) : (
                              <span className="font-mono text-xs text-[#D4FF3F] font-bold">
                                {row.tier3}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#FF2DA8]/40 pt-4">
                        <td className="py-4 pr-4 font-mono text-xs text-[#D4FF3F]">
                          Ready to proceed?
                        </td>
                        <td className="py-4 px-3 text-center">
                          <a
                            href={siteConfig.contactAnchor || "#contact"}
                            className="inline-block py-2 px-3 text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0B0B0B] border border-[#D4FF3F] text-[#D4FF3F] hover:bg-[#D4FF3F] hover:text-[#0B0B0B] transition-colors"
                          >
                            Select Starter
                          </a>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <a
                            href={siteConfig.contactAnchor || "#contact"}
                            className="inline-block py-2 px-3 text-[11px] font-mono font-bold uppercase tracking-wider bg-[#FF2DA8] text-[#0B0B0B] hover:bg-[#D4FF3F] transition-colors"
                          >
                            Select Recommended
                          </a>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <a
                            href={siteConfig.contactAnchor || "#contact"}
                            className="inline-block py-2 px-3 text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0B0B0B] border border-[#D4FF3F] text-[#D4FF3F] hover:bg-[#D4FF3F] hover:text-[#0B0B0B] transition-colors"
                          >
                            Select Full Growth
                          </a>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default PackagesSection;
