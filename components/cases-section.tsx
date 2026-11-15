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
import { NeonArrow } from "@/components/ui/neon-icons";

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
// 1. FILM FRAME DETAILS (Corner Brackets, REC, Timecode)
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
          borderColor: "#D4FF3F",
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
          borderColor: "#D4FF3F",
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
          borderColor: "#D4FF3F",
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
          borderColor: "#D4FF3F",
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
      className="pointer-events-none fixed top-0 left-0 z-50 overflow-hidden border-2 border-[#FF2DA8] bg-[#0B0B0B] shadow-[0_0_25px_rgba(255,45,168,0.4)]"
      style={{
        x,
        y,
        width: 240,
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
      <div className="relative w-full h-full p-3 flex flex-col justify-between overflow-hidden bg-[#0B0B0B]">
        {item.posterSrc ? (
          <img
            src={item.posterSrc}
            alt={`${item.client || "Case study"} — ${item.title}`}
            className="absolute inset-0 w-full h-full object-cover opacity-75"
            style={{ filter: "url(#duotone-pink)" }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0B0B0B] flex items-center justify-center">
            <span className="text-[#FF2DA8] text-2xl font-mono select-none">
              ⌖
            </span>
          </div>
        )}

        {/* Top-left mono PREVIEW label */}
        <div className="relative z-10 flex items-center justify-between font-mono text-[9px] tracking-widest text-[#D4FF3F]">
          <span className="text-[#D4FF3F] font-bold uppercase bg-[#0B0B0B] px-1 border border-[#FF2DA8]/40">
            PREVIEW
          </span>
          <span className="text-[#FF2DA8] text-[8px] uppercase tracking-wider font-bold">
            {item.category}
          </span>
        </div>

        {/* Bottom case title */}
        <div className="relative z-10 font-mono text-[10px] text-[#D4FF3F] truncate select-none bg-[#0B0B0B]/90 px-1 py-0.5 border border-[#FF2DA8]/30">
          <span className="text-[#FF2DA8] mr-1 font-bold">CASE /</span>
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
    <div className="case-detail pt-2 pb-6 text-[#D4FF3F]">
      {/* Film Frame: fades/slides in from left */}
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
        className="case-video relative overflow-hidden bg-[#0B0B0B] border border-[#FF2DA8]/40"
        style={{ borderLeft: 0, willChange: "transform, opacity" }}
      >
        {/* Chartreuse left border draws top to bottom */}
        <motion.div
          className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#D4FF3F] z-10 shadow-[0_0_10px_#D4FF3F]"
          initial={shouldReduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "top", willChange: "transform" }}
          aria-hidden="true"
        />

        {/* Viewfinder corner brackets */}
        <FilmFrameCornerBrackets
          isAnimated={isOpen}
          shouldReduceMotion={shouldReduceMotion}
        />

        {/* Top-left: REC with blinking dot */}
        {!shouldReduceMotion && (
          <div
            className="absolute top-3 left-4 z-20 flex items-center gap-1.5 font-mono text-xs tracking-widest text-[#FF2DA8] pointer-events-none uppercase select-none font-bold"
            aria-hidden="true"
          >
            <motion.span
              className="inline-block w-2 h-2 rounded-full bg-[#FF2DA8] shadow-[0_0_6px_#FF2DA8]"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span>REC // CASE FEED</span>
          </div>
        )}

        {/* Top-right: running timecode */}
        <div
          className="absolute top-3 right-4 z-20 font-mono text-xs text-[#D4FF3F] pointer-events-none select-none tracking-widest font-bold"
          aria-hidden="true"
        >
          <FilmTimecode isActive={isOpen && !shouldReduceMotion} />
        </div>

        {/* Video, poster or film placeholder */}
        {item.videoSrc ? (
          <video
            className="case-video-media w-full aspect-video object-cover"
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
            className="case-video-image w-full aspect-video object-cover"
            src={item.posterSrc}
            alt={`${item.client || "Case study"} media — ${item.title}`}
            style={{ filter: "url(#duotone-chartreuse)" }}
          />
        ) : (
          <div className="w-full h-full min-h-[140px] flex items-end justify-start font-mono text-xs text-[#FF2DA8] select-none p-4">
            <span className="relative z-10 font-bold">
              {siteContent.ui.caseFilmPlaceholder}
            </span>
          </div>
        )}
      </motion.div>

      {/* Client Meta (Location & Instagram Handle) */}
      {(item.location || item.handle) && (
        <div className="flex flex-wrap items-center gap-3 pt-3 pb-1 font-mono text-xs">
          {item.location && (
            <span className="inline-flex items-center gap-1.5 text-[#D4FF3F] font-bold">
              <span className="text-[#FF2DA8]">LOCATION //</span>
              {item.location}
            </span>
          )}
          {item.handle && (
            <span className="text-[#FF2DA8] font-bold">
              {item.handle}
            </span>
          )}
        </div>
      )}

      {/* Growth Metric Stat Cards */}
      {item.growthMultiplier && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 font-mono">
          <div className="p-3 bg-[#0B0B0B] border border-[#FF2DA8]">
            <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#FF2DA8] font-bold">Follower Growth</span>
            <span className="block text-2xl sm:text-3xl font-black text-[#D4FF3F] mt-0.5">{item.growthMultiplier}</span>
            {item.newFollowers && <span className="block text-[11px] text-[#FF2DA8] font-bold">{item.newFollowers} new</span>}
          </div>
          {item.followersStart && item.followersNow && (
            <div className="p-3 bg-[#0B0B0B] border border-[#FF2DA8]/50">
              <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#FF2DA8] font-bold">Trajectory</span>
              <span className="block text-sm sm:text-base font-bold text-[#D4FF3F] mt-0.5">{item.followersStart} → {item.followersNow}</span>
              <span className="block text-[10px] text-[#D4FF3F]/70">ORGANIC REACH</span>
            </div>
          )}
          {item.topViews && (
            <div className="p-3 bg-[#0B0B0B] border border-[#FF2DA8]/50">
              <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#FF2DA8] font-bold">Top Reel Views</span>
              <span className="block text-lg sm:text-xl font-bold text-[#D4FF3F] mt-0.5">{item.topViews}</span>
              {item.postsCount && <span className="block text-[10px] text-[#D4FF3F]/70">{item.postsCount} reels shot</span>}
            </div>
          )}
          {item.googleRating && (
            <div className="p-3 bg-[#0B0B0B] border border-[#FF2DA8]/50">
              <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#FF2DA8] font-bold">Google Rating</span>
              <span className="block text-lg sm:text-xl font-bold text-[#D4FF3F] mt-0.5">★ {item.googleRating}</span>
              {item.googleReviews && <span className="block text-[10px] text-[#D4FF3F]/70">{item.googleReviews}</span>}
            </div>
          )}
        </div>
      )}

      {/* Goal block */}
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
        className="m-0 font-mono text-sm leading-relaxed"
      >
        <strong className="text-[#FF2DA8] mr-2 font-bold uppercase tracking-wider">
          {siteContent.ui.caseGoalLabel}:
        </strong>
        <span className="text-[#D4FF3F]">{item.goal}</span>
      </motion.p>

      {/* What we shot block */}
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
        className="m-0 mt-2 font-mono text-sm leading-relaxed"
      >
        <strong className="text-[#FF2DA8] mr-2 font-bold uppercase tracking-wider">
          {siteContent.ui.caseShotLabel}:
        </strong>
        <span className="text-[#D4FF3F]">{item.shot}</span>
      </motion.p>

      {/* Result block with number counter */}
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
        className="m-0 mt-2 font-mono text-sm leading-relaxed"
      >
        <strong className="text-[#FF2DA8] mr-2 font-bold uppercase tracking-wider">
          {siteContent.ui.caseResultLabel}:
        </strong>
        <span className="text-[#D4FF3F] font-bold">
          <ResultTextWithCounter
            text={item.result || ""}
            isOpen={isOpen}
            shouldReduceMotion={shouldReduceMotion}
          />
        </span>
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
  const rowOpacity = isOpen ? 1 : isHovered ? 1 : isOtherHovered ? 0.45 : 1;

  return (
    <motion.article
      className={`case-card relative border-3 border-[#FF2DA8] mb-5 p-5 sm:p-7 bg-[#0B0B0B] transition-all rounded-none select-none ${
        isOpen
          ? "border-[#D4FF3F] shadow-[8px_8px_0px_#FF2DA8]"
          : "shadow-[5px_5px_0px_#D4FF3F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#D4FF3F]"
      } ${isOpen ? "is-open" : ""}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onPointerMove={onPointerMove}
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
        className="relative z-10 w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F] grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2"
      >
        {/* Left mono label: turns chartreuse on hover */}
        <div className="md:col-span-3">
          <motion.span
            animate={{
              color: isHovered || isOpen ? "#D4FF3F" : "#FF2DA8",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="font-mono text-xs uppercase tracking-widest font-bold block"
          >
            // {item.label}
          </motion.span>
        </div>

        {/* Middle case title: shifts x: 8px on hover */}
        <div className="md:col-span-6">
          <motion.strong
            animate={{ x: isHovered && !shouldReduceMotion ? 8 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ willChange: "transform" }}
            className="block font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-[#FF2DA8] group-hover:text-[#D4FF3F] font-display"
          >
            {item.title}
          </motion.strong>
        </div>

        {/* Right action text */}
        <div className="md:col-span-3 flex items-center justify-end gap-2 font-mono text-xs text-[#D4FF3F] select-none font-bold">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={{ y: isOpen ? 6 : -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isOpen ? -6 : 6, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-block tracking-widest uppercase"
            >
              {isOpen ? "[ CLOSE CASE ]" : "[ READ CASE + ]"}
            </motion.span>
          </AnimatePresence>

          <motion.span
            className="inline-flex items-center justify-center font-bold text-sm leading-none origin-center text-[#FF2DA8]"
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            aria-hidden="true"
          >
            {isOpen ? "—" : <NeonArrow className="size-3.5 inline-block" />}
          </motion.span>
        </div>
      </button>

      {/* 1px chartreuse highlight line on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4FF3F] pointer-events-none z-10 shadow-[0_0_8px_#D4FF3F]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered || isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left", willChange: "transform" }}
        aria-hidden="true"
      />

      {/* Accordion Panel Container */}
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
  const isInView = useInView(sectionRef, { once: true, margin: "50px 0px" });
  const shouldReduceMotion = useHydratedReducedMotion();
  const isTouch = useIsTouchDevice();

  // Floating cursor spring motion values
  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);
  const smoothX = useSpring(cursorX, { stiffness: 320, damping: 28 });
  const smoothY = useSpring(cursorY, { stiffness: 320, damping: 28 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isTouch || shouldReduceMotion) return;
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
      className="cases-section relative overflow-hidden bg-[#0B0B0B] text-[#FF2DA8] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#FF2DA8]/20"
      id="cases"
      ref={sectionRef}
      aria-labelledby="cases-heading"
      onPointerLeave={() => {
        setHoveredId(null);
        setHoveredClosedCase(null);
      }}
    >
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

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col justify-start w-full">
        {/* Header Entrance */}
        <div className="section-intro mb-8">
          <div className="overflow-mask-inline">
            <motion.p
              className="font-mono text-xs uppercase tracking-widest text-[#D4FF3F] font-bold block mb-2"
              initial={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }
              }
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              // {siteContent.ui.casesKicker}
            </motion.p>
          </div>

          <h2
            id="cases-heading"
            className="m-0 font-extrabold leading-tight text-4xl sm:text-5xl lg:text-6xl font-display uppercase tracking-tight text-[#FF2DA8]"
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
                A FEW THINGS
              </motion.span>
            </span>
            <span className="overflow-mask block">
              <motion.span
                className="block text-[#D4FF3F]"
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
                WE MADE MOVE.
              </motion.span>
            </span>
          </h2>
        </div>

        {/* Results at a Glance — Studio KPI Metrics Strip */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-10 sm:mb-12 py-6 sm:py-7 border-y border-[#FF2DA8]/30 bg-[#0B0B0B] relative"
          onMouseLeave={() => setHoveredKpiIndex(null)}
        >
          {/* Top metadata rule */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#FF2DA8]/20 text-[10px] sm:text-[11px] uppercase tracking-widest text-[#D4FF3F] font-mono">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <strong className="font-bold text-[#FF2DA8]">RESULTS AT A GLANCE</strong>
              <span className="text-[#FF2DA8]" aria-hidden="true">//</span>
              <span>THOOTHUKUDI CAMPAIGNS</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] text-[#D4FF3F]/80 tracking-widest font-bold">
              VERIFIED PORTFOLIO RECORD
            </span>
          </div>

          {/* 4-column KPI stats grid with heavy brutalist box matrix */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-3 border-[#FF2DA8] shadow-[6px_6px_0px_#D4FF3F] bg-[#0B0B0B] font-mono">
            {KPI_STATS.map((kpi, idx) => {
              const isHovered = hoveredKpiIndex === idx;

              return (
                <div
                  key={kpi.id}
                  tabIndex={0}
                  onClick={() => setHoveredKpiIndex(hoveredKpiIndex === idx ? null : idx)}
                  onMouseEnter={() => setHoveredKpiIndex(idx)}
                  onFocus={() => setHoveredKpiIndex(idx)}
                  onBlur={() => setHoveredKpiIndex(null)}
                  className={`group relative p-4 sm:p-6 border-b lg:border-b-0 ${idx % 2 === 0 ? "border-r-2" : "lg:border-r-2"} border-[#FF2DA8] outline-none cursor-default select-none transition-colors duration-150 ${
                    isHovered ? "bg-[#FF2DA8]/10" : "bg-[#0B0B0B]"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-mono text-[#D4FF3F] mb-1">
                    <span>{kpi.label}</span>
                    <span className="text-[#FF2DA8] font-bold">0{idx + 1}</span>
                  </div>
                  <span
                    className={`text-4xl sm:text-5xl lg:text-6xl font-black font-display block mt-1 tracking-tighter ${
                      kpi.accent || isHovered ? "text-[#D4FF3F]" : "text-[#FF2DA8]"
                    }`}
                  >
                    {kpi.value}
                  </span>
                  <div className="mt-2 text-xs font-mono text-[#D4FF3F]/80">
                    {isHovered ? kpi.hoverSub : kpi.defaultSub}
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
