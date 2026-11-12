"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { siteContent } from "@/lib/site-content";

// ==========================================
// 0. TYPES & DATA ARRAY
// ==========================================

export type CaseStudyItem = {
  id: string;
  category: string; // e.g. "RESTAURANT", "AUTOMOTIVE", "SHOWROOM"
  label: string; // e.g. "CASE / RESTAURANT"
  title: string;
  goal?: string;
  shot?: string;
  result?: string;
  posterSrc?: string;
  videoSrc?: string;
  client?: string;
  handle?: string;
  location?: string;
  growthMultiplier?: string;
  followersStart?: string;
  followersNow?: string;
  newFollowers?: string;
  topViews?: string;
  postsCount?: string;
  googleRating?: string;
  googleReviews?: string;
};

export const caseStudiesData: CaseStudyItem[] = siteContent.caseStudies.map(
  (item, index) => {
    const category =
      item.label.replace(/^CASE\s*\/\s*/i, "").trim() || "CASE";
    return {
      id: `case-${index}-${(item.client || item.title)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}`,
      category,
      label: item.label,
      title: item.title,
      goal: item.goal,
      shot: item.shot,
      result: item.result,
      posterSrc: item.posterSrc,
      videoSrc: item.videoSrc,
      client: item.client,
      handle: item.handle,
      location: item.location,
      growthMultiplier: item.growthMultiplier,
      followersStart: item.followersStart,
      followersNow: item.followersNow,
      newFollowers: item.newFollowers,
      topViews: item.topViews,
      postsCount: item.postsCount,
      googleRating: item.googleRating,
      googleReviews: item.googleReviews,
    };
  },
);

// ==========================================
// HELPER HOOKS
// ==========================================

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
}

// ==========================================
// 1. FILM FRAME DETAILS (Corner Brackets, REC, Timecode, Number Counter)
// ==========================================

export function FilmFrameCornerBrackets({
  isAnimated,
  shouldReduceMotion = false,
}: {
  isAnimated: boolean;
  shouldReduceMotion?: boolean;
}) {
  if (shouldReduceMotion) return null;

  const bracketSpring = {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    delay: 0.38,
  };

  const size = 18;
  const inset = 8;
  const borderWidth = 2;

  return (
    <div
      className="corner-brackets pointer-events-none absolute inset-0 z-20"
      aria-hidden="true"
    >
      {/* Top-Left */}
      <motion.i
        initial={{ x: -10, y: -10, opacity: 0 }}
        animate={
          isAnimated
            ? { x: 0, y: 0, opacity: 1 }
            : { x: -10, y: -10, opacity: 0 }
        }
        transition={bracketSpring}
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
        initial={{ x: 10, y: -10, opacity: 0 }}
        animate={
          isAnimated
            ? { x: 0, y: 0, opacity: 1 }
            : { x: 10, y: -10, opacity: 0 }
        }
        transition={bracketSpring}
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
        initial={{ x: -10, y: 10, opacity: 0 }}
        animate={
          isAnimated
            ? { x: 0, y: 0, opacity: 1 }
            : { x: -10, y: 10, opacity: 0 }
        }
        transition={bracketSpring}
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
        initial={{ x: 10, y: 10, opacity: 0 }}
        animate={
          isAnimated
            ? { x: 0, y: 0, opacity: 1 }
            : { x: 10, y: 10, opacity: 0 }
        }
        transition={bracketSpring}
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

export function FilmTimecode({ isActive }: { isActive: boolean }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setSeconds(0);
      return;
    }
    const interval = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
      setSeconds(0);
    };
  }, [isActive]);

  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return <span>{`${hrs}:${mins}:${secs}`}</span>;
}

