"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Package, packages as defaultPackages } from "@/data/packages";
import { siteConfig } from "@/data/siteConfig";

import { siteContent } from "@/lib/site-content";

// ==========================================
// PACKAGES / WAYS OF WORKING FULL SCREEN SECTION
// ==========================================

export interface PackagesSectionProps {
  packageList?: Package[];
  className?: string;
}

export function PackagesSection({
  packageList = defaultPackages,
  className = "",
}: PackagesSectionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = Boolean(useReducedMotion());

  const headingLines = ["Pick the shape", "of the work."];

  return (
    <section
      ref={sectionRef}
      id="packages"
      aria-labelledby="packages-heading"
      className={`packages-section relative min-h-screen w-full flex flex-col justify-center py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-[var(--line)] bg-[var(--ink)] overflow-hidden ${className}`}
    >
      {/* Atmosphere: 4% subtle film-grain overlay */}
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[var(--container-max)] w-full">
        {/* ------------------------------------------ */}
        {/* SECTION HEADER (Scroll Reveal)             */}
        {/* ------------------------------------------ */}
        <div className="section-intro mb-12 sm:mb-16">
          {/* Tag / Kicker: "ways to work together" */}
          <motion.p
            className="kicker"
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
            {siteContent.ui.packagesKicker}
          </motion.p>

          {/* Masked Heading Lines: "Pick the shape of the work." */}
          <h2 id="packages-heading" className="flex flex-col items-start m-0">
            {headingLines.map((line, idx) => (
              <span key={idx} className="overflow-hidden block leading-none">
                <motion.span
                  className="block"
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
        </div>

        {/* Mobile Segmented Package Switcher (Visible only on mobile) */}
        <div className="md:hidden flex items-center justify-between gap-1.5 p-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] mb-6 select-none font-mono">
          {packageList.map((pkg, idx) => {
            const isSelected = activeMobileIndex === idx;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setActiveMobileIndex(idx)}
                className={`flex-1 py-2 px-1 text-center rounded text-[11px] tracking-wider uppercase transition-all ${
                  isSelected
                    ? "bg-[var(--industry)] !text-[var(--industry-ink)] font-black shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--paper)]"
                }`}
              >
                0{idx + 1} // {pkg.name.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------ */}
        {/* 3-CARD CINEMATIC ENGAGEMENT GRID (Full screen) */}
        {/* ------------------------------------------ */}
        <div
          role="region"
          aria-label="Ways of working"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {packageList.map((pkg, index) => {
            const isHovered = hoveredId === pkg.id;
            const isOtherHovered = hoveredId !== null && !isHovered;

            return (
              <motion.article
                key={pkg.id}
                role="article"
                aria-label={pkg.name}
                className={`relative flex-col justify-between p-7 sm:p-8 lg:p-9 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--panel)]/50 backdrop-blur-xs transition-colors duration-300 hover:border-[var(--industry)] group min-h-[360px] ${
                  activeMobileIndex === index ? "flex" : "hidden md:flex"
                }`}
                style={{
                  opacity: isOtherHovered && !shouldReduceMotion ? 0.6 : 1,
                }}
                onMouseEnter={() => setHoveredId(pkg.id)}
                onMouseLeave={() => setHoveredId((curr) => (curr === pkg.id ? null : curr))}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{
                  opacity: isOtherHovered && !shouldReduceMotion ? 0.6 : 1,
                  y: isHovered && !shouldReduceMotion ? -6 : 0,
                }}
                transition={{
                  duration: 0.35,
                  delay: shouldReduceMotion ? 0 : 0.15 + index * 0.08,
                  ease: "easeOut",
                }}
              >
                {/* Card Top & Body */}
                <div>
                  {/* Micro Header / Timecode marker */}
                  <div className="flex items-center justify-between gap-2 mb-4 select-none">
                    <span className="font-mono text-xs tracking-widest uppercase text-[var(--muted)] group-hover:text-[var(--industry)] transition-colors">
                      WAY / 0{index + 1}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--line)] group-hover:bg-[var(--industry)] transition-colors"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tight text-[var(--paper)] m-0 leading-tight">
                    {pkg.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-sm sm:text-base text-[var(--muted)] mt-2.5 mb-6 m-0 leading-relaxed min-h-[3rem]">
                    {pkg.tagline}
                  </p>

                  {/* Hairline Divider */}
                  <div
                    className="h-px w-full bg-[var(--line)] group-hover:bg-[var(--industry)]/40 transition-colors my-5"
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
                    className="w-full text-center py-3 px-5 text-xs font-mono font-bold uppercase tracking-wider rounded-[var(--radius-control)] bg-[var(--industry)] !text-[var(--industry-ink)] inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all group/cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)]"
                  >
                    <span className="!text-[var(--industry-ink)]" style={{ color: "var(--industry-ink)" }}>{pkg.cta || "Talk to us"}</span>
                    <span
                      className="inline-block transition-transform duration-250 group-hover/cta:translate-x-1.5 !text-[var(--industry-ink)]"
                      style={{ color: "#0B0B0F" }}
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </a>
                </div>

                {/* Viewfinder L-bracket Corner Accents on Hover */}
                <div
                  className="absolute top-0 right-0 w-6 h-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                >
                  <div className="absolute top-2 right-2 w-2 h-[2px] bg-[var(--industry)]" />
                  <div className="absolute top-2 right-2 h-2 w-[2px] bg-[var(--industry)]" />
                </div>
                <div
                  className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                >
                  <div className="absolute bottom-2 left-2 w-2 h-[2px] bg-[var(--industry)]" />
                  <div className="absolute bottom-2 left-2 h-2 w-[2px] bg-[var(--industry)]" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PackagesSection;
