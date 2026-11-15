"use client";

import React, { useId } from "react";

interface HalftoneProps {
  color?: string;
  className?: string;
  patternSize?: number;
  dotRadius?: number;
  opacity?: number;
}

/**
 * Halftone dot pattern overlay inspired by vintage Tamil film print posters.
 * aria-hidden="true" and pointer-events-none.
 */
export function Halftone({
  color = "#B9B2A5",
  className = "",
  patternSize = 16,
  dotRadius = 2,
  opacity = 0.12,
}: HalftoneProps) {
  const patternId = useId();

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-0 w-full h-full ${className}`}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={patternSize}
          height={patternSize}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={patternSize / 2} cy={patternSize / 2} r={dotRadius} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
