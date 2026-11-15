"use client";

import React from "react";

interface BlobProps {
  color?: "lime" | "pink";
  className?: string;
  opacity?: number;
}

/**
 * Organic color blob graphic for bold Tamil cinema poster energy.
 * Strictly aria-hidden and pointer-events-none.
 */
export function Blob({
  color = "lime",
  className = "",
  opacity = 0.18,
}: BlobProps) {
  const fillColor = color === "pink" ? "#FF2DA8" : "#D4FF3F";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute blur-3xl rounded-full transition-opacity ${className}`}
      style={{
        backgroundColor: fillColor,
        opacity,
      }}
    />
  );
}
