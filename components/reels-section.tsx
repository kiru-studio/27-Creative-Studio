"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { siteContent, type WorkItem } from "@/lib/site-content";

interface ReelsSectionProps {
  kicker?: string;
  heading?: string;
  items?: WorkItem[];
  onOpenViewer: (index: number, opener: HTMLElement) => void;
}

export function ReelsSection({
  kicker = siteContent.ui.reelsKicker,
  heading = siteContent.ui.reelsHeading,
  items = siteContent.reels,
  onOpenViewer,
}: ReelsSectionProps) {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.15 });
  const shouldReduceMotion = useHydratedReducedMotion();

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActiveReelIndex((index + 1) % items.length);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActiveReelIndex((index - 1 + items.length) % items.length);
    }
  };

  return (
    <section
      ref={containerRef}
      className="reels-section"
      id="work"
      aria-labelledby="reels-heading"
    >
      {/* Section Header */}
      <motion.div
        className="work-heading flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3 select-none">
            <span className="brutal-sticker-lime">9:16 VERTICAL SPRINT</span>
            <span className="brutal-sticker-pink">INSTAGRAM ALGORITHM</span>
          </div>
          <h2 id="reels-heading" className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter text-[#FF2DA8] m-0">
            {heading}
          </h2>
        </div>
        <div className="font-mono text-xs text-[#D4FF3F] font-black border-2 border-[#D4FF3F] bg-[#0B0B0B] px-3.5 py-2 shadow-[4px_4px_0px_#FF2DA8] self-start md:self-auto select-none">
          INDEX: 01 // 08 SONY FX3 REELS
        </div>
      </motion.div>

      {/* Reels Accordion Grid preserving original dimensions */}
      <ul className="reels-grid">
        {items.map((item, index) => {
          const isActive = activeReelIndex === index;
          return (
            <li
              key={item.title}
              data-active={isActive}
            >
              <button
                className="reel-card"
                type="button"
                onMouseEnter={() => setActiveReelIndex(index)}
                onFocus={() => setActiveReelIndex(index)}
                onClick={(event) => {
                  onOpenViewer(index, event.currentTarget);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`${siteContent.ui.openReelLabel} ${item.title}`}
                aria-haspopup="dialog"
              >
                {/* 1. Poster Image / Art */}
                {item.posterSrc ? (
                  <img
                    className={`reel-card-image ${
                      isActive ? "duotone-chartreuse" : "duotone-pink"
                    } transition-all duration-500`}
                    src={item.posterSrc}
                    alt={`${item.client || "Client"} — ${item.title}`}
                    loading="lazy"
                  />
                ) : (
                  <span
                    className={`reel-card-art reel-card-art-${index % 4}`}
                    aria-hidden="true"
                  />
                )}

                {/* 2. Darkness Shade Overlay */}
                <span className="reel-card-shade" aria-hidden="true" />

                {/* 3. L-shaped Chartreuse Viewfinder Brackets (Active card) */}
                <span
                  className={`pointer-events-none absolute inset-0 z-10 p-2 transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                >
                  <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4FF3F]" />
                  <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4FF3F]" />
                  <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4FF3F]" />
                  <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4FF3F]" />
                </span>

                {/* 4. Duration Pill (Strict 3-Colour) */}
                <span className="reel-card-duration">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0B0B] border-2 border-[#D4FF3F] font-mono text-[11px] text-[#D4FF3F] font-black shadow-[3px_3px_0px_#FF2DA8]">
                    <span className="w-2 h-2 bg-[#FF2DA8] animate-pulse" />
                    <span>{item.meta}</span>
                  </span>
                </span>

                {/* 5. Collapsed Vertical / Mobile Horizontal Title */}
                <span className="reel-card-vertical-title" aria-hidden="true">
                  {item.title}
                </span>

                {/* 6. Expanded Details Copy */}
                <span className="reel-card-copy">
                  <small>{item.client ?? siteContent.ui.clientPlaceholder}</small>
                  <strong>{item.title}</strong>
                  <span>{item.delivered ?? item.type}</span>
                  <span className="reel-card-label">{item.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
export default ReelsSection;