function CountUpNumber({
  value,
  isOpen,
}: {
  value: number;
  isOpen: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setDisplay(0);
      return;
    }

    const controls = animate(0, value, {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplay(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [isOpen, value]);

  return <span>{display}</span>;
}

export function ResultTextWithCounter({
  text,
  isOpen,
  shouldReduceMotion,
}: {
  text: string;
  isOpen: boolean;
  shouldReduceMotion: boolean;
}) {
  if (shouldReduceMotion) {
    return <span>{text}</span>;
  }

  // Find all numeric segments in text
  const parts = text.split(/(\d+)/g);
  if (parts.length <= 1) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {parts.map((part, i) => {
        const num = parseInt(part, 10);
        if (!isNaN(num) && /^\d+$/.test(part)) {
          return <CountUpNumber key={i} value={num} isOpen={isOpen} />;
        }
        return part;
      })}
    </span>
  );
}

// ==========================================
// 2. CURSOR PREVIEW (Floating 16:9 Thumbnail for Closed Rows)
// ==========================================

export interface CursorPreviewProps {
  item: CaseStudyItem;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function CursorPreview({ item, x, y }: CursorPreviewProps) {
  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-50 overflow-hidden rounded-[var(--radius-control)] border border-[var(--line)] border-l-2 border-l-[var(--industry)] bg-[var(--panel-raised)] shadow-2xl"
      style={{
        x,
        y,
        width: 220,
        aspectRatio: "16 / 9",
        transform: "translateZ(0)",
        willChange: "transform, opacity",
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-hidden="true"
    >
      <div className="relative w-full h-full p-3 flex flex-col justify-between overflow-hidden bg-[var(--ink)]">
        {item.posterSrc ? (
          <img
            src={item.posterSrc}
            alt={`${item.client || "Case study"} — ${item.title}`}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--panel)] flex items-center justify-center">
            <span className="text-[var(--line)] text-2xl font-mono select-none">
              ⌖
            </span>
          </div>
        )}

        {/* Top-left mono PREVIEW label */}
        <div className="relative z-10 flex items-center justify-between font-mono text-[9px] tracking-widest text-[var(--paper)]">
          <span className="text-[var(--industry)] font-semibold uppercase">
            PREVIEW
          </span>
          <span className="text-[var(--muted)] text-[8px] uppercase tracking-wider">
            {item.category}
          </span>
        </div>

        {/* Bottom case title */}
        <div className="relative z-10 font-mono text-[10px] text-[var(--paper)] truncate select-none">
          <span className="text-[var(--industry)] mr-1">CASE /</span>
          <span className="font-bold">{item.title}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. CASE PANEL (Open Row Details with Staggered Entrance)
// ==========================================

export interface CasePanelProps {
  item: CaseStudyItem;
  isOpen: boolean;
  shouldReduceMotion: boolean;
}

export function CasePanel({
  item,
  isOpen,
  shouldReduceMotion,
}: CasePanelProps) {
  return (
    <div className="case-detail pt-2 pb-6">
      {/* Film Frame: fades/slides in from left (x: -16 -> 0) */}
      <motion.div
        initial={
          shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }
        }
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.45,
          ease: [0.16, 1, 0.3, 1],
          delay: shouldReduceMotion ? 0 : 0.08,
        }}
        className="case-video relative overflow-hidden bg-[var(--panel)]"
        style={{ borderLeft: 0, willChange: "transform, opacity" }}
      >
        {/* Lime left border draws top to bottom (scaleY 0 -> 1, origin top, ~0.5s) */}
        <motion.div
          className="absolute top-0 bottom-0 left-0 w-[var(--space-1)] bg-[var(--industry)] z-10"
          initial={shouldReduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "top", willChange: "transform" }}
          aria-hidden="true"
        />

        {/* Four small lime viewfinder corner brackets animate inward (~0.35s) */}
        <FilmFrameCornerBrackets
          isAnimated={isOpen}
          shouldReduceMotion={shouldReduceMotion}
        />

        {/* Top-left: mono "● REC" with blinking dot (opacity loop, ~1.2s) */}
        {!shouldReduceMotion && (
          <div
            className="absolute top-3 left-4 z-20 flex items-center gap-1.5 font-mono text-[var(--text-xs)] tracking-widest text-[var(--paper)] pointer-events-none uppercase select-none"
            aria-hidden="true"
          >
            <motion.span
              className="inline-block w-2 h-2 rounded-full bg-[var(--industry)]"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="font-semibold text-[var(--industry)]">REC</span>
          </div>
        )}

        {/* Top-right: running timecode (00:00:00, increments every second while open, resets on close) */}
        <div
          className="absolute top-3 right-4 z-20 font-mono text-[var(--text-xs)] text-[var(--muted)] pointer-events-none select-none tracking-widest"
          aria-hidden="true"
        >
          <FilmTimecode isActive={isOpen && !shouldReduceMotion} />
        </div>

        {/* Video, poster or film placeholder */}
        {item.videoSrc ? (
          <video
            className="case-video-media"
            src={item.videoSrc}
            poster={item.posterSrc}
            controls
            muted
            playsInline
            preload="none"
            aria-label={item.title}
          />
        ) : item.posterSrc ? (
          <img
            className="case-video-image"
            src={item.posterSrc}
            alt={`${item.client || "Case study"} media — ${item.title}`}
          />
        ) : (
          <div className="w-full h-full min-h-[140px] flex items-end justify-start font-mono text-[var(--text-xs)] text-[var(--muted)] select-none">
            <span className="relative z-10">
              {siteContent.ui.caseFilmPlaceholder}
            </span>
          </div>
        )}
      </motion.div>

      {/* Client Meta (Location & Instagram Handle) */}
      {(item.location || item.handle) && (
        <div className="flex flex-wrap items-center gap-3 pt-3 pb-1 font-mono text-xs">
          {item.location && (
            <span className="inline-flex items-center gap-1.5 text-[var(--paper)]">
              <span className="text-[var(--industry)]">📍</span>
              {item.location}
            </span>
          )}
          {item.handle && (
            <span className="text-[var(--industry)] font-semibold">
              {item.handle}
            </span>
          )}
        </div>
      )}

      {/* Growth Metric Stat Cards (From PDF Pages 3-6) */}
      {item.growthMultiplier && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 font-mono">
          <div className="p-3 rounded bg-[var(--panel-raised)] border border-[var(--line)]">
            <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--muted)]">Follower Growth</span>
            <span className="block text-xl sm:text-2xl font-black text-[var(--industry)]">{item.growthMultiplier}</span>
            {item.newFollowers && <span className="block text-[11px] text-[var(--paper)] font-semibold">{item.newFollowers} new</span>}
          </div>
          {item.followersStart && item.followersNow && (
            <div className="p-3 rounded bg-[var(--panel-raised)] border border-[var(--line)]">
              <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--muted)]">Trajectory</span>
              <span className="block text-sm sm:text-base font-bold text-[var(--paper)] mt-0.5">{item.followersStart} → {item.followersNow}</span>
              <span className="block text-[10px] text-[var(--muted)]">start &gt; now</span>
            </div>
          )}
          {item.topViews && (
            <div className="p-3 rounded bg-[var(--panel-raised)] border border-[var(--line)]">
              <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--muted)]">Top Reel Views</span>
              <span className="block text-lg sm:text-xl font-bold text-[var(--paper)] mt-0.5">{item.topViews}</span>
              {item.postsCount && <span className="block text-[10px] text-[var(--muted)]">{item.postsCount} posts</span>}
            </div>
          )}
          {item.googleRating && (
            <div className="p-3 rounded bg-[var(--panel-raised)] border border-[var(--line)]">
              <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[var(--muted)]">Google Rating</span>
              <span className="block text-lg sm:text-xl font-bold text-[#FFD700] mt-0.5">★ {item.googleRating}</span>
              {item.googleReviews && <span className="block text-[10px] text-[var(--muted)]">{item.googleReviews}</span>}
            </div>
          )}
        </div>
      )}

      {/* Goal block: rises (y: 12 -> 0, 80ms apart) */}
      <motion.p
        initial={
          shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          delay: shouldReduceMotion ? 0 : 0.16,
        }}
        className="m-0"
      >
        <strong className="text-[var(--paper)] mr-2 font-bold">
          {siteContent.ui.caseGoalLabel}
        </strong>
        <span>{item.goal}</span>
      </motion.p>

      {/* What we shot block: rises (y: 12 -> 0, 80ms apart) */}
      <motion.p
        initial={
          shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          delay: shouldReduceMotion ? 0 : 0.24,
        }}
        className="m-0"
      >
        <strong className="text-[var(--paper)] mr-2 font-bold">
          {siteContent.ui.caseShotLabel}
        </strong>
        <span>{item.shot}</span>
      </motion.p>

      {/* Result block: rises (y: 12 -> 0, 80ms apart) + number count up */}
      <motion.p
        initial={
          shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          delay: shouldReduceMotion ? 0 : 0.32,
        }}
        className="m-0"
      >
        <strong className="text-[var(--paper)] mr-2 font-bold">
          {siteContent.ui.caseResultLabel}
        </strong>
        <ResultTextWithCounter
          text={item.result || ""}
          isOpen={isOpen}
          shouldReduceMotion={shouldReduceMotion}
        />
      </motion.p>
    </div>
  );
}

