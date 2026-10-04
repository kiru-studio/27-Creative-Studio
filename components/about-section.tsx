"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { siteContent } from "@/lib/site-content";

// ==========================================
// 0. TYPES & DATA ARRAYS (Duo & BTS)
// ==========================================

export type PersonItem = {
  id: string;
  name: string;
  role: string;
  bio: string;
  workLabel: string;
  photoSrc?: string;
  badgeLabel: string; // "● REC" or "✂ CUT"
};

export type BtsItem = {
  id: string;
  label: string; // "BTS / 01"
  frameMarker: string; // "▸ 01A"
  title: string;
  posterSrc?: string;
};

export const duoPeople: PersonItem[] = siteContent.people.map(
  (person, index) => ({
    id: `person-${index}`,
    name: person.name,
    role: person.role,
    bio: person.bio,
    workLabel: person.workLabel,
    photoSrc: person.photoSrc,
    badgeLabel: index === 0 ? "● REC" : "✂ CUT",
  }),
);

export const btsItems: BtsItem[] = siteContent.reels
  .slice(0, 4)
  .map((reel, index) => ({
    id: `bts-item-${index}`,
    label: `${siteContent.ui.btsPrefix} / ${String(index + 1).padStart(2, "0")}`,
    frameMarker: `▸ ${String(index + 1).padStart(2, "0")}A`,
    title: reel.title,
    posterSrc: reel.posterSrc,
  }));

// ==========================================
// HELPER HOOKS
// ==========================================

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
}

// ==========================================
// 1. VIEWFINDER CORNER BRACKETS
// ==========================================

