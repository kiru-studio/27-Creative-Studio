"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ProcessStep } from "@/data/process";
import { CameraReadout } from "./camera-readout";
import { FocusRing } from "./focus-ring";
import { Shutter } from "./shutter";

interface CameraSvgProps {
  currentStep: ProcessStep;
  stepIndex: number;
  totalSteps: number;
  onStepChange?: (index: number) => void;
  reducedMotion?: boolean;
}

export function CameraSvg({
  currentStep,
  stepIndex,
  totalSteps,
  onStepChange,
  reducedMotion = false,
}: CameraSvgProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 140, damping: 22 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const isShooting = stepIndex === 1;

  // Swipe gesture for mobile
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number } }
  ) => {
    if (!onStepChange) return;
    if (info.offset.x < -45 && stepIndex < totalSteps - 1) {
      onStepChange(stepIndex + 1);
    } else if (info.offset.x > 45 && stepIndex > 0) {
      onStepChange(stepIndex - 1);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[480px] mx-auto select-none"
      style={{ perspective: "1000px" }}
      aria-label={`Interactive cinema camera illustration, active mode: ${currentStep.title}`}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full aspect-[1.38/1] rounded-2xl border-2 border-[#2A2A30] bg-[#141419] p-4 sm:p-5 shadow-[0_24px_48px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        {/* Top Hotshoe bump */}
        <div
          className="absolute -top-3 left-[22%] -translate-x-1/2 w-16 h-3 rounded-t-sm border border-[#2A2A30] border-b-0 bg-[#1B1B21] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="w-8 h-1 bg-[#0B0B0F] rounded-xs" />
        </div>

        {/* Top Shutter Button (glowing on shoot) */}
        <div
          className="absolute -top-4 left-[10%] w-7 h-4 rounded-t-md border border-[#2A2A30] border-b-0 bg-[#22222A] flex flex-col items-center justify-start pt-0.5 shadow-md"
          aria-hidden="true"
        >
          <motion.div
            className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
              isShooting
                ? "bg-[#C6FF3D] shadow-[0_0_10px_#C6FF3D]"
                : "bg-[#3A3A41]"
            }`}
            animate={
              isShooting && !reducedMotion
                ? { scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }
                : undefined
            }
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>

        {/* Top Dial */}
        <div
          className="absolute -top-2 left-[36%] w-10 h-2 rounded-t-xs border border-[#2A2A30] bg-[#1E1E26] flex items-center justify-evenly px-1"
          aria-hidden="true"
        >
          <span className="w-0.5 h-1 bg-[#A9A7A0]/40" />
          <span className="w-0.5 h-1 bg-[#A9A7A0]/40" />
          <span className="w-0.5 h-1 bg-[#A9A7A0]/40" />
        </div>

        {/* Camera Top Plate Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2A30]">
          {/* Brand & REC Mode indicator */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C6FF3D] shadow-[0_0_6px_#C6FF3D]" />
            <span className="font-mono text-[11px] tracking-widest text-[#F4F1EA] uppercase font-bold">
              27·STUDIO <span className="text-[#A9A7A0] font-normal">C-400</span>
            </span>
          </div>

          {/* Top-Right Rolling Camera Readout */}
          <div className="flex items-center">
            <CameraReadout
              lensConfig={currentStep.lensConfig}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        {/* Camera Main Body & Lens Area */}
        <div className="relative mt-3 flex items-center justify-center">
          {/* Left Grip Texture */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-[65%] rounded-md border border-[#2A2A30] bg-[#1B1B21] flex flex-col justify-around py-1.5 px-0.5 opacity-80"
            aria-hidden="true"
          >
            <div className="w-full h-0.5 bg-[#0B0B0F]" />
            <div className="w-full h-0.5 bg-[#0B0B0F]" />
            <div className="w-full h-0.5 bg-[#0B0B0F]" />
            <div className="w-full h-0.5 bg-[#0B0B0F]" />
          </div>

          {/* Circular Cinema Lens Barrel */}
          <div className="relative w-48 sm:w-56 md:w-64 aspect-square rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
            {/* Concentric Focus Ring with tick marks */}
            <FocusRing
              stepIndex={stepIndex}
              reducedMotion={reducedMotion}
            />

            {/* Shutter Blades & Iris Center */}
            <Shutter
              stepIndex={stepIndex}
              lensConfig={currentStep.lensConfig}
              reducedMotion={reducedMotion}
            />

            {/* Outer Lens Markings */}
            <div
              className="absolute bottom-2 font-mono text-[8px] sm:text-[9px] tracking-wider text-[#A9A7A0]/50 select-none pointer-events-none"
              aria-hidden="true"
            >
              35mm T1.5 · CINE
            </div>
          </div>
        </div>

        {/* Camera bottom status bar */}
        <div className="mt-3 pt-2 flex items-center justify-between border-t border-[#2A2A30]/60 font-mono text-[9px] text-[#A9A7A0]/60">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D]/70" />
            <span>4K DCI · 24.00 FPS</span>
          </div>
          <span>LOG·RAW</span>
        </div>
      </motion.div>
    </div>
  );
}
