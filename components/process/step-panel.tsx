"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NeonPlay } from "@/components/ui/neon-icons";
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
      className="relative flex items-stretch gap-4 sm:gap-6 w-full border-3 border-[#FF2DA8] bg-[#0B0B0B] p-6 sm:p-8 shadow-[6px_6px_0px_#D4FF3F]"
    >
      {/* Left Vertical Progress Bar */}
      <div
        className="relative w-2 shrink-0 bg-[#0B0B0B] border-2 border-[#FF2DA8] overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          className="w-full bg-[#D4FF3F] origin-top"
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
              <span className="font-mono text-xs font-bold tracking-widest text-[#0B0B0B] uppercase px-2.5 py-1 bg-[#D4FF3F]">
                {currentDay}
              </span>
              <span className="font-mono text-xs text-[#FF2DA8] tracking-widest uppercase font-bold">
                PHASE 0{currentStep.stepNumber} // 0{totalSteps}
              </span>
            </motion.div>

            {/* Title & Tagline */}
            <motion.div variants={itemVariants}>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#FF2DA8] font-display">
                {currentStep.title}
              </h3>
              <p className="mt-1 font-mono text-sm sm:text-base text-[#D4FF3F] font-bold tracking-wide">
                // {currentStep.tagline}
              </p>
            </motion.div>

            {/* Step Description */}
            {currentStep.description && currentStep.description !== currentStep.tagline && (
              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-base text-[#D4FF3F]/90 leading-relaxed max-w-xl font-mono"
              >
                {currentStep.description}
              </motion.p>
            )}

            {/* Happens & Needs Bullet Lists */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-[#FF2DA8]/30"
            >
              {/* What happens */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] font-bold tracking-widest text-[#FF2DA8] uppercase">
                  [ PROTOCOL EXECUTION ]
                </span>
                <ul className="flex flex-col gap-1.5 text-xs text-[#D4FF3F] font-mono">
                  {currentStep.happens.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <NeonPlay className="size-2 text-[#FF2DA8] mt-1 shrink-0 select-none" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What we need */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] font-bold tracking-widest text-[#D4FF3F] uppercase">
                  [ CLIENT DELIVERABLES ]
                </span>
                <ul className="flex flex-col gap-1.5 text-xs text-[#FF2DA8] font-mono">
                  {currentStep.needs.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <NeonPlay className="size-2 text-[#D4FF3F] mt-1 shrink-0 select-none" />
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
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[#D4FF3F] text-[#0B0B0B] font-mono text-xs font-black uppercase tracking-widest border-2 border-[#0B0B0B] shadow-[5px_5px_0px_#FF2DA8] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#FF2DA8] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150 cursor-pointer"
                >
                  <span>BOOK SONY FX3 PRODUCTION</span>
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onNextStep}
                  className="group inline-flex items-center gap-2 px-6 py-3 border-2 border-[#FF2DA8] bg-[#0B0B0B] text-[#D4FF3F] font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#D4FF3F] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#D4FF3F] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150 cursor-pointer"
                >
                  <span>NEXT: {nextStep?.title ?? "ADVANCE"}</span>
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#FF2DA8]"
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
