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
  MotionValue,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { siteContent } from "@/lib/site-content";

// ==========================================
// 0. TYPES & DATA ARRAY
// ==========================================

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  sceneMarker: string; // e.g. "SC / 01", "SC / 02", "SC / 03"
}

export const testimonialsData: TestimonialItem[] = siteContent.testimonials.map(
  (item, index) => ({
    id: `testimonial-${index + 1}`,
    quote: item.quote,
    name: item.name,
    role: item.role,
    sceneMarker: `SC / ${String(index + 1).padStart(2, "0")}`,
  }),
);

// ==========================================
// 1. SUBTITLE-STYLE QUOTE REVEAL (AnimatedQuote)
// ==========================================

export interface AnimatedQuoteProps {
  quote: string;
  isRevealed: boolean;
  shouldReduceMotion?: boolean;
}

export function AnimatedQuote({
  quote,
  isRevealed,
  shouldReduceMotion = false,
}: AnimatedQuoteProps) {
  const words = quote.split(/\s+/).filter(Boolean);

  if (shouldReduceMotion) {
    return (
      <blockquote className="m-0 mb-4 text-xl sm:text-2xl font-normal leading-relaxed text-[var(--paper)]">
        “{quote}”
      </blockquote>
    );
  }

  return (
    <blockquote className="relative m-0 mb-4 text-xl sm:text-2xl font-normal leading-relaxed text-[var(--paper)]">
      {/* Accessible screen-reader text: read continuous sentence smoothly */}
      <span className="sr-only">“{quote}”</span>

      {/* Visual synchronized subtitle word reveal */}
      <span aria-hidden="true">
        {words.map((word, wordIndex) => {
          const isFirst = wordIndex === 0;
          const isLast = wordIndex === words.length - 1;
          const displayWord = `${isFirst ? "“" : ""}${word}${isLast ? "”" : ""}`;

          return (
            <motion.span
              key={wordIndex}
              className={`inline-block will-change-transform ${
                !isLast ? "mr-[0.28em]" : ""
              }`}
              initial={{ opacity: 0.15, y: 6 }}
              animate={
                isRevealed
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0.15, y: 6 }
              }
              transition={{
                duration: 0.25,
                ease: "easeOut",
                delay: isRevealed ? wordIndex * 0.035 : 0,
              }}
            >
              {displayWord}
            </motion.span>
          );
        })}
      </span>
    </blockquote>
  );
}

// ==========================================
// 2. SCROLL PROGRESS & COUNTER
// ==========================================

export interface ScrollProgressProps {
  activeIndex: number;
  total: number;
  progress: MotionValue<number>;
  shouldReduceMotion?: boolean;
}

export function ScrollProgress({
  activeIndex,
  total,
  progress,
  shouldReduceMotion = false,
}: ScrollProgressProps) {
  const widthPercent = useTransform(progress, [0, 1], ["0%", "100%"], {
    clamp: true,
  });

  return (
    <div
      className="mt-8 flex items-center gap-4"
      aria-label={`Testimonial ${activeIndex + 1} of ${total}`}
    >
      {/* 1px progress track with lime fill */}
      <div
        className="relative h-[1px] w-28 sm:w-36 bg-[var(--line)] overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          className="absolute left-0 top-0 bottom-0 bg-[var(--industry)] origin-left"
          style={{
            width: shouldReduceMotion
              ? `${((activeIndex + 1) / total) * 100}%`
              : widthPercent,
          }}
        />
      </div>

      {/* Mono Counter: "01 / 03" */}
      <div
        className="font-mono text-xs tracking-widest text-[var(--muted)] flex items-center select-none"
        aria-hidden="true"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="text-[var(--paper)] font-bold inline-block"
          >
            {String(activeIndex + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
        <span className="mx-1.5 text-[var(--line)]">/</span>
        <span>{String(total).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

// ==========================================
// 3. SINGLE TESTIMONIAL BLOCK (Testimonial)
// ==========================================

export interface TestimonialProps {
  item: TestimonialItem;
  index: number;
  isActive: boolean;
  shouldReduceMotion?: boolean;
  itemRef?: (node: HTMLElement | null) => void;
}

export function Testimonial({
  item,
  index,
  isActive,
  shouldReduceMotion = false,
  itemRef,
}: TestimonialProps) {
  const localRef = useRef<HTMLElement | null>(null);
  const isRevealed = useInView(localRef, { amount: 0.6, once: true });
  const [isHovered, setIsHovered] = useState(false);

  // Assign both external ref callback and local ref for useInView
  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      localRef.current = node;
      if (itemRef) itemRef(node);
    },
    [itemRef],
  );

  const words = item.quote.split(/\s+/).filter(Boolean);
  // Calculate timing for author attribution entrance after last word lands
  const lastWordFinishTime = shouldReduceMotion ? 0 : words.length * 0.035 + 0.1;

  return (
    <article
      ref={setRefs}
      className="testimonial-card relative w-full group py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3. HAIRLINE DIVIDER (Draws in scaleX: 0 -> 1, turns lime on hover) */}
      <motion.div
        className="testimonial-hairline h-[1px] w-full origin-left mb-6 sm:mb-8"
        initial={shouldReduceMotion ? false : { scaleX: 0 }}
        animate={{
          scaleX: isRevealed || shouldReduceMotion ? 1 : 0,
          backgroundColor: isHovered ? "var(--industry)" : "var(--line)",
        }}
        transition={{
          scaleX: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
          backgroundColor: { duration: 0.25, ease: "easeOut" },
        }}
        aria-hidden="true"
      />

      {/* 2. ACTIVE QUOTE SPOTLIGHT CONTAINER */}
      <motion.div
        className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-8 pl-4 sm:pl-6 py-4"
        animate={{
          opacity: shouldReduceMotion ? 1 : isActive ? 1 : isHovered ? 0.85 : 0.35,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* 2px Lime Bar on left edge of active quote */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--industry)] origin-top pointer-events-none"
          initial={shouldReduceMotion ? false : { scaleY: 0 }}
          animate={{ scaleY: isActive || shouldReduceMotion ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
          aria-hidden="true"
        />

        {/* Mono Scene Marker: "SC / 01" (Lime when active, gray otherwise) */}
        <div
          className="font-mono text-xs tracking-widest uppercase shrink-0 pt-1 select-none transition-colors duration-300"
          style={{
            color: isActive ? "var(--industry)" : "var(--muted)",
          }}
          aria-hidden="true"
        >
          {item.sceneMarker}
        </div>

        {/* Quote & Author Body (Shifts x: 6px on hover) */}
        <motion.div
          className="flex-1 min-w-0"
          animate={{ x: isHovered && !shouldReduceMotion ? 6 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Subtitle-style Quote Reveal */}
          <AnimatedQuote
            quote={item.quote}
            isRevealed={isRevealed}
            shouldReduceMotion={shouldReduceMotion}
          />

          {/* Client Attribution: Lime "—" + name sliding in + role fading in */}
          <figcaption className="grid text-sm text-[var(--paper)]">
            <div className="flex items-center gap-2">
              {/* Lime "—" that draws in */}
              <motion.span
                className="inline-block w-3.5 h-[2px] bg-[var(--industry)] origin-left shrink-0"
                initial={shouldReduceMotion ? false : { scaleX: 0 }}
                animate={
                  isRevealed || shouldReduceMotion
                    ? { scaleX: 1 }
                    : { scaleX: 0 }
                }
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1] as const,
                  delay: lastWordFinishTime,
                }}
                aria-hidden="true"
              />

              {/* Client Name: Slides in (x: -12 -> 0, fade) */}
              <motion.span
                className="font-medium text-[var(--paper)] tracking-wide"
                initial={shouldReduceMotion ? false : { x: -12, opacity: 0 }}
                animate={
                  isRevealed || shouldReduceMotion
                    ? { x: 0, opacity: 1 }
                    : { x: -12, opacity: 0 }
                }
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: shouldReduceMotion ? 0 : lastWordFinishTime + 0.08,
                }}
              >
                {item.name}
              </motion.span>
            </div>

            {/* Role / Company Line: Fades in */}
            <motion.span
              className="text-[var(--muted)] text-xs sm:text-sm pl-5 mt-0.5"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
              animate={
                isRevealed || shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 4 }
              }
              transition={{
                duration: 0.35,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : lastWordFinishTime + 0.22,
              }}
            >
              {item.role}
            </motion.span>
          </figcaption>
        </motion.div>
      </motion.div>
    </article>
  );
}