// ==========================================
// 4. CASE ROW COMPONENT
// ==========================================

export interface CaseRowProps {
  item: CaseStudyItem;
  index: number;
  isOpen: boolean;
  isHovered: boolean;
  isOtherHovered: boolean;
  isInView: boolean;
  shouldReduceMotion: boolean;
  isTouch: boolean;
  onToggle: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onPointerMove: (e: React.PointerEvent) => void;
}

export function CaseRow({
  item,
  index,
  isOpen,
  isHovered,
  isOtherHovered,
  isInView,
  shouldReduceMotion,
  isTouch,
  onToggle,
  onHoverStart,
  onHoverEnd,
  onPointerMove,
}: CaseRowProps) {
  // Row opacity rule: The open row NEVER dims. Other rows dim to 0.5 when any row is hovered.
  const rowOpacity = isOpen ? 1 : isHovered ? 1 : isOtherHovered ? 0.5 : 1;

  return (
    <motion.article
      className={`case-card relative ${isOpen ? "is-open" : ""}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onPointerMove={onPointerMove}
      // Section entrance: case rows rise 20px and fade in, 100ms apart
      initial={
        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
      }
      animate={
        isInView ? { opacity: rowOpacity, y: 0 } : { opacity: 0, y: 20 }
      }
      transition={{
        y: {
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
          delay: shouldReduceMotion ? 0 : 0.3 + index * 0.1,
        },
        opacity: {
          duration: isHovered || isOtherHovered ? 0.25 : 0.5,
          ease: "easeOut",
          delay:
            isHovered || isOtherHovered
              ? 0
              : shouldReduceMotion
                ? 0
                : 0.3 + index * 0.1,
        },
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Accessible Header Button */}
      <button
        id={`case-header-${item.id}`}
        type="button"
        onClick={onToggle}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
        aria-expanded={isOpen}
        aria-controls={`case-panel-${item.id}`}
        className="relative z-10 w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] rounded-[var(--radius-control)]"
      >
        {/* Left mono label: turns lime on hover */}
        <motion.span
          animate={{
            color: isHovered ? "var(--industry)" : "var(--muted)",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="font-mono text-[var(--text-xs)] uppercase tracking-wider"
        >
          {item.label}
        </motion.span>

        {/* Middle case title: shifts x: 8px on hover */}
        <motion.strong
          animate={{ x: isHovered && !shouldReduceMotion ? 8 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ willChange: "transform" }}
          className="block font-bold leading-tight"
        >
          {item.title}
        </motion.strong>

        {/* Right action text: swaps "Read case +" <-> "Close —" with vertical crossfade and '+' rotate 90 */}
        <b className="flex items-center justify-end gap-1.5 font-mono text-[var(--text-sm)] text-[var(--industry)] select-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={{ y: isOpen ? 6 : -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isOpen ? -6 : 6, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-block"
            >
              {isOpen ? "Close" : "Read case"}
            </motion.span>
          </AnimatePresence>

          <motion.span
            className="inline-block font-bold text-base leading-none origin-center"
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            aria-hidden="true"
          >
            {isOpen ? "—" : "+"}
          </motion.span>
        </b>
      </button>

      {/* 1px lime line along the bottom of the row (scaleX 0 -> 1, origin left, ~0.4s) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--industry)] pointer-events-none z-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left", willChange: "transform" }}
        aria-hidden="true"
      />

      {/* Accordion Panel Container with AnimatePresence & Height: 0 -> auto */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`case-panel-${item.id}`}
            role="region"
            aria-labelledby={`case-header-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
            }
            style={{ overflow: "hidden" }}
          >
            <CasePanel
              item={item}
              isOpen={isOpen}
              shouldReduceMotion={shouldReduceMotion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ==========================================
// 5. MAIN CASES SECTION COMPONENT
// ==========================================

// Studio KPI Stats Data Array for Results at a Glance
const KPI_STATS = [
  {
    id: "clients",
    label: "CLIENTS",
    value: "4",
    defaultSub: "Local businesses",
    hoverSub: "4 Thoothukudi brands",
    accent: false,
  },
  {
    id: "accounts",
    label: "ACCOUNTS",
    value: "5",
    defaultSub: "Instagram profiles",
    hoverSub: "Main & branch accounts",
    accent: false,
  },
  {
    id: "followers",
    label: "NEW FOLLOWERS",
    value: "6,300+",
    defaultSub: "Organic audience",
    hoverSub: "100% organic · zero ads",
    accent: true,
  },
  {
    id: "multiplier",
    label: "PEAK MULTIPLIER",
    value: "6.1x",
    defaultSub: "MM Cars (299 → 1.8K)",
    hoverSub: "6.1x top follower reach",
    accent: false,
  },
];

export function CasesSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredClosedCase, setHoveredClosedCase] =
    useState<CaseStudyItem | null>(null);
  const [hoveredKpiIndex, setHoveredKpiIndex] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = useHydratedReducedMotion();
  const isTouch = useIsTouchDevice();

  // Floating cursor spring motion values (offset to right and above pointer)
  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);
  const smoothX = useSpring(cursorX, { stiffness: 320, damping: 28 });
  const smoothY = useSpring(cursorY, { stiffness: 320, damping: 28 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isTouch || shouldReduceMotion) return;
      // Position offset: sits to the right (+24px) and above pointer (-140px)
      cursorX.set(e.clientX + 24);
      cursorY.set(e.clientY - 140);
    },
    [isTouch, shouldReduceMotion, cursorX, cursorY],
  );

  const handleToggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
    setHoveredClosedCase(null);
  }, []);

  return (
    <section
      className="cases-section relative overflow-hidden"
      id="cases"
      ref={sectionRef}
      aria-labelledby="cases-heading"
      onPointerLeave={() => {
        setHoveredId(null);
        setHoveredClosedCase(null);
      }}
    >
      {/* 6. ATMOSPHERE: Subtle Film-Grain Overlay (4% opacity) */}
      <div className="cases-grain-overlay" aria-hidden="true" />

      {/* Floating Cursor Preview (Active for hovered closed rows) */}
      <AnimatePresence>
        {hoveredClosedCase && !shouldReduceMotion && !isTouch && (
          <CursorPreview
            item={hoveredClosedCase}
            x={smoothX}
            y={smoothY}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col justify-start w-full">
        {/* 5. SCROLL REVEAL: Header Entrance */}
        <div className="section-intro mb-8">
          <div className="overflow-mask-inline">
            <motion.p
              className="kicker"
              initial={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }
              }
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {siteContent.ui.casesKicker}
            </motion.p>
          </div>

          <h2
            id="cases-heading"
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
                A few things
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
                we made move.
              </motion.span>
            </span>
          </h2>
        </div>

        {/* Results at a Glance — Studio KPI Metrics Strip */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-10 sm:mb-12 py-6 sm:py-7 border-y border-[var(--line,#2A2A30)] bg-[var(--panel,#141419)]/30 relative"
          onMouseLeave={() => setHoveredKpiIndex(null)}
        >
          {/* Top metadata rule */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--line,#2A2A30)]/60 text-[11px] uppercase tracking-widest text-[var(--muted,#A9A7A0)] font-mono">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--industry,#C6FF3D)] animate-pulse" aria-hidden="true" />
              <strong className="font-bold text-[var(--paper,#F4F1EA)]">RESULTS AT A GLANCE</strong>
              <span className="text-[var(--line,#2A2A30)]" aria-hidden="true">/</span>
              <span>THOOTHUKUDI CAMPAIGNS</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] text-[var(--muted,#A9A7A0)]/60 tracking-widest">
              PORTFOLIO TRACK RECORD
            </span>
          </div>

          {/* 4-column KPI stats grid with focus-pull hover interaction */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-mono">
            {KPI_STATS.map((kpi, idx) => {
              const isHovered = hoveredKpiIndex === idx;
              const isOtherHovered = hoveredKpiIndex !== null && !isHovered;

              return (
                <div
                  key={kpi.id}
                  tabIndex={0}
                  onClick={() => setHoveredKpiIndex(hoveredKpiIndex === idx ? null : idx)}
                  onMouseEnter={() => setHoveredKpiIndex(idx)}
                  onFocus={() => setHoveredKpiIndex(idx)}
                  onBlur={() => setHoveredKpiIndex(null)}
                  className={`group relative min-w-0 pl-4 sm:pl-5 py-2 border-l outline-none cursor-default select-none transition-colors duration-200 ${
                    isHovered
                      ? "border-[var(--industry,#C6FF3D)]"
                      : kpi.accent
                      ? "border-[var(--industry,#C6FF3D)]/50"
                      : "border-[var(--line,#2A2A30)]"
                  }`}
                  style={{
                    opacity: isOtherHovered ? 0.38 : 1,
                    transition: "opacity 250ms ease, border-color 200ms ease",
                  }}
                >
                  <span
                    className={`text-[11px] uppercase tracking-widest block transition-colors duration-200 ${
                      isHovered || kpi.accent
                        ? "text-[var(--industry,#C6FF3D)] font-bold"
                        : "text-[var(--muted,#A9A7A0)] group-hover:text-[var(--paper,#F4F1EA)]"
                    }`}
                  >
                    {kpi.label}
                  </span>
                  <span
                    className={`text-3xl sm:text-4xl lg:text-5xl font-black font-display block mt-1 transition-colors duration-200 ${
                      kpi.accent
                        ? "text-[var(--industry,#C6FF3D)]"
                        : isHovered
                        ? "text-white"
                        : "text-[var(--paper,#F4F1EA)]"
                    }`}
                  >
                    {kpi.value}
                  </span>
                  <div className="h-5 mt-1 overflow-hidden">
                    <span
                      className={`text-xs block truncate transition-colors duration-200 ${
                        isHovered
                          ? "text-[var(--paper,#F4F1EA)] font-medium"
                          : "text-[var(--muted,#A9A7A0)]/75"
                      }`}
                    >
                      {isHovered ? kpi.hoverSub : kpi.defaultSub}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Accordion List of Case Studies */}
        <div className="cases-list">
          {caseStudiesData.map((item, index) => {
            const isOpen = openId === item.id;
            const isHovered = hoveredId === item.id;
            const isOtherHovered = hoveredId !== null && hoveredId !== item.id;

            return (
              <CaseRow
                key={item.id}
                item={item}
                index={index}
                isOpen={isOpen}
                isHovered={isHovered}
                isOtherHovered={isOtherHovered}
                isInView={isInView}
                shouldReduceMotion={shouldReduceMotion}
                isTouch={isTouch}
                onToggle={() => handleToggle(item.id)}
                onHoverStart={() => {
                  setHoveredId(item.id);
                  if (!isOpen) {
                    setHoveredClosedCase(item);
                  } else {
                    setHoveredClosedCase(null);
                  }
                }}
                onHoverEnd={() => {
                  setHoveredId((current) =>
                    current === item.id ? null : current,
                  );
                  setHoveredClosedCase((current) =>
                    current?.id === item.id ? null : current,
                  );
                }}
                onPointerMove={(e) => {
                  handlePointerMove(e);
                  if (!isOpen) {
                    setHoveredClosedCase(item);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { CasesSection as CaseStudies };
export default CasesSection;
