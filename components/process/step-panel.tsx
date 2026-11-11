"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ProcessStep, TurnaroundFormatId } from "@/data/process";

interface StepPanelProps {
  currentStep: ProcessStep;
  nextStep?: ProcessStep;
  activeStepIndex: number;
  totalSteps: number;
  activeFormatId?: TurnaroundFormatId;
  onNextStep: () => void;
  reducedMotion?: boolean;
}

export function StepPanel({
  currentStep,
  nextStep,
  activeStepIndex,
  totalSteps,
  activeFormatId = "reels",
  onNextStep,
  reducedMotion = false,
}: StepPanelProps) {
  const currentDay = currentStep.days[activeFormatId];
  const isLastStep = activeStepIndex === totalSteps - 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  return (
    <div
      role="tabpanel"
      id={`step-panel-${currentStep.id}`}
      aria-labelledby={`step-tab-${currentStep.id}`}
      className="relative flex items-stretch gap-4 sm:gap-6 w-full"
    >
      {/* Left Lime Vertical Progress Bar */}
      <div
        className="relative w-1 sm:w-1.5 shrink-0 rounded-full bg-[var(--line)] overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          className="w-full bg-[var(--industry)] rounded-full origin-top"
          animate={{
            scaleY: (activeStepIndex + 1) / totalSteps,
          }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 22,
          }}
          style={{ height: "100%" }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 py-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentStep.id}-${activeFormatId}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col gap-4"
          >
            {/* Meta Eyebrow with rolling Day indicator */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold tracking-widest text-[var(--industry)] uppercase px-2 py-0.5 rounded bg-[var(--industry)]/10 border border-[var(--industry)]/30">
                {currentDay}
              </span>
              <span className="font-mono text-xs text-[var(--muted)] tracking-wider uppercase">
                Step {currentStep.stepNumber} of 0{totalSteps}
              </span>
            </motion.div>

            {/* Title & Tagline */}
            <motion.div variants={itemVariants}>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[var(--paper)] font-display">
                {currentStep.title}
              </h3>
              <p className="mt-1 font-mono text-sm sm:text-base text-[var(--industry)] font-medium">
                {currentStep.tagline}
              </p>
            </motion.div>

            {/* Step Description */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-xl"
            >
              {currentStep.description}
            </motion.p>

            {/* Happens & Needs Bullet Lists */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-[var(--line)]"
            >
              {/* What happens */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] font-bold tracking-widest text-[var(--muted)] uppercase">
                  What happens
                </span>
                <ul className="flex flex-col gap-1.5 text-xs text-[var(--paper)]">
                  {currentStep.happens.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--industry)] font-bold select-none" aria-hidden="true">
                        /
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What we need */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] font-bold tracking-widest text-[var(--muted)] uppercase">
                  What we need
                </span>
                <ul className="flex flex-col gap-1.5 text-xs text-[var(--paper)]">
                  {currentStep.needs.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--industry)] font-bold select-none" aria-hidden="true">
                        /
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Next Action Button */}
            <motion.div variants={itemVariants} className="pt-3">
              {isLastStep ? (
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg !bg-[var(--industry)] !text-[var(--industry-ink)] font-mono text-xs font-bold uppercase tracking-wider hover:!bg-[var(--industry-hover)] transition-all duration-200 shadow-[0_0_16px_rgba(198,255,61,0.25)] hover:shadow-[0_0_24px_rgba(198,255,61,0.4)]"
                  style={{ backgroundColor: "var(--industry)", color: "var(--industry-ink)" }}
                >
                  <span style={{ color: "var(--industry-ink)" }}>Book a shoot</span>
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ stroke: "var(--industry-ink)" }}
                    aria-hidden="true"
                  />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onNextStep}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--paper)] font-mono text-xs font-bold uppercase tracking-wider hover:border-[var(--industry)] hover:text-[var(--industry)] transition-all duration-200 cursor-pointer"
                >
                  <span>{nextStep?.title ?? "Next"}</span>
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[var(--industry)]"
                    aria-hidden="true"
                  />
                </button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