export function PhotoCornerBrackets({
  isHovered,
  size = 24,
  borderWidth = 2,
  inset = 8,
}: {
  isHovered: boolean;
  size?: number;
  borderWidth?: number;
  inset?: number;
}) {
  const springConfig = { type: "spring", stiffness: 260, damping: 24 } as const;

  return (
    <div
      className="corner-brackets pointer-events-none absolute inset-0 z-20"
      aria-hidden="true"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Top-Left */}
      <motion.i
        initial={{ x: -14, y: -14, opacity: 0 }}
        animate={
          isHovered
            ? { x: 0, y: 0, opacity: 1 }
            : { x: -14, y: -14, opacity: 0 }
        }
        transition={springConfig}
        style={{
          position: "absolute",
          top: `${inset}px`,
          left: `${inset}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderColor: "var(--industry)",
          borderStyle: "solid",
          borderWidth: `${borderWidth}px 0 0 ${borderWidth}px`,
          willChange: "transform, opacity",
        }}
      />
      {/* Top-Right */}
      <motion.i
        initial={{ x: 14, y: -14, opacity: 0 }}
        animate={
          isHovered
            ? { x: 0, y: 0, opacity: 1 }
            : { x: 14, y: -14, opacity: 0 }
        }
        transition={springConfig}
        style={{
          position: "absolute",
          top: `${inset}px`,
          right: `${inset}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderColor: "var(--industry)",
          borderStyle: "solid",
          borderWidth: `${borderWidth}px ${borderWidth}px 0 0`,
          willChange: "transform, opacity",
        }}
      />
      {/* Bottom-Left */}
      <motion.i
        initial={{ x: -14, y: 14, opacity: 0 }}
        animate={
          isHovered
            ? { x: 0, y: 0, opacity: 1 }
            : { x: -14, y: 14, opacity: 0 }
        }
        transition={springConfig}
        style={{
          position: "absolute",
          bottom: `${inset}px`,
          left: `${inset}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderColor: "var(--industry)",
          borderStyle: "solid",
          borderWidth: `0 0 ${borderWidth}px ${borderWidth}px`,
          willChange: "transform, opacity",
        }}
      />
      {/* Bottom-Right */}
      <motion.i
        initial={{ x: 14, y: 14, opacity: 0 }}
        animate={
          isHovered
            ? { x: 0, y: 0, opacity: 1 }
            : { x: 14, y: 14, opacity: 0 }
        }
        transition={springConfig}
        style={{
          position: "absolute",
          bottom: `${inset}px`,
          right: `${inset}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderColor: "var(--industry)",
          borderStyle: "solid",
          borderWidth: `0 ${borderWidth}px ${borderWidth}px 0`,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}

// ==========================================
// 2. PERSON CARD (Duo Interplay)
// ==========================================

export interface PersonCardProps {
  person: PersonItem;
  index: number;
  isHovered: boolean;
  isOtherHovered: boolean;
  isInView: boolean;
  isDesktop: boolean;
  shouldReduceMotion: boolean;
  isTouch: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export function PersonCard({
  person,
  index,
  isHovered,
  isOtherHovered,
  isInView,
  isDesktop,
  shouldReduceMotion,
  isTouch,
  onHoverStart,
  onHoverEnd,
}: PersonCardProps) {
  // Cached rect ref to avoid synchronous layout reflow on mousemove
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  // Subtle mouse-follow tilt on the photo only (max 3 degrees)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 240, damping: 25 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 240, damping: 25 });
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-3, 3]);

  const updateRect = (element: HTMLElement) => {
    const b = element.getBoundingClientRect();
    rectRef.current = { left: b.left, top: b.top, width: b.width, height: b.height };
  };

  const handlePhotoMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    updateRect(e.currentTarget);
  };

  const handlePhotoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || isTouch) return;
    if (!rectRef.current) {
      updateRect(e.currentTarget);
    }
    const rect = rectRef.current;
    if (!rect || !rect.width || !rect.height) return;
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handlePhotoMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    rectRef.current = null;
  };

  // Duo resize spring: hovered card grows (flex 1 -> 1.15), other shrinks (1 -> 0.85) and dims
  const cardFlexGrow = isDesktop
    ? isHovered
      ? 1.15
      : isOtherHovered
        ? 0.85
        : 1
    : 1;

  const cardOpacity = isOtherHovered ? 0.55 : 1;
  const cardFilter = isOtherHovered ? "grayscale(60%)" : "grayscale(0%)";

  return (
    <motion.article
      className="person-card relative flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] rounded-[var(--radius-panel)] transition-shadow min-w-0"
      tabIndex={0}
      onMouseEnter={onHoverStart}
      onMouseLeave={() => {
        onHoverEnd();
        handlePhotoMouseLeave();
      }}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      // Scroll-in entrance: rises 24px and fades in, 120ms apart
      initial={
        shouldReduceMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 24 }
      }
      animate={
        isInView
          ? {
              opacity: cardOpacity,
              y: 0,
              filter: shouldReduceMotion ? "none" : cardFilter,
              flexGrow: shouldReduceMotion ? 1 : cardFlexGrow,
            }
          : { opacity: 0, y: 24 }
      }
      transition={{
        y: {
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
          delay: shouldReduceMotion ? 0 : 0.38 + index * 0.12,
        },
        opacity: {
          duration: isOtherHovered || isHovered ? 0.35 : 0.6,
          ease: "easeOut",
          delay: isOtherHovered || isHovered ? 0 : 0.38 + index * 0.12,
        },
        flexGrow: {
          type: "spring",
          stiffness: 220,
          damping: 26,
        },
        filter: {
          duration: 0.35,
          ease: "easeOut",
        },
      }}
      style={{
        flexBasis: isDesktop ? "0%" : "auto",
        flexShrink: 1,
        willChange: "flex-grow, opacity, filter",
      }}
    >
      {/* 3D Tilt Wrapper for the Photo Container */}
      <motion.div
        style={{
          rotateX: shouldReduceMotion || isTouch ? 0 : rotateX,
          rotateY: shouldReduceMotion || isTouch ? 0 : rotateY,
          transformPerspective: 800,
          transform: "translateZ(0)",
          willChange: "transform",
        }}
        className="w-full"
      >
        {/* Stable height on desktop prevents any vertical layout reflow on flex-grow */}
        <div
          className="person-photo relative aspect-[4/3] md:aspect-auto md:h-[22rem] w-full overflow-hidden border border-[var(--line)] bg-[var(--panel-raised)]"
          style={{ borderBottom: 0 }}
          onMouseEnter={handlePhotoMouseEnter}
          onMouseMove={handlePhotoMouseMove}
        >
          {/* Viewfinder Corner Brackets that spring inward on hover */}
          {!shouldReduceMotion && (
            <PhotoCornerBrackets isHovered={isHovered} size={24} borderWidth={2} inset={8} />
          )}

          {/* Tiny Mono Label on top-left of photo ("● REC" or "✂ CUT") */}
          <motion.div
            className="absolute top-4 left-4 z-20 flex items-center gap-1.5 font-mono text-[var(--text-xs)] tracking-widest text-[var(--paper)] pointer-events-none uppercase select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            aria-hidden="true"
          >
            {index === 0 ? (
              <>
                <motion.span
                  className="inline-block w-2 h-2 rounded-full bg-[var(--industry)]"
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: [1, 0.2, 1] }
                  }
                  transition={{
                    duration: 1.0,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span className="font-semibold text-[var(--industry)]">REC</span>
              </>
            ) : (
              <>
                <span className="text-[var(--industry)] font-bold text-sm">✂</span>
                <span className="font-semibold text-[var(--industry)]">CUT</span>
              </>
            )}
          </motion.div>

          {/* Photo element with grayscale/brightness/scale transition */}
          <motion.div
            className="w-full h-full relative overflow-hidden"
            animate={{
              scale: isHovered && !shouldReduceMotion ? 1.02 : 1,
              filter: isHovered
                ? "grayscale(0%) brightness(100%)"
                : "grayscale(100%) brightness(80%)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ willChange: "transform, filter" }}
          >
            {person.photoSrc ? (
              <img
                className="person-photo-image w-full h-full object-cover"
                src={person.photoSrc}
                alt={person.name}
              />
            ) : (
              <div className="w-full h-full flex items-end justify-start p-4 text-[var(--paper)] font-mono text-[var(--text-xs)] select-none">
                <span className="relative z-10 text-[var(--muted)]">
                  {siteContent.ui.photoPlaceholder}
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Lime bar under the photo with quick retract-and-refill sweep */}
        <div className="relative w-full h-[var(--space-1)] bg-[var(--line)] overflow-hidden">
          <motion.div
            className="h-full bg-[var(--industry)]"
            animate={
              isHovered && !shouldReduceMotion
                ? { scaleX: [1, 0, 1] }
                : { scaleX: 1 }
            }
            transition={
              isHovered
                ? {
                    duration: 0.5,
                    times: [0, 0.45, 1],
                    ease: ["easeInOut", "easeOut"],
                  }
                : { duration: 0.25 }
            }
            style={{ originX: 0, transformOrigin: "left", willChange: "transform" }}
          />
        </div>
      </motion.div>

      {/* Role tag kicker with blinking "_" cursor on hover */}
      <p className="kicker mt-4 mb-1 flex items-center">
        <span>{person.workLabel}</span>
        {isHovered && (
          <motion.span
            className="text-[var(--industry)] ml-0.5 inline-block font-mono"
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: [1, 0, 1] }
            }
            transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            _
          </motion.span>
        )}
      </p>

      {/* Name */}
      <h3 className="m-0 text-3xl font-bold">{person.name}</h3>

      {/* Role */}
      <strong className="text-[var(--muted)] block text-sm mt-1">{person.role}</strong>

      {/* Bio */}
      <p className="text-[var(--muted)] text-sm mt-2 max-w-[36ch] leading-relaxed">
        {person.bio}
      </p>
    </motion.article>
  );
}

