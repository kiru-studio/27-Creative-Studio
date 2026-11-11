"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface PrimaryButtonProps {
  text: string;
  href: string;
  shouldReduceMotion?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MagneticPrimaryButton({
  text,
  href,
  shouldReduceMotion = false,
  className = "",
  onMouseEnter,
  onMouseLeave,
}: PrimaryButtonProps) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [canHover, setCanHover] = useState(false);

  // Magnetic motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 250, damping: 20 });
  const springY = useSpring(y, { stiffness: 250, damping: 20 });

  useEffect(() => {
    try {
      const match = window.matchMedia("(hover: hover) and (pointer: fine)");
      setCanHover(match.matches);
    } catch {
      setCanHover(false);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!canHover || shouldReduceMotion || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Up to 8px toward cursor
    const distanceX = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    const distanceY = ((e.clientY - centerY) / (rect.height / 2)) * 8;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    onMouseLeave?.();
  };

  return (
    <motion.a
      ref={btnRef}
      href={href}
      style={{
        x: canHover && !shouldReduceMotion ? springX : 0,
        y: canHover && !shouldReduceMotion ? springY : 0,
        color: "#0B0B0F",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        onMouseEnter?.();
      }}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[var(--radius-control,4px)] bg-[var(--industry)] !text-[#0B0B0F] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-[0_0_24px_rgba(198,255,61,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] ${className}`}
    >
      <span className="!text-[#0B0B0F]" style={{ color: "#0B0B0F" }}>{text}</span>
      <ArrowUpRight
        size={16}
        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 !text-[#0B0B0F]"
        style={{ color: "#0B0B0F", stroke: "#0B0B0F" }}
        aria-hidden="true"
      />
    </motion.a>
  );
}

interface SecondaryButtonProps {
  text: string;
  onClick: () => void;
  shouldReduceMotion?: boolean;
  className?: string;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function OutlinedWatchButton({
  text,
  onClick,
  className = "",
  buttonRef,
  onMouseEnter,
  onMouseLeave,
}: SecondaryButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[var(--radius-control,4px)] border border-[var(--line,#333)] text-[var(--paper)] hover:border-[var(--industry)] hover:text-[var(--paper)] font-mono text-xs uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] ${className}`}
    >
      {/* Play Triangle: outlines by default, fills lime on hover */}
      <span
        className="inline-block text-[10px] text-[var(--muted)] group-hover:text-[var(--industry)] transition-colors duration-150"
        aria-hidden="true"
      >
        ▶
      </span>
      <span>{text}</span>
    </button>
  );
}