// ==========================================
// 4. MAIN TESTIMONIALS SECTION
// ==========================================

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = Boolean(useReducedMotion());

  const sectionRef = useRef<HTMLElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // useScroll on right column to drive 1px lime progress track
  const { scrollYProgress } = useScroll({
    target: rightColRef,
    offset: ["start center", "end center"],
  });

  // Track which quote is closest to the viewport center
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const viewportCenter = window.innerHeight * 0.5;
          let closestIdx = 0;
          let minDistance = Infinity;

          itemRefs.current.forEach((el, idx) => {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const distance = Math.abs(itemCenter - viewportCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIdx = idx;
            }
          });

          setActiveIndex(closestIdx);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Split heading into 3 condensed lines: "The work", "travels", "well."
  const heading = siteContent.ui.testimonialsHeading;
  const headingLines =
    heading === "The work travels well."
      ? ["The work", "travels", "well."]
      : heading.split("\n");

  return (
    <section
      ref={sectionRef}
      id="quotes"
      className="testimonials-section relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Atmosphere: 4% subtle film-grain overlay */}
      <div className="testimonials-grain-overlay" aria-hidden="true" />

      {/* LEFT COLUMN: Sticky Heading + Scroll Progress */}
      <div className="section-intro testimonials-sticky-col relative z-10">
        {/* 5. ENTRANCE: Lime kicker tag fades in */}
        <motion.p
          className="kicker"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={
            isInView
              ? { opacity: 1 }
              : shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {siteContent.ui.testimonialsKicker}
        </motion.p>

        {/* 5. ENTRANCE: Heading lines slide up from behind overflow-hidden mask */}
        <h2 id="testimonials-heading" className="flex flex-col items-start m-0">
          {headingLines.map((line, idx) => (
            <span key={idx} className="overflow-hidden block leading-none">
              <motion.span
                className="block"
                initial={shouldReduceMotion ? false : { y: "100%" }}
                animate={
                  isInView
                    ? { y: 0 }
                    : shouldReduceMotion
                    ? { y: 0 }
                    : { y: "100%" }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1] as const,
                  delay: shouldReduceMotion ? 0 : 0.1 + idx * 0.1,
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>

        {/* 4. STICKY PROGRESS: 1px track + mono "01 / 03" counter */}
        <ScrollProgress
          activeIndex={activeIndex}
          total={testimonialsData.length}
          progress={scrollYProgress}
          shouldReduceMotion={shouldReduceMotion}
        />
      </div>

      {/* RIGHT COLUMN: Three Testimonial Blocks */}
      <div
        ref={rightColRef}
        className="testimonials-grid relative z-10 flex flex-col gap-10 sm:gap-14 py-4"
      >
        {testimonialsData.map((item, index) => (
          <Testimonial
            key={item.id}
            item={item}
            index={index}
            isActive={activeIndex === index}
            shouldReduceMotion={shouldReduceMotion}
            itemRef={(node) => {
              itemRefs.current[index] = node;
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default TestimonialsSection;
