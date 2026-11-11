"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { processSteps } from "@/data/process";
import { CameraSvg } from "./camera-svg";
import { StepTabs } from "./step-tabs";
import { StepPanel } from "./step-panel";

interface ProcessSectionProps {
  kicker?: string;
  heading?: string;
}

export function ProcessSection({
  kicker = "the process",
  heading = "Speed without the scramble.",
}: ProcessSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReduced = useReducedMotion();
  const shouldReduceMotion = prefersReduced || false;

  // Track responsive screen size for unpinned mobile mode
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const totalSteps = processSteps.length;
  const currentStep = processSteps[activeStepIndex] ?? processSteps[0];
  const nextStep =
    activeStepIndex < totalSteps - 1
      ? processSteps[activeStepIndex + 1]
      : undefined;

  // Track scroll progress through the container for desktop pinned mode
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to active step on desktop
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (isMobile || shouldReduceMotion) return;
    const stepProgress = Math.min(
      totalSteps - 1,
      Math.max(0, Math.floor(progress * totalSteps))
    );
    if (stepProgress !== activeStepIndex) {
      setActiveStepIndex(stepProgress);
    }
  });

  // Smooth scroll container to target step when tab/button is clicked
  const scrollToStep = (index: number) => {
    setActiveStepIndex(index);
    if (isMobile || shouldReduceMotion || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const containerTop = window.scrollY + rect.top;
    const scrollableDistance = container.offsetHeight - window.innerHeight;
    
    const targetScroll =
      containerTop + (index / (totalSteps - 1)) * scrollableDistance;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const handleNextStep = () => {
    if (activeStepIndex < totalSteps - 1) {
      scrollToStep(activeStepIndex + 1);
    }
  };

  const containerStyle =
    !isMobile && !shouldReduceMotion
      ? { minHeight: `${totalSteps * 100}vh` }
      : { minHeight: "auto" };

  return (
    <section
      ref={containerRef}
      id="process"
      aria-labelledby="speed-heading"
      style={containerStyle}
      className="relative w-full bg-[var(--ink)] text-[var(--paper)]"
    >
      {/* Sticky Inner Wrapper for Desktop Storytelling */}
      <div
        className={`w-full flex flex-col justify-between py-10 sm:py-14 md:py-16 ${
          !isMobile && !shouldReduceMotion
            ? "sticky top-0 h-screen overflow-hidden"
            : "relative min-h-screen py-16"
        }`}
      >
        {/* Top Content: Eyebrow, Heading, and HUD status */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--line)]">
            <div>
              <p className="font-mono text-xs text-[var(--industry)] uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--industry)]" />
                {kicker}
              </p>
              <h2
                id="speed-heading"
                className="mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[var(--paper)] font-display"
              >
                {heading}
              </h2>
            </div>

            {/* HUD scene timecode indicator */}
            <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted)]">
              <span className="tracking-widest text-[11px] text-[var(--muted)]/60">
                SCENE 0{activeStepIndex + 1} // 0{totalSteps}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Column (~55%) Camera & Tabs, Right Column (~40%) Step Panel */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Camera Illustration & Step Tabs */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <CameraSvg
                currentStep={currentStep}
                stepIndex={activeStepIndex}
                totalSteps={totalSteps}
                onStepChange={scrollToStep}
                reducedMotion={shouldReduceMotion}
              />

              <StepTabs
                steps={processSteps}
                activeStepIndex={activeStepIndex}
                onSelectStep={scrollToStep}
                reducedMotion={shouldReduceMotion}
              />
            </div>

            {/* Right Column: Step Panel */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <StepPanel
                currentStep={currentStep}
                nextStep={nextStep}
                activeStepIndex={activeStepIndex}
                totalSteps={totalSteps}
                onNextStep={handleNextStep}
                reducedMotion={shouldReduceMotion}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
