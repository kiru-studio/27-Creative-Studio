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
  items = siteContent.reels.slice(0, 6),
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
        className="work-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <p className="kicker">{kicker}</p>
          <h2 id="reels-heading">{heading}</h2>
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
                    className="reel-card-image"
                    src={item.posterSrc}
                    alt=""
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

                {/* 3. L-shaped Lime Viewfinder Brackets (Active card) */}
                <span
                  className={`pointer-events-none absolute inset-0 z-10 p-2 transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                >
                  <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--industry,#C6FF3D)]" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--industry,#C6FF3D)]" />
                  <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--industry,#C6FF3D)]" />
                  <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--industry,#C6FF3D)]" />
                </span>

                {/* 4. Duration Pill */}
                <span className="reel-card-duration">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 font-mono text-[11px] text-[var(--paper,#F4F1EA)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
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
