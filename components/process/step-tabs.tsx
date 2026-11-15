"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import type { ProcessStep } from "@/data/process";

interface StepTabsProps {
  steps: ProcessStep[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  reducedMotion?: boolean;
}

export function StepTabs({
  steps,
  activeStepIndex,
  onSelectStep,
  reducedMotion = false,
}: StepTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (activeStepIndex + 1) % steps.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (activeStepIndex - 1 + steps.length) % steps.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = steps.length - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      onSelectStep(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Process steps"
      onKeyDown={handleKeyDown}
      className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-[480px] mx-auto mt-6"
    >
      {steps.map((step, index) => {
        const isActive = activeStepIndex === index;
        const Icon = step.icon;

        return (
          <button
            key={step.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            type="button"
            id={`step-tab-${step.id}`}
            aria-controls={`step-panel-${step.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelectStep(index)}
            style={{ color: isActive ? "#0B0B0B" : undefined }}
            className={`group relative flex flex-col items-center justify-center gap-1.5 py-2.5 px-3 border text-xs font-mono tracking-wider transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F] overflow-hidden ${
              isActive
                ? "border-[#D4FF3F] !text-[#0B0B0B] font-bold"
                : "border-[#FF2DA8]/40 bg-[#0B0B0B] text-[#FF2DA8] hover:text-[#D4FF3F] hover:border-[#D4FF3F]"
            }`}
          >
            {/* Active solid chartreuse fill background */}
            {isActive && (
              <motion.div
                layoutId="active-step-tab-bg"
                className="absolute inset-0 bg-[#D4FF3F] z-0"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 350, damping: 30 }
                }
              />
            )}

            {/* Icon with hover nudge */}
            <motion.div
              className="relative z-10"
              whileHover={reducedMotion ? undefined : { y: -2 }}
              transition={{ duration: 0.15 }}
            >
              <Icon
                size={16}
                className={`transition-colors duration-200 ${
                  isActive ? "!text-[#0B0B0B]" : "text-[#FF2DA8] group-hover:text-[#D4FF3F]"
                }`}
                aria-hidden="true"
              />
            </motion.div>

            {/* Step Title */}
            <span
              className={`relative z-10 select-none uppercase font-bold text-[11px] ${isActive ? "!text-[#0B0B0B]" : ""}`}
              style={{ color: isActive ? "#0B0B0B" : undefined }}
            >
              {step.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
