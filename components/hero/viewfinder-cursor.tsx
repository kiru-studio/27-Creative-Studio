"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface ViewfinderCursorProps {
  heroRef?: React.RefObject<HTMLElement | null>;
  isOverCta?: boolean;
  shouldReduceMotion?: boolean;
  enabled?: boolean;
}

export function ViewfinderCursor({
  heroRef,
  isOverCta = false,
  shouldReduceMotion = false,
  enabled = true,
}: ViewfinderCursorProps) {
  const [isInside, setIsInside] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 350 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    try {
      const match = window.matchMedia("(hover: hover) and (pointer: fine)");
      setCanHover(match.matches);
      const listener = (e: MediaQueryListEvent) => setCanHover(e.matches);
      match.addEventListener("change", listener);
      return () => match.removeEventListener("change", listener);
    } catch {
      setCanHover(false);
    }
  }, []);

  useEffect(() => {
    if (!canHover || shouldReduceMotion || !enabled) return;

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isInside) setIsInside(true);

      const target = e.target as Element | null;
      if (!target) {
        setIsHoveringInteractive(false);
        return;
      }

      // Automatically detect interactive elements across the entire page
      const interactive = Boolean(
        target.closest(
          'a, button, input, textarea, select, [role="button"], [role="tab"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], summary, .reel-card, .case-card, .film-small, .header-cta, .whatsapp-fab, .nav-stagger-line, [data-cursor-cta], [data-cursor="pointer"]'
        )
      );
      setIsHoveringInteractive(interactive);
    };

    const handlePointerDown = () => setIsMouseDown(true);
    const handlePointerUp = () => setIsMouseDown(false);

    const handleDocumentLeave = (e: MouseEvent) => {
      if (!e.relatedTarget && !(e as any).toElement) {
        setIsInside(false);
      }
    };

    const handleDocumentEnter = () => {
      setIsInside(true);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleDocumentLeave);
    document.documentElement.addEventListener("mouseenter", handleDocumentEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.removeEventListener("mouseleave", handleDocumentLeave);
      document.documentElement.removeEventListener("mouseenter", handleDocumentEnter);
    };
  }, [canHover, shouldReduceMotion, enabled, isInside, cursorX, cursorY]);

  if (!canHover || shouldReduceMotion || !enabled || !isInside) {
    return null;
  }

  const activeCta = isOverCta || isHoveringInteractive;
  const size = activeCta ? 48 : 24;

  return (
    <motion.div
      style={{
        x: smoothX,
        y: smoothY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className="pointer-events-none fixed top-0 left-0 z-[9999]"
      aria-hidden="true"
    >
      <motion.div
        animate={{
          width: size,
          height: size,
          scale: isMouseDown ? 0.84 : 1,
          borderColor: activeCta ? "var(--industry)" : "rgba(198, 255, 61, 0.65)",
          boxShadow: activeCta
            ? "0 0 16px rgba(198, 255, 61, 0.35), inset 0 0 8px rgba(198, 255, 61, 0.15)"
            : "0 0 0px transparent",
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="relative border border-[var(--industry)] rounded-[2px]"
      >
        {/* Center Crosshair Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[var(--industry)]" />

        {/* Viewfinder Tick Marks */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-[var(--industry)]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-[var(--industry)]" />
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1 h-0.5 bg-[var(--industry)]" />
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1 h-0.5 bg-[var(--industry)]" />
      </motion.div>
    </motion.div>
  );
}
export default ViewfinderCursor;
