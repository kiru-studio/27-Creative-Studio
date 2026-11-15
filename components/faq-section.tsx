"use client";

import React, {
  useCallback,
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
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="relative w-full mb-8">
      <div
        role="tablist"
        aria-label="FAQ categories"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(cat)}
              className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap snap-start shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F] ${
                isActive
                  ? "bg-[#D4FF3F] !text-[#0B0B0B] font-bold shadow-[0_0_12px_rgba(212,255,63,0.3)]"
                  : "border border-[#FF2DA8]/40 text-[#FF2DA8] hover:text-[#D4FF3F] hover:border-[#D4FF3F] bg-[#0B0B0B]"
              }`}
              style={{
                color: isActive ? "#0B0B0B" : undefined,
                backgroundColor: isActive ? "#D4FF3F" : undefined,
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
  shouldReduceMotion = false,
  onKeyDown,
  buttonRef,
}: FaqItemProps) {
  const headerId = `faq-header-${item.id}`;
  const panelId = `faq-panel-${item.id}`;

  return (
    <div className="faq-row-item border-b border-[#FF2DA8]/30">
      <h3>
        <button
          ref={buttonRef}
          id={headerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className="w-full flex items-center justify-between gap-4 py-4 sm:py-5 text-left group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F] min-h-[48px]"
        >
          <span
            className={`font-display font-bold text-lg sm:text-xl transition-colors leading-snug uppercase tracking-tight ${
              isOpen ? "text-[#D4FF3F]" : "text-[#FF2DA8] group-hover:text-[#D4FF3F]"
            }`}
          >
            {item.question}
          </span>

          {/* Rotating Triangle Icon */}
          <span className="shrink-0 flex items-center justify-center w-6 h-6 select-none">
            <motion.svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={isOpen ? "text-[#D4FF3F]" : "text-[#FF2DA8]"}
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

      {/* Accordion Panel */}
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
              {/* 2px Chartreuse Bar on left edge */}
              <motion.div
                className="absolute left-0 top-0 bottom-6 w-[2px] bg-[#D4FF3F] origin-top pointer-events-none shadow-[0_0_8px_#D4FF3F]"
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

              {/* Answer Text */}
              <motion.p
                initial={shouldReduceMotion ? false : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { y: 8, opacity: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.3, delay: 0.05, ease: "easeOut" }
                }
                className="text-sm sm:text-base text-[#D4FF3F] leading-relaxed max-w-3xl m-0 font-mono"
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
  const shouldReduceMotion = useHydratedReducedMotion();

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  const resolvedFaqList = useMemo(() => {
    return rawFaqItems.map((item) => ({
      ...item,
      resolvedAnswer: resolveTokens(item.answer, packages, siteConfig),
    }));
  }, [rawFaqItems]);

  const filteredItems = useMemo(() => {
    return resolvedFaqList.filter((item) => {
      return activeCategory === "All" || item.category === activeCategory;
    });
  }, [resolvedFaqList, activeCategory]);

  const visibleItems = isExpanded ? filteredItems : filteredItems.slice(0, 8);
  const hasMore = filteredItems.length > 8;

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <section
        ref={sectionRef}
        className="faq-section relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0B0B0B] text-[#FF2DA8] border-b border-[#FF2DA8]/20"
        id="faq"
        aria-labelledby="faq-heading"
      >
        <div id="questions" className="sr-only" />
        <div id="q&a" className="sr-only" />
        <div id="qa" className="sr-only" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="section-intro mb-10 sm:mb-14">
            <motion.p
              className="font-mono text-xs uppercase tracking-widest text-[#D4FF3F] font-bold block mb-2"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              // {siteContent.ui.packagesKicker ? "THE FINE PRINT" : "FREQUENTLY ASKED QUESTIONS"}
            </motion.p>

            <h2 id="faq-heading" className="flex flex-col items-start m-0 font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#FF2DA8]">
              <span className="overflow-hidden block leading-none">
                <motion.span
                  className="block"
                  initial={shouldReduceMotion ? false : { y: "100%" }}
                  animate={isInView ? { y: 0 } : { y: "100%" }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1] as const,
                    delay: shouldReduceMotion ? 0 : 0.1,
                  }}
                >
                  QUESTIONS,
                </motion.span>
              </span>
              <span className="overflow-hidden block leading-none">
                <motion.span
                  className="block text-[#D4FF3F]"
                  initial={shouldReduceMotion ? false : { y: "100%" }}
                  animate={isInView ? { y: 0 } : { y: "100%" }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1] as const,
                    delay: shouldReduceMotion ? 0 : 0.2,
                  }}
                >
                  ANSWERED.
                </motion.span>
              </span>
            </h2>
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={(cat) => {
              setActiveCategory(cat);
              setOpenId(null);
            }}
          />

          {/* FAQ Accordion List */}
          <div className="faq-list border-t border-[#FF2DA8]/30">
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

          {/* Show more toggle */}
          {hasMore && (
            <div className="pt-6 pb-2 text-center">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="px-6 py-3 border border-[#FF2DA8] bg-[#0B0B0B] hover:border-[#D4FF3F] text-xs font-mono uppercase tracking-widest text-[#FF2DA8] hover:text-[#D4FF3F] transition-all inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F] cursor-pointer"
              >
                {isExpanded ? (
                  <span>[ SHOW LESS ▲ ]</span>
                ) : (
                  <span>
                    [ SHOW MORE (+{filteredItems.length - 8} MORE) ▼ ]
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Bottom Prompt */}
          <div className="pt-8 pb-4 border-t border-[#FF2DA8]/20 mt-8">
            <p className="text-sm sm:text-base text-[#D4FF3F] m-0 font-mono">
              <span className="text-[#FF2DA8] font-bold">// STILL CURIOUS?</span> Let&rsquo;s talk about what you need.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default FaqSection;
export { FaqSection as FAQSection };
