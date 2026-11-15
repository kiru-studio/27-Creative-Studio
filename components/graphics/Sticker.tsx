"use client";

import React from "react";

interface StickerProps {
  children: React.ReactNode;
  color?: "lime" | "pink" | "ink" | "ivory";
  rotate?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Bold angled sticker tag (-4deg by default) for high-impact proof metrics and tags.
 */
export function Sticker({
  children,
  color = "lime",
  rotate = -4,
  className = "",
  size = "md",
}: StickerProps) {
  const colorStyles = {
    lime: "bg-[#D4FF3F] text-[#0B0B0B] border border-[#0B0B0B]/20 shadow-[2px_3px_0px_#0B0B0B]",
    pink: "bg-[#FF2DA8] text-[#0B0B0B] border border-[#0B0B0B]/20 shadow-[2px_3px_0px_#0B0B0B]",
    ink: "bg-[#0B0B0B] text-[#D4FF3F] border border-[#D4FF3F]/30 shadow-[2px_3px_0px_rgba(212,255,63,0.3)]",
    ivory: "bg-[#FAF8F3] text-[#0B0B0B] border border-[#0B0B0B]/15 shadow-[2px_3px_0px_rgba(0,0,0,0.15)]",
  }[color];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-bold",
    md: "px-3 py-1 text-xs sm:text-sm font-black",
    lg: "px-4 py-1.5 text-sm sm:text-base font-black",
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center uppercase font-mono tracking-wider select-none transform transition-transform hover:scale-105 duration-150 ${colorStyles} ${sizeStyles} ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </span>
  );
}
