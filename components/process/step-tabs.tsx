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
            style={{ color: isActive ? "#0B0B0F" : undefined }}
            className={`group relative flex flex-col items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border text-xs font-mono tracking-wider transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF3D] overflow-hidden ${
              isActive
                ? "border-[#C6FF3D] !text-[#0B0B0F] font-bold"
                : "border-[#2A2A30] bg-[#141419]/90 text-[#A9A7A0] hover:text-[#F4F1EA] hover:border-[#C6FF3D]/50"
            }`}
          >
            {/* Active solid lime fill background */}
            {isActive && (
              <motion.div
                layoutId="active-step-tab-bg"
                className="absolute inset-0 bg-[#C6FF3D] z-0"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 350, damping: 30 }
                }
              />
            )}

            {/* Hover wipe highlight for inactive */}
            {!isActive && (
              <div className="absolute inset-0 bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
                  isActive ? "!text-[#0B0B0F]" : "text-[#A9A7A0] group-hover:text-[#C6FF3D]"
                }`}
                aria-hidden="true"
              />
            </motion.div>

            {/* Step Title */}
            <span
              className={`relative z-10 select-none ${isActive ? "!text-[#0B0B0F] font-bold" : ""}`}
              style={{ color: isActive ? "#0B0B0F" : undefined }}
            >
              {step.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
