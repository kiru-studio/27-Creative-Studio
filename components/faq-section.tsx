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
} from "framer-motion";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
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
  shouldReduceMotion?: boolean;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
  shouldReduceMotion = false,
}: CategoryTabsProps) {
  return (
    <div className="relative w-full mb-8">
      {/* Scrollable container with theme-styled scrollbar */}
      <div
        role="tablist"
        aria-label="FAQ categories"
        className="flex items-center gap-2 overflow-x-auto faq-tags-scroll scroll-smooth snap-x snap-mandatory py-2 pb-3 px-1"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(cat)}
              className="relative px-3.5 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-colors whitespace-nowrap snap-start shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)] select-none border border-transparent cursor-pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="active-faq-category"
                  className="absolute inset-0 rounded-full bg-[var(--industry)] shadow-sm"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 400, damping: 32 }
                  }
                />
              )}
              {!isActive && (
                <span className="absolute inset-0 rounded-full border border-[var(--line)] hover:border-[var(--muted)] pointer-events-none transition-colors" />
              )}
              <span
                className={`relative z-10 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${
                  isActive
                    ? "!text-black font-black"
                    : "text-[var(--muted)] hover:text-[var(--paper)]"
                }`}
              >
                {cat}
              </span>
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
  isCollapsedByPagination?: boolean;
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
  isCollapsedByPagination = false,
  onToggle,
  index,
  shouldReduceMotion = false,
  onKeyDown,
  buttonRef,
}: FaqItemProps) {
  const headerId = `faq-header-${item.id}`;
  const panelId = `faq-panel-${item.id}`;

  return (
    <div
      className={`faq-row-item ${isCollapsedByPagination ? "border-b-0 overflow-hidden" : "border-b border-[var(--line)]"}`}
      style={
        isCollapsedByPagination
          ? { height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }
          : undefined
      }
      aria-hidden={isCollapsedByPagination || undefined}
    >
      {/* Accordion Header Button */}
      <h3>
        <button
          ref={buttonRef}
          id={headerId}
          type="button"
          tabIndex={isCollapsedByPagination ? -1 : undefined}
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

      {/* Accordion Panel kept mounted in SSR DOM so all FAQPage answers are indexable */}
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={!isOpen}
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
        }
        style={{ overflow: "hidden", pointerEvents: isOpen ? "auto" : "none" }}
      >
        <div className="relative pl-5 sm:pl-7 pr-4 pb-6 pt-1">
          {/* 2px Lime Bar on left edge drawing top to bottom */}
          <motion.div
            className="absolute left-0 top-0 bottom-6 w-[2px] bg-[var(--industry)] origin-top pointer-events-none"
            initial={false}
            animate={{ scaleY: isOpen ? 1 : 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
            }
            aria-hidden="true"
          />

          {/* Answer Text */}
          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-3xl m-0">
            {resolvedAnswer}
          </p>
        </div>
      </motion.div>
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
  const shouldReduceMotion = useHydratedReducedMotion();

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Active raw FAQ list from siteContent with fallback to defaults
  const rawFaqItems = useMemo(() => {
    if (siteContent.faqs && siteContent.faqs.length > 0) {
      return siteContent.faqs.map((f, i) => ({
        id: (f as any).id || `faq-${i}`,
        category: (f as any).category || "Packages",
        question: f.question,
        answer: f.answer,
      }));
    }
    return faqItems;
  }, []);

  // 1. Categories derived dynamically from data with clean logical ordering
  const categories = useMemo(() => {
    const preferredOrder = [
      "All",
      "Packages",
      "Process",
      "Pricing",
      "Shoot day",
      "Delivery",
      "Rights",
      "Posting",
      "Working together",
    ];
    const unique = Array.from(new Set(rawFaqItems.map((item) => item.category)));
    const sorted = [
      ...preferredOrder.filter((cat) => cat === "All" || unique.includes(cat)),
      ...unique.filter((cat) => !preferredOrder.includes(cat)),
    ];
    return sorted;
  }, [rawFaqItems]);

  // 2. Pre-resolve tokens in all FAQ items for quick filtering and rendering
  const resolvedFaqList = useMemo(() => {
    return rawFaqItems.map((item) => ({
      ...item,
      resolvedAnswer: resolveTokens(item.answer, packages, siteConfig),
    }));
  }, [rawFaqItems]);

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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSchema).replace(/</g, "\\u003c"),
        }}
      />

      <section
        ref={sectionRef}
        className="faq-section !justify-start relative overflow-hidden py-16 sm:py-24"
        id="faq"
        aria-labelledby="faq-heading"
      >
        <div id="questions" className="sr-only" />
        <div id="q&a" className="sr-only" />
        <div id="qa" className="sr-only" />
        {/* Atmosphere: 4% subtle film-grain overlay */}
        <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 w-full">
          {/* ------------------------------------------ */}
          {/* SECTION HEADER                             */}
          {/* ------------------------------------------ */}
          <div className="section-intro mb-10 sm:mb-14">
            {/* Tag / Kicker */}
            <motion.p
              className="kicker"
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {siteContent.ui?.faqKicker || "The Fine Print"}
            </motion.p>

            {/* Masked Heading Lines */}
            <h2 id="faq-heading" className="flex flex-col items-start m-0">
              {headingLines.map((line, idx) => (
                <span key={idx} className="overflow-hidden block leading-none">
                  <motion.span
                    className="block"
                    initial={false}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1] as const,
                    }}
                  >
                    {line}{idx < headingLines.length - 1 ? " " : ""}
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
            shouldReduceMotion={shouldReduceMotion}
          />

          {/* ------------------------------------------ */}
          {/* FAQ ACCORDION LIST                         */}
          {/* ------------------------------------------ */}
          <div className="faq-list border-t border-[var(--line)] min-h-[580px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeCategory}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full flex flex-col"
              >
                {filteredItems.map((item, index) => (
                  <FaqItem
                    key={item.id}
                    item={item}
                    resolvedAnswer={item.resolvedAnswer}
                    isOpen={openId === item.id}
                    isCollapsedByPagination={!isExpanded && index >= 8}
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
              </motion.div>
            </AnimatePresence>
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
