"use client";

import React from "react";

interface BigOutline27Props {
  className?: string;
  opacity?: number;
  strokeColor?: string;
}

/**
 * Giant atmospheric outline of the numeral "27" (6-8% opacity).
 * aria-hidden="true" and pointer-events-none.
 */
export function BigOutline27({
  className = "",
  opacity = 0.07,
  strokeColor = "#D4FF3F",
}: BigOutline27Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none absolute ${className}`}
      style={{ opacity }}
    >
      {/* Giant 2 */}
      <path
        d="M30 60C30 25 65 10 110 10C160 10 190 35 190 75C190 120 130 160 60 210H195V260H25V215C95 160 145 125 145 80C145 55 125 45 105 45C75 45 65 65 65 85H30V60Z"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Giant 7 with dynamic slash */}
      <path
        d="M215 10H380V55L290 260H240L325 60H215V10Z"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cinematographer Slash Accent */}
      <line
        x1="225"
        y1="140"
        x2="335"
        y2="140"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
