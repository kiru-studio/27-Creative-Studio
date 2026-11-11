"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { FaqItem as FaqItemType, faqItems, resolveTokens } from "@/data/faq";
import { packages } from "@/data/packages";
import { siteConfig } from "@/data/siteConfig";
import { siteContent } from "@/lib/site-content";

// ==========================================
// 1. CATEGORY PILL TABS
// ==========================================

export interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="relative w-full mb-8">
      {/* Scrollable container with edge fade masks on mobile */}
      <div
        role="tablist"
        aria-label="FAQ categories"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 mask-fade-edges"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)",
        }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(cat)}
              className={`px-3.5 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap snap-start shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] ${
                isActive
                  ? "bg-[var(--industry)] !text-[var(--industry-ink)] font-black shadow-sm"
                  : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--paper)] hover:border-[var(--muted)] bg-transparent"
              }`}
              style={{
                color: isActive ? "#000000" : undefined,
                backgroundColor: isActive ? "var(--industry)" : undefined,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. FAQ ITEM (Accordion Row)
// ==========================================

export interface FaqItemProps {
  item: FaqItemType;
  resolvedAnswer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  shouldReduceMotion?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef?: (node: HTMLButtonElement | null) => void;
}

export function FaqItem({
  item,
  resolvedAnswer,
  isOpen,
  onToggle,
  index,
  shouldReduceMotion = false,
  onKeyDown,
  buttonRef,
}: FaqItemProps) {
  const headerId = `faq-header-${item.id}`;
  const panelId = `faq-panel-${item.id}`;

  return (
    <div className="faq-row-item border-b border-[var(--line)]">
      {/* Accordion Header Button */}
      <h3>
        <button
          ref={buttonRef}
          id={headerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className="w-full flex items-center justify-between gap-4 py-4 sm:py-5 text-left group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] rounded-[var(--radius-control)] min-h-[48px]"
        >
          <span className="font-display font-bold text-lg sm:text-xl text-[var(--paper)] group-hover:text-[var(--industry)] transition-colors leading-snug">
            {item.question}
          </span>

          {/* Rotating Triangle Icon */}
          <span className="shrink-0 flex items-center justify-center w-6 h-6 select-none">
            <motion.svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={isOpen ? "text-[var(--industry)]" : "text-[var(--muted)]"}
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.25, ease: "easeOut" }
              }
              aria-hidden="true"
            >
              <polygon points="6,3 18,12 6,21" />
            </motion.svg>
          </span>
        </button>
      </h3>

      {/* Accordion Panel (Height auto + opacity) */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
            }
            style={{ overflow: "hidden" }}
          >
            <div className="relative pl-5 sm:pl-7 pr-4 pb-6 pt-1">
              {/* 2px Lime Bar on left edge drawing top to bottom */}
              <motion.div
                className="absolute left-0 top-0 bottom-6 w-[2px] bg-[var(--industry)] origin-top pointer-events-none"
                initial={shouldReduceMotion ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
                }
                aria-hidden="true"
              />

              {/* Rising Answer Text (y: 8 -> 0) */}
              <motion.p
                initial={shouldReduceMotion ? false : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { y: 8, opacity: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.3, delay: 0.05, ease: "easeOut" }
                }
                className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-3xl m-0"
              >
                {resolvedAnswer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 3. MAIN FAQ SECTION COMPONENT
// ==========================================

export function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
  const shouldReduceMotion = Boolean(useReducedMotion());

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 1. Categories derived dynamically from data
  const categories = useMemo(() => {
    const unique = Array.from(new Set(faqItems.map((item) => item.category)));
    return ["All", ...unique];
  }, []);

  // 2. Pre-resolve tokens in all FAQ items for quick filtering and rendering
  const resolvedFaqList = useMemo(() => {
    return faqItems.map((item) => ({
      ...item,
      resolvedAnswer: resolveTokens(item.answer, packages, siteConfig),
    }));
  }, []);

  // 3. Filter items by active category
  const filteredItems = useMemo(() => {
    return resolvedFaqList.filter((item) => {
      return activeCategory === "All" || item.category === activeCategory;
    });
  }, [resolvedFaqList, activeCategory]);

  // 4. Pagination / Show more limit (8 items max when collapsed)
  const visibleItems = isExpanded ? filteredItems : filteredItems.slice(0, 8);
  const hasMore = filteredItems.length > 8;

  // Keyboard navigation across FAQ header buttons
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const count = visibleItems.length;
      if (count === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % count;
        buttonRefs.current[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + count) % count;
        buttonRefs.current[prevIndex]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        buttonRefs.current[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        buttonRefs.current[count - 1]?.focus();
      }
    },
    [visibleItems.length],
  );

  // SEO: Generate JSON-LD FAQPage schema dynamically from same resolved data
  const jsonLdSchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: resolvedFaqList.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.resolvedAnswer,
        },
      })),
    };
  }, [resolvedFaqList]);

  // Masked heading lines for dedicated Q&A section
  const headingLines = ["Questions,", "answered."];

  return (
    <>
      {/* Schema.org FAQPage Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <section
        ref={sectionRef}
        className="faq-section relative overflow-hidden py-16 sm:py-24"
        id="faq"
        aria-labelledby="faq-heading"
      >
        <div id="q&a" className="sr-only" />
        <div id="qa" className="sr-only" />
        {/* Atmosphere: 4% subtle film-grain overlay */}
        <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 w-full">
          {/* ------------------------------------------ */}
          {/* SECTION HEADER (Scroll entrance)           */}
          {/* ------------------------------------------ */}
          <div className="section-intro mb-10 sm:mb-14">
            {/* Tag / Kicker */}
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
              the fine print
            </motion.p>

            {/* Masked Heading Lines (y: 100% -> 0, 0.1s stagger) */}
            <h2 id="faq-heading" className="flex flex-col items-start m-0">
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
          </div>

          {/* ------------------------------------------ */}
          {/* FAQ CONTROLS: Category Tabs                */}
          {/* ------------------------------------------ */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={(cat) => {
              setActiveCategory(cat);
              setOpenId(null);
            }}
          />

          {/* ------------------------------------------ */}
          {/* FAQ ACCORDION LIST                         */}
          {/* ------------------------------------------ */}
          <div className="faq-list border-t border-[var(--line)]">
            {visibleItems.map((item, index) => (
                <FaqItem
                  key={item.id}
                  item={item}
                  resolvedAnswer={item.resolvedAnswer}
                  isOpen={openId === item.id}
                  onToggle={() =>
                    setOpenId((curr) => (curr === item.id ? null : item.id))
                  }
                  index={index}
                  shouldReduceMotion={shouldReduceMotion}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  buttonRef={(node) => {
                    buttonRefs.current[index] = node;
                  }}
                />
              ))}
          </div>

          {/* ------------------------------------------ */}
          {/* 4. SHOW MORE / SHOW LESS TOGGLE            */}
          {/* ------------------------------------------ */}
          {hasMore && (
            <div className="pt-6 pb-2 text-center">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="px-5 py-2.5 rounded-[var(--radius-control)] border border-[var(--line)] hover:border-[var(--industry)] text-xs font-mono uppercase tracking-widest text-[var(--muted)] hover:text-[var(--paper)] transition-all inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)]"
              >
                {isExpanded ? (
                  <span>Show less</span>
                ) : (
                  <span>
                    Show more <span className="text-[var(--industry)]">(+ {filteredItems.length - 8} more)</span>
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ------------------------------------------ */}
          {/* 5. BOTTOM PROMPT (no grey line above)      */}
          {/* ------------------------------------------ */}
          <div className="pt-8 pb-4">
            <p className="text-sm sm:text-base text-[var(--muted)] m-0 font-mono">
              <span className="text-[var(--paper)] font-medium">Still curious?</span> Let&rsquo;s talk about what you need.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}

export default FaqSection;
export { FaqSection as FAQSection };
