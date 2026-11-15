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
        className="relative w-full aspect-[1.38/1] rounded-none border-2 border-[#FF2DA8] bg-[#0B0B0B] p-4 sm:p-5 shadow-[0_0_40px_rgba(255,45,168,0.2)]"
      >
        {/* Top Hotshoe bump */}
        <div
          className="absolute -top-3 left-[22%] -translate-x-1/2 w-16 h-3 border border-[#FF2DA8] border-b-0 bg-[#0B0B0B] flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="w-8 h-1 bg-[#D4FF3F]" />
        </div>

        {/* Top Shutter Button (glowing on shoot) */}
        <div
          className="absolute -top-4 left-[10%] w-7 h-4 border border-[#FF2DA8] border-b-0 bg-[#0B0B0B] flex flex-col items-center justify-start pt-0.5 shadow-md"
          aria-hidden="true"
        >
          <motion.div
            className={`w-5 h-1.5 transition-all duration-300 ${
              isShooting
                ? "bg-[#D4FF3F] shadow-[0_0_12px_#D4FF3F]"
                : "bg-[#FF2DA8]"
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
          className="absolute -top-2 left-[36%] w-10 h-2 border border-[#FF2DA8]/60 bg-[#0B0B0B] flex items-center justify-evenly px-1"
          aria-hidden="true"
        >
          <span className="w-0.5 h-1 bg-[#D4FF3F]" />
          <span className="w-0.5 h-1 bg-[#D4FF3F]" />
          <span className="w-0.5 h-1 bg-[#D4FF3F]" />
        </div>

        {/* Camera Top Plate Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#FF2DA8]/40">
          {/* Brand & Studio Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm tracking-wider text-[#FF2DA8]">
              27
            </span>
            <span className="font-mono text-[11px] tracking-widest text-[#D4FF3F] uppercase font-bold">
              STUDIO <span className="text-[#FF2DA8] font-normal">FX3-CINE</span>
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
            className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-[65%] border border-[#FF2DA8]/40 bg-[#0B0B0B] flex flex-col justify-around py-1.5 px-0.5 opacity-80"
            aria-hidden="true"
          >
            <div className="w-full h-0.5 bg-[#FF2DA8]" />
            <div className="w-full h-0.5 bg-[#D4FF3F]" />
            <div className="w-full h-0.5 bg-[#FF2DA8]" />
            <div className="w-full h-0.5 bg-[#D4FF3F]" />
          </div>

          {/* Circular Cinema Lens Barrel */}
          <div className="relative w-48 sm:w-56 md:w-64 aspect-square rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,45,168,0.25)] border border-[#FF2DA8]/30">
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

            {/* Rotating 35mm Cinema Lens Ring */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none select-none flex items-center justify-center overflow-visible"
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: "linear",
              }}
              aria-hidden="true"
            >
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 200 200"
              >
                <defs>
                  <path
                    id="lensRotatingCircle"
                    d="M 100, 100 m -84, 0 a 84,84 0 1,1 168,0 a 84,84 0 1,1 -168,0"
                  />
                </defs>
                <text
                  className="font-mono text-[7.5px] sm:text-[8px] tracking-[0.24em] fill-[#D4FF3F] uppercase font-bold select-none"
                >
                  <textPath href="#lensRotatingCircle" startOffset="0%">
                    SONY FX3 · 35mm T1.5 · 27 CREATIVE STUDIO · 4K DCI · 10-BIT 4:2:2 ·
                  </textPath>
                </text>
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Camera bottom status bar */}
        <div className="mt-3 pt-2 flex items-center justify-between border-t border-[#FF2DA8]/30 font-mono text-[9px] text-[#D4FF3F]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF3F] animate-pulse" />
            <span className="font-bold">4K DCI · 24.00 FPS S-LOG3</span>
          </div>
          <span className="font-bold text-[#FF2DA8]">RAW / ALL-I</span>
        </div>
      </motion.div>
    </div>
  );
}
