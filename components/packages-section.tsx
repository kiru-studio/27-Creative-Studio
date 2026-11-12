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
        tierNumber: pkg.tierNumber || `WAY / 0${idx + 1}`,
        tierLabel: pkg.tierLabel || "",
        name: pkg.name,
        tagline: pkg.tagline || pkg.description || "",
        deliverables: pkg.deliverables || (pkg.detail ? pkg.detail.split(" · ") : ["Full production"]),
        cta: pkg.cta || "TALK TO US",
        serial: pkg.serial || `BM0${idx + 1}04650090G`,
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

  const headingLines = ["Pick the shape", "of the work."];

  return (
    <section
      ref={sectionRef}
      id="packages"
      aria-labelledby="packages-heading"
      className={`packages-section relative min-h-screen w-full flex flex-col justify-center py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)] bg-[var(--ink)] overflow-hidden ${className}`}
    >
      {/* Atmosphere: 4% subtle film-grain overlay */}
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[var(--container-max)] w-full">
        {/* ------------------------------------------ */}
        {/* SECTION HEADER                             */}
        {/* ------------------------------------------ */}
        <div className="section-intro mb-16 sm:mb-20">
          {/* Tag / Kicker with REC Indicator */}
          <motion.div
            className="flex items-center gap-2 mb-3 select-none"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={
              isInView
                ? { opacity: 1 }
                : shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span
              className="w-2 h-2 rounded-full bg-[var(--industry)] shadow-[0_0_8px_var(--industry)] animate-pulse"
              aria-hidden="true"
            />
            <p className="kicker m-0">{siteContent.ui.packagesKicker}</p>
          </motion.div>

          {/* Masked Heading Lines: "Pick the shape of the work." */}
          <h2 id="packages-heading" className="flex flex-col items-start m-0">
            {headingLines.map((line, idx) => (
              <span key={idx} className="overflow-hidden block leading-none">
                <motion.span
                  className="block font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-[var(--paper)]"
                  initial={shouldReduceMotion ? false : { y: "100%" }}
                  animate={
                    isInView
                      ? { y: 0 }
                      : shouldReduceMotion
                      ? { y: 0 }
                      : { y: "100%" }
                  }
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1] as const,
                    delay: shouldReduceMotion ? 0 : 0.1 + idx * 0.1,
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>

          {/* Supporting Subtitle */}
          <motion.p
            className="text-base sm:text-lg text-[var(--paper)]/80 mt-4 max-w-2xl leading-relaxed m-0 font-body"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={
              isInView
                ? { opacity: 1, y: 0 }
                : shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            Three ways to build your brand, create high-velocity reels, and dominate locally.
          </motion.p>
        </div>

        {/* ------------------------------------------ */}
        {/* 3-CARD CINEMATIC SD-CARD GRID (Unified)   */}
        {/* ------------------------------------------ */}
        <div
          role="region"
          aria-label="Ways of working"
          className="flex flex-col gap-8 md:grid md:grid-cols-3 md:gap-7 lg:gap-8 items-stretch pt-2"
        >
          {activePackages.map((pkg, index) => {
            const isHovered = hoveredId === pkg.id;
            const isOtherHovered = hoveredId !== null && !isHovered;

            // SD card mechanical silhouette clip path
            const sdClipPath =
              "polygon(30px 0%, 100% 0%, 100% 72px, calc(100% - 6px) 72px, calc(100% - 6px) 118px, 100% 118px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 152px, 6px 152px, 6px 132px, 0% 132px, 0% 30px)";

            return (
              <motion.article
                key={pkg.id}
                role="article"
                aria-label={pkg.name}
                className="relative group transition-all duration-300 min-h-[560px] flex flex-col"
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
                {/* Outer Card Housing (SD Card Shape with Chamfer and Side Notches) */}
                <div
                  className="p-[1px] bg-[#26262E] group-hover:bg-[#C6FF3D] transition-colors duration-300 shadow-xl w-full h-full flex flex-col"
                  style={{
                    clipPath: sdClipPath,
                  }}
                >
                  {/* Inner Card Polycarbonate Chassis */}
                  <div
                    className="bg-[#141419] overflow-hidden flex flex-col justify-between w-full h-full relative"
                    style={{
                      clipPath: sdClipPath,
                    }}
                  >
                    {/* ============================================ */}
                    {/* TOP SD CONNECTOR TERMINAL (Matching Reference Image) */}
                    {/* ============================================ */}
                    <div className="relative bg-[#0B0B0E] border-b-2 border-[#1E1E26] pt-1.5 pb-2 px-3 select-none shadow-[inset_0_-3px_6px_rgba(0,0,0,0.6)]">
                      {/* Pins Row */}
                      <div className="flex items-stretch h-11 gap-[3px] ml-4.5 mr-1">
                        {/* Chamfer PCB Corner Contact (Pin 9) on dark green substrate */}
                        <div className="w-5 h-7 self-end bg-[#09170E] border border-[#15331F] rounded-[2px] p-[2px] flex items-center justify-center mr-1">
                          <div className="w-full h-full bg-gradient-to-b from-[#F3D27E] via-[#D8A238] to-[#7D5610] rounded-[1.5px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]" />
                        </div>

                        {/* 8 Primary Gold Pins with Black Raised Divider Ribs */}
                        <div className="flex-1 flex items-stretch gap-[2.5px] bg-[#08080B] p-[2px] rounded-[2px] border border-[#1A1A22] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                          {Array.from({ length: 8 }).map((_, pIdx) => (
                            <React.Fragment key={pIdx}>
                              <div className="flex-1 bg-gradient-to-b from-[#F3D27E] via-[#D8A238] to-[#7D5610] rounded-[1.5px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] relative overflow-hidden group-hover:brightness-105 transition-all">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                              </div>
                              {pIdx < 7 && (
                                <div className="w-[3px] bg-[#0B0B0E] border-x border-[#15151A] rounded-[1px] self-stretch" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Stepped Molded Shelf Ridge Line */}
                      <div className="h-[3px] bg-gradient-to-b from-[#2A2A36] to-[#101016] w-full mt-1.5 rounded-[1px] shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
                    </div>

                    {/* ============================================ */}
                    {/* CARD BODY CONTENT                            */}
                    {/* ============================================ */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header: WAY / 01 with Status Pin Dot */}
                        <div className="flex items-center justify-between mb-3 select-none">
                          <span className="font-mono text-xs tracking-widest uppercase text-[#8E8D88] group-hover:text-[#C6FF3D] transition-colors">
                            {pkg.tierNumber}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3A3A44] group-hover:bg-[#C6FF3D] group-hover:shadow-[0_0_6px_#C6FF3D] transition-all" />
                        </div>

                        {/* Service Name */}
                        <h3 className="font-display font-black uppercase text-3xl sm:text-4xl text-[var(--paper)] m-0 leading-[1.08] tracking-tight group-hover:text-[#C6FF3D] transition-colors">
                          {pkg.name}
                        </h3>

                        {/* Positioning / Outcome Subtitle */}
                        <p className="text-sm sm:text-base text-[var(--paper)]/75 font-body mt-2.5 mb-5 leading-relaxed min-h-[2.75rem]">
                          {pkg.tagline}
                        </p>

                        {/* Hairline Divider */}
                        <div className="h-px w-full bg-[var(--line)] group-hover:bg-[#C6FF3D]/30 transition-colors my-4" />

                        {/* Deliverables Section: SCOPE */}
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#7E7D78] font-bold mb-3 select-none">
                          SCOPE
                        </div>

                        {/* Key Deliverables inline with lime separators */}
                        <div className="text-sm font-body text-[var(--paper)]/90 leading-relaxed mb-6">
                          {pkg.deliverables.map((item, dIdx) => (
                            <React.Fragment key={dIdx}>
                              <span>{item}</span>
                              {dIdx < pkg.deliverables.length - 1 && (
                                <span className="text-[#C6FF3D] mx-1.5 font-bold select-none">
                                  •
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
                          style={{ color: "#0B0B0F" }}
                          className="w-full text-center py-3.5 px-6 text-xs font-mono font-black uppercase tracking-wider rounded-md bg-[#C6FF3D] !text-[#0B0B0F] inline-flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.01] transition-all group/cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF3D]"
                        >
                          <span className="!text-[#0B0B0F]" style={{ color: "#0B0B0F" }}>
                            {pkg.cta || "TALK TO US"}
                          </span>
                          <ArrowRight
                            className="w-3.5 h-3.5 transition-transform duration-200 group-hover/cta:translate-x-1.5 !text-[#0B0B0F]"
                            style={{ color: "#0B0B0F" }}
                            aria-hidden="true"
                          />
                        </a>

                        {/* Laser-Etched Serial Stamp (Matching Reference Image) */}
                        <div
                          className="text-center font-mono text-[9px] tracking-widest uppercase text-[#4A4A58] mt-3.5 select-none"
                          aria-hidden="true"
                        >
                          {pkg.serial || `BM0${index + 1}04650090G`} • MADE IN INDIA
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
        {/* INTERACTIVE PACKAGE COMPARISON DRAWER      */}
        {/* ------------------------------------------ */}
        <div className="mt-16 sm:mt-20 text-center">
          <button
            type="button"
            onClick={() => setShowComparison((prev) => !prev)}
            aria-expanded={showComparison}
            aria-controls="packages-comparison-table"
            className="inline-flex items-center gap-2.5 py-3 px-6 rounded-full border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--industry)] hover:text-[var(--industry)] transition-all font-mono text-xs uppercase tracking-wider text-[var(--paper)] shadow-md group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)]"
          >
            <SlidersHorizontal
              className="w-4 h-4 text-[var(--industry)] transition-transform duration-300 group-hover:rotate-180"
              aria-hidden="true"
            />
            <span>
              {showComparison
                ? "Hide Package Specifications ▲"
                : "Compare All Package Deliverables ▼"}
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
                <div className="rounded-2xl border border-[var(--line)] bg-[#101015] p-5 sm:p-7 lg:p-9 shadow-2xl overflow-x-auto">
                  <div className="mb-5 pb-3 border-b border-[var(--line)] flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-black text-2xl uppercase tracking-tight text-[var(--paper)] m-0">
                        Detailed Deliverable Matrix
                      </h4>
                      <p className="font-mono text-xs text-[var(--muted)] mt-1 m-0">
                        Side-by-side comparison across all three studio engagement tiers.
                      </p>
                    </div>
                    <span className="hidden sm:inline-block font-mono text-[10px] text-[var(--industry)] uppercase tracking-wider px-2.5 py-1 rounded border border-[var(--industry)]/30 bg-[var(--industry)]/10">
                      STUDIO SPEC MATRIX
                    </span>
                  </div>

                  <table className="w-full border-collapse font-body text-xs sm:text-sm text-left">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                        <th className="py-3.5 pr-4 font-semibold">Deliverable / Capability</th>
                        <th className="py-3.5 px-3 font-semibold text-center w-1/4">
                          01 / Starter
                        </th>
                        <th className="py-3.5 px-3 font-semibold text-center w-1/4">
                          02 / Recommended
                        </th>
                        <th className="py-3.5 px-3 font-semibold text-center w-1/4">
                          03 / Full Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]/50">
                      {packageComparisonRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3.5 pr-4 text-[var(--paper)] font-medium">
                            {row.feature}
                          </td>

                          {/* Tier 1 */}
                          <td className="py-3.5 px-3 text-center">
                            {typeof row.tier1 === "boolean" ? (
                              row.tier1 ? (
                                <Check className="w-4 h-4 mx-auto text-[var(--industry)]" />
                              ) : (
                                <Minus className="w-4 h-4 mx-auto text-[var(--muted)]/50" />
                              )
                            ) : (
                              <span className="font-mono text-xs text-[var(--paper)]">
                                {row.tier1}
                              </span>
                            )}
                          </td>

                          {/* Tier 2 */}
                          <td className="py-3.5 px-3 text-center">
                            {typeof row.tier2 === "boolean" ? (
                              row.tier2 ? (
                                <Check className="w-4 h-4 mx-auto text-[var(--industry)]" />
                              ) : (
                                <Minus className="w-4 h-4 mx-auto text-[var(--muted)]/50" />
                              )
                            ) : (
                              <span className="font-mono text-xs text-[var(--paper)]">
                                {row.tier2}
                              </span>
                            )}
                          </td>

                          {/* Tier 3 */}
                          <td className="py-3.5 px-3 text-center">
                            {typeof row.tier3 === "boolean" ? (
                              row.tier3 ? (
                                <Check className="w-4 h-4 mx-auto text-[var(--industry)]" />
                              ) : (
                                <Minus className="w-4 h-4 mx-auto text-[var(--muted)]/50" />
                              )
                            ) : (
                              <span className="font-mono text-xs text-[var(--paper)]">
                                {row.tier3}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[var(--line)] pt-4">
                        <td className="py-4 pr-4 font-mono text-xs text-[var(--muted)]">
                          Ready to proceed?
                        </td>
                        <td className="py-4 px-3 text-center">
                          <a
                            href={siteConfig.contactAnchor || "#contact"}
                            className="inline-block py-2 px-3 text-[11px] font-mono font-bold uppercase tracking-wider rounded bg-[var(--panel)] border border-[var(--line)] text-[var(--paper)] hover:border-[var(--industry)] hover:text-[var(--industry)] transition-colors"
                          >
                            Select Starter
                          </a>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <a
                            href={siteConfig.contactAnchor || "#contact"}
                            className="inline-block py-2 px-3 text-[11px] font-mono font-bold uppercase tracking-wider rounded bg-[var(--panel)] border border-[var(--line)] text-[var(--paper)] hover:border-[var(--industry)] hover:text-[var(--industry)] transition-colors"
                          >
                            Select Recommended
                          </a>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <a
                            href={siteConfig.contactAnchor || "#contact"}
                            className="inline-block py-2 px-3 text-[11px] font-mono font-bold uppercase tracking-wider rounded bg-[var(--panel)] border border-[var(--line)] text-[var(--paper)] hover:border-[var(--industry)] hover:text-[var(--industry)] transition-colors"
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