// ==========================================
// 3. BTS TILE (Contact-Sheet Strip)
// ==========================================

export interface BtsTileProps {
  item: BtsItem;
  index: number;
  isHovered: boolean;
  isOtherHovered: boolean;
  isInView: boolean;
  shouldReduceMotion: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

export function BtsTile({
  item,
  index,
  isHovered,
  isOtherHovered,
  isInView,
  shouldReduceMotion,
  onHoverStart,
  onHoverEnd,
  onClick,
}: BtsTileProps) {
  return (
    <motion.button
      type="button"
      className="bts-tile-btn text-left block w-full border-0 p-0 bg-transparent cursor-pointer rounded-[var(--radius-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)]"
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      // Tiles stagger in on scroll: fade + y: 16, 80ms apart
      initial={
        shouldReduceMotion
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 16 }
      }
      animate={
        isInView
          ? {
              opacity: isOtherHovered ? 0.4 : 1,
              y: isHovered && !shouldReduceMotion ? -4 : 0,
              scale: isHovered && !shouldReduceMotion ? 1.03 : 1,
            }
          : { opacity: 0, y: 16 }
      }
      transition={{
        opacity: {
          duration: isOtherHovered || isHovered ? 0.25 : 0.5,
          ease: "easeOut",
          delay:
            isOtherHovered || isHovered
              ? 0
              : shouldReduceMotion
                ? 0
                : 0.62 + index * 0.08,
        },
        y: {
          duration: 0.25,
          ease: "easeOut",
          delay:
            isHovered
              ? 0
              : shouldReduceMotion
                ? 0
                : 0.62 + index * 0.08,
        },
        scale: {
          duration: 0.25,
          ease: "easeOut",
        },
      }}
      style={{ willChange: "transform, opacity" }}
      aria-label={`Open BTS photo ${item.label}`}
    >
      <div
        className="bts-clip relative aspect-[16/9] overflow-hidden flex items-end justify-between p-[var(--space-3)] bg-[var(--ink)] text-[var(--paper)] font-mono text-[var(--text-xs)] border border-[var(--line)]"
        style={{ borderBottom: 0, transform: "translateZ(0)" }}
      >
        {/* LayoutId for image/slate to expand into fullscreen lightbox */}
        <motion.div
          layoutId={`bts-media-${item.id}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {item.posterSrc ? (
            <img
              src={item.posterSrc}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[var(--panel)] flex flex-col items-center justify-center p-3 select-none">
              <span
                className="text-[var(--line)] text-xl font-mono"
                aria-hidden="true"
              >
                ⌖
              </span>
              <span className="text-[var(--muted)] text-[10px] tracking-widest mt-1 opacity-70">
                FRAME {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          )}
        </motion.div>

        {/* Frame Marker ("▸ 01A") fades in at top-left on hover */}
        <motion.div
          className="font-mono text-[var(--text-xs)] text-[var(--industry)] tracking-wider pointer-events-none"
          style={{ position: "absolute", top: "10px", left: "10px", zIndex: 15 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          aria-hidden="true"
        >
          {item.frameMarker}
        </motion.div>

        {/* Label BTS / 01 */}
        <span className="relative z-10">{item.label}</span>

        {/* Bottom lime bar: GPU transform scaleY 1 -> 1.5 (4px -> 6px) without layout reflow */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-[var(--industry)] z-10 h-[4px]"
          animate={{ scaleY: isHovered ? 1.5 : 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ transformOrigin: "bottom", willChange: "transform" }}
        />
      </div>
    </motion.button>
  );
}

// ==========================================
// 4. FULLSCREEN LIGHTBOX
// ==========================================

export interface LightboxProps {
  items: BtsItem[];
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  returnFocusTo?: HTMLElement | null;
}

export function Lightbox({
  items,
  activeIndex,
  onClose,
  onNext,
  onPrev,
  returnFocusTo,
}: LightboxProps) {
  const activeItem = items[activeIndex] ?? items[0];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Arrow key navigation and Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // Manage focus trap and restoration
  useEffect(() => {
    closeButtonRef.current?.focus();
    return () => {
      returnFocusTo?.focus();
    };
  }, [returnFocusTo]);

  if (!activeItem) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Behind the scenes lightbox"
    >
      <div
        className="relative max-w-4xl w-full flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar with Mono Counter and Close Button */}
        <div className="flex items-center justify-between font-mono text-[var(--text-xs)] text-[var(--paper)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--industry)]">●</span>
            <span className="tracking-widest">
              BTS / {String(activeIndex + 1).padStart(2, "0")} of{" "}
              {String(items.length).padStart(2, "0")}
            </span>
            <span className="text-[var(--muted)] hidden sm:inline ml-2">
              [{activeItem.frameMarker}]
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="border border-[var(--line)] hover:border-[var(--industry)] text-[var(--paper)] hover:text-[var(--industry)] rounded-[var(--radius-control)] px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] transition-colors cursor-pointer"
            aria-label="Close lightbox"
          >
            ESC / ✕
          </button>
        </div>

        {/* Media Frame with Viewfinder Brackets */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--panel-raised)] border border-[var(--line)] rounded-[var(--radius-panel)] shadow-2xl">
          {/* Viewfinder Brackets around the lightbox image */}
          <PhotoCornerBrackets isHovered={true} size={36} borderWidth={2} inset={16} />

          {/* Shared Layout Media Container */}
          <motion.div
            layoutId={`bts-media-${activeItem.id}`}
            className="absolute inset-0 w-full h-full"
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {activeItem.posterSrc ? (
              <img
                src={activeItem.posterSrc}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[var(--ink)] flex flex-col justify-between p-6 sm:p-10 font-mono text-[var(--paper)]">
                <div className="flex justify-between items-center text-[var(--text-xs)] text-[var(--muted)]">
                  <span>REC MODE / BTS ARCHIVE</span>
                  <span>TC: 00:24:18:02</span>
                </div>

                <div className="text-center my-auto">
                  <p className="text-[var(--industry)] text-xs tracking-widest mb-1">
                    FRAME {activeItem.frameMarker}
                  </p>
                  <h4 className="text-xl sm:text-2xl font-bold font-[var(--font-display)] m-0 text-[var(--paper)]">
                    {activeItem.title}
                  </h4>
                  <p className="text-[var(--muted)] text-xs mt-2">
                    ARRI RAW · 4.5K · 24 FPS
                  </p>
                </div>

                <div className="flex justify-between items-center text-[var(--text-xs)] text-[var(--muted)]">
                  <span>SHUTTER: 180°</span>
                  <span>ISO 800 · 3200K</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-[var(--panel)]/80 hover:bg-[var(--panel-raised)] border border-[var(--line)] hover:border-[var(--industry)] text-[var(--paper)] hover:text-[var(--industry)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] cursor-pointer"
            aria-label="Previous BTS photo"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-[var(--panel)]/80 hover:bg-[var(--panel-raised)] border border-[var(--line)] hover:border-[var(--industry)] text-[var(--paper)] hover:text-[var(--industry)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] cursor-pointer"
            aria-label="Next BTS photo"
          >
            ▶
          </button>
        </div>

        {/* Caption Bar */}
        <div className="flex justify-between items-center font-mono text-[var(--text-xs)] text-[var(--muted)] px-1">
          <span>{activeItem.title}</span>
          <span className="text-[var(--industry)]">USE ARROW KEYS ◀ ▶</span>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 5. GEAR LINE TICKER
// ==========================================

export function GearTicker({
  shouldReduceMotion = false,
}: {
  shouldReduceMotion?: boolean;
}) {
  if (shouldReduceMotion) {
    return (
      <div className="gear-ticker-wrapper">
        <p className="gear-line m-0">
          <span className="text-[var(--paper)]">Gear line</span>{" "}
          <span className="text-[var(--industry)] font-bold">/</span>{" "}
          <span>
            cinema camera · fast glass · useful light · no unnecessary kit
          </span>
        </p>
      </div>
    );
  }

  return (
    <div
      className="gear-ticker-wrapper group"
      role="region"
      aria-label="Gear line ticker"
    >
      <div className="gear-ticker-track animate-gear-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copyIndex) => (
          <div
            key={copyIndex}
            className="flex items-center gap-6 px-4 shrink-0 font-mono text-[var(--text-xs)] text-[var(--muted)]"
            aria-hidden={copyIndex > 0}
          >
            <span className="text-[var(--paper)] font-medium">Gear line</span>
            <span className="text-[var(--industry)] font-bold">/</span>
            <span>
              cinema camera · fast glass · useful light · no unnecessary kit
            </span>
            <span className="text-[var(--industry)] font-bold">/</span>
            <span className="text-[var(--paper)] font-medium">Gear line</span>
            <span className="text-[var(--industry)] font-bold">/</span>
            <span>
              cinema camera · fast glass · useful light · no unnecessary kit
            </span>
            <span className="text-[var(--industry)] font-bold">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6. MAIN ABOUT SECTION (Duo + BTS + Grain)
// ==========================================

export function AboutSection() {
  const [hoveredPersonIndex, setHoveredPersonIndex] = useState<number | null>(
    null,
  );
  const [hoveredBtsIndex, setHoveredBtsIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const triggerTileRef = useRef<HTMLElement | null>(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-8% 0px" });
  const shouldReduceMotion = Boolean(useReducedMotion());
  const isDesktop = useIsDesktop();
  const isTouch = useIsTouchDevice();

  const handleNextLightbox = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % btsItems.length : 0,
    );
  }, []);

  const handlePrevLightbox = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + btsItems.length) % btsItems.length : 0,
    );
  }, []);

  return (
    <section
      className="about-section relative overflow-hidden"
      id="crew"
      ref={sectionRef}
      aria-labelledby="about-heading"
    >
      <div id="team" className="sr-only" />
      <div id="about" className="sr-only" />
      {/* 5. ATMOSPHERE: Hardware-Accelerated Repeating Film-Grain Background (0 CPU overhead) */}
      <div className="about-grain-overlay" aria-hidden="true" />

      <div className="relative z-10 flex flex-col justify-start w-full">
        {/* 1. HEADING + SCROLL REVEAL */}
        <div className="section-intro mb-8">
          {/* Lime kicker: "behind the camera" fades in */}
          <div className="overflow-mask-inline">
            <motion.p
              className="kicker"
              initial={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }
              }
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {siteContent.ui.aboutKicker}
            </motion.p>
          </div>

          {/* Heading lines slide up from behind overflow-hidden mask (y: 100% -> 0, ~0.6s easeOut, 0.1s stagger) */}
          <h2
            id="about-heading"
            className="m-0 font-extrabold leading-tight text-4xl sm:text-5xl lg:text-6xl"
          >
            <span className="overflow-mask block">
              <motion.span
                className="block"
                initial={
                  shouldReduceMotion
                    ? { y: 0, opacity: 1 }
                    : { y: "100%", opacity: 0 }
                }
                animate={
                  isInView
                    ? { y: 0, opacity: 1 }
                    : { y: "100%", opacity: 0 }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.08,
                }}
              >
                Small crew.
              </motion.span>
            </span>
            <span className="overflow-mask block">
              <motion.span
                className="block"
                initial={
                  shouldReduceMotion
                    ? { y: 0, opacity: 1 }
                    : { y: "100%", opacity: 0 }
                }
                animate={
                  isInView
                    ? { y: 0, opacity: 1 }
                    : { y: "100%", opacity: 0 }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.18,
                }}
              >
                Big attention.
              </motion.span>
            </span>
          </h2>

          {/* Subtext: fades up */}
          <div className="overflow-mask mt-3">
            <motion.p
              className="text-lg text-[var(--muted)] m-0 max-w-[50ch]"
              initial={
                shouldReduceMotion
                  ? { y: 0, opacity: 1 }
                  : { y: 16, opacity: 0 }
              }
              animate={
                isInView ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }
              }
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.28,
              }}
            >
              {siteContent.ui.aboutIntro}
            </motion.p>
          </div>
        </div>

        {/* 2. DUO INTERPLAY: Exactly two portrait cards in a flex row */}
        <div
          className="duo-row relative items-start"
          onMouseLeave={() => setHoveredPersonIndex(null)}
        >
          <PersonCard
            person={duoPeople[0]}
            index={0}
            isHovered={hoveredPersonIndex === 0}
            isOtherHovered={hoveredPersonIndex === 1}
            isInView={isInView}
            isDesktop={isDesktop}
            shouldReduceMotion={shouldReduceMotion}
            isTouch={isTouch}
            onHoverStart={() => setHoveredPersonIndex(0)}
            onHoverEnd={() =>
              setHoveredPersonIndex((current) =>
                current === 0 ? null : current,
              )
            }
          />

          {/* Thin 1px lime line drawn between cards on entrance at vertical center of the gap */}
          <div
            className="hidden md:flex items-center justify-center shrink-0 w-[1px] relative self-stretch py-8 z-10"
            aria-hidden="true"
          >
            <svg className="w-[1px] h-[55%] overflow-visible">
              <motion.line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="var(--industry)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={
                  isInView
                    ? { pathLength: 1, opacity: 0.2 }
                    : { pathLength: 0, opacity: 1 }
                }
                transition={{
                  pathLength: {
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.52,
                  },
                  opacity: { duration: 0.4, delay: 1.32 },
                }}
              />
            </svg>
          </div>

          <PersonCard
            person={duoPeople[1]}
            index={1}
            isHovered={hoveredPersonIndex === 1}
            isOtherHovered={hoveredPersonIndex === 0}
            isInView={isInView}
            isDesktop={isDesktop}
            shouldReduceMotion={shouldReduceMotion}
            isTouch={isTouch}
            onHoverStart={() => setHoveredPersonIndex(1)}
            onHoverEnd={() =>
              setHoveredPersonIndex((current) =>
                current === 1 ? null : current,
              )
            }
          />
        </div>

        {/* 3. BTS CONTACT-SHEET STRIP: 4 tiles in .bts-strip */}
        <div
          className="bts-strip"
          onMouseLeave={() => setHoveredBtsIndex(null)}
        >
          {btsItems.map((item, index) => (
            <BtsTile
              key={item.id}
              item={item}
              index={index}
              isHovered={hoveredBtsIndex === index}
              isOtherHovered={
                hoveredBtsIndex !== null && hoveredBtsIndex !== index
              }
              isInView={isInView}
              shouldReduceMotion={shouldReduceMotion}
              onHoverStart={() => setHoveredBtsIndex(index)}
              onHoverEnd={() =>
                setHoveredBtsIndex((current) =>
                  current === index ? null : current,
                )
              }
              onClick={() => {
                triggerTileRef.current = document.activeElement as HTMLElement;
                setLightboxIndex(index);
              }}
            />
          ))}
        </div>

        {/* 4. GEAR LINE TICKER: Marquee caption */}
        <div className="mt-8">
          <GearTicker shouldReduceMotion={shouldReduceMotion} />
        </div>
      </div>

      {/* BTS Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={btsItems}
            activeIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={handleNextLightbox}
            onPrev={handlePrevLightbox}
            returnFocusTo={triggerTileRef.current}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default AboutSection;
