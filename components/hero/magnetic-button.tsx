"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NeonPlay } from "@/components/ui/neon-icons";

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
        color: "#0B0B0B",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        onMouseEnter?.();
      }}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3 bg-[#FF2DA8] !text-[#0B0B0B] font-mono text-xs font-extrabold uppercase tracking-widest transition-all duration-200 hover:shadow-[0_0_24px_#FF2DA8] hover:border-[#D4FF3F] border border-[#FF2DA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F] ${className}`}
    >
      <span className="!text-[#0B0B0B] font-extrabold tracking-widest">{text}</span>
      <ArrowUpRight
        size={16}
        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 !text-[#0B0B0B]"
        style={{ color: "#0B0B0B", stroke: "#0B0B0B" }}
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
      className={`group inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3 border-2 border-[#D4FF3F] bg-[#0B0B0B] text-[#D4FF3F] hover:bg-[#D4FF3F] hover:text-[#0B0B0B] font-mono text-xs font-bold uppercase tracking-widest transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2DA8] ${className}`}
    >
      <NeonPlay
        className="size-2.5 inline-block text-[#D4FF3F] group-hover:text-[#0B0B0B] transition-colors duration-150"
      />
      <span className="group-hover:text-[#0B0B0B]">{text}</span>
    </button>
  );
}
