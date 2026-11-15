"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

interface TickerProps {
  className?: string;
  speedSeconds?: number;
}

const RESULTS_ITEMS = [
  "THAMIRA RESTAURANT 399 → 2,300 (+1,901) · 5.8x",
  "MM CARS 299 → 1,835 (+1,536) · 6.1x",
  "SURYA MOBILES AUTHOOR 0 → 1,059 IN 1 MONTH",
  "THOORIGAI 800 → 1,269 (+58%)",
  "TOTALS: 4 CLIENTS · 5 ACCOUNTS · 6,300+ FOLLOWERS",
  "100% ORGANIC REACH · ZERO SPENT ON ADS",
];

/**
 * Animated results ticker marquee showcasing real Thoothukudi growth metrics.
 * Respects prefers-reduced-motion: pauses or scrolls calmly.
 */
export function Ticker({ className = "", speedSeconds = 24 }: TickerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-label="Client results marquee"
      className={`w-full overflow-hidden border-y border-[#FF2DA8]/30 bg-[#0B0B0B] py-3 text-xs sm:text-sm font-mono uppercase tracking-widest text-[#EFE6D8] select-none ${className}`}
    >
      <div
        className="flex whitespace-nowrap gap-8 items-center"
        style={{
          animation: shouldReduceMotion
            ? "none"
            : `tickerSlide ${speedSeconds}s linear infinite`,
        }}
      >
        {/* Sequence 1 */}
        {RESULTS_ITEMS.map((item, idx) => (
          <span key={`t1-${idx}`} className="flex items-center gap-3 shrink-0">
            <span className="text-[#FF2DA8] font-bold">★</span>
            <span className="font-bold">{item}</span>
          </span>
        ))}
        {/* Sequence 2 for continuous seamless loop */}
        {!shouldReduceMotion &&
          RESULTS_ITEMS.map((item, idx) => (
            <span
              key={`t2-${idx}`}
              aria-hidden="true"
              className="flex items-center gap-3 shrink-0"
            >
              <span className="text-[#D4FF3F] font-bold">★</span>
              <span className="font-bold">{item}</span>
            </span>
          ))}
      </div>
    </div>
  );
}
