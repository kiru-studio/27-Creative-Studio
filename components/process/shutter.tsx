"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LensConfig } from "@/data/process";

interface ShutterProps {
  stepIndex: number;
  lensConfig: LensConfig;
  reducedMotion?: boolean;
}

export function Shutter({ stepIndex, reducedMotion }: ShutterProps) {
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [flareKey, setFlareKey] = useState(0);
  const isFirstRender = useRef(true);
  const prevStepRef = useRef(stepIndex);

  // Trigger flash overlay only on intentional transition into step 1 (Shoot)
  useEffect(() => {
    // Avoid triggering flash on initial page load / mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevStepRef.current = stepIndex;
      setTriggerFlash(false);
      return;
    }

    const becameShooting = prevStepRef.current !== 1 && stepIndex === 1;
    prevStepRef.current = stepIndex;

    setFlareKey((prev) => prev + 1);

    if (becameShooting && !reducedMotion) {
      setTriggerFlash(true);
      const timer = setTimeout(() => {
        setTriggerFlash(false);
      }, 240);
      return () => {
        clearTimeout(timer);
        setTriggerFlash(false);
      };
    } else {
      setTriggerFlash(false);
    }
  }, [stepIndex, reducedMotion]);

  const getBladeScale = () => {
    switch (stepIndex) {
      case 0:
        return 0.52;
      case 1:
        return 0.68;
      case 2:
        return 0.86;
      case 3:
        return 0.48;
      default:
        return 0.6;
    }
  };

  const bladeScale = getBladeScale();

  return (
    <div className="absolute inset-[26%] rounded-full overflow-hidden border border-[#FF2DA8]/50 bg-[#0B0B0B] shadow-[inset_0_0_20px_rgba(255,45,168,0.4)]">
      {/* 6 Overlapping Iris Shutter Blades */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          rotate: reducedMotion ? 0 : stepIndex * 45,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-[58%] h-[58%]"
            style={{
              transformOrigin: "0 0",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 82% 94%, 64% 74%, 44% 53%, 23% 31%, 0 17%)",
              background: "#0B0B0B",
              border: i % 2 === 0 ? "1px solid rgba(255,45,168,0.3)" : "1px solid rgba(212,255,63,0.3)",
              boxShadow: "inset 0 0 6px rgba(0,0,0,0.9)",
            }}
            animate={{
              rotate: i * 60,
              scale: reducedMotion
                ? bladeScale
                : triggerFlash
                ? bladeScale * 1.08
                : bladeScale,
            }}
            transition={{
              rotate: {
                type: "spring",
                stiffness: 120,
                damping: 20,
              },
              scale: triggerFlash
                ? {
                    type: "tween",
                    duration: 0.24,
                    ease: "easeInOut",
                  }
                : {
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                  },
            }}
          />
        ))}
      </motion.div>

      {/* Edit Mode: Anamorphic horizontal timeline playhead */}
      {stepIndex === 2 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Letterbox guide bars */}
          <div className="absolute top-0 left-0 right-0 h-[22%] bg-[#0B0B0B] border-b border-[#FF2DA8]/40" />
          <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-[#0B0B0B] border-t border-[#FF2DA8]/40" />
          
          {/* Sweeping chartreuse playhead line */}
          {!reducedMotion && (
            <motion.div
              className="absolute top-[22%] bottom-[22%] w-[2px] bg-[#D4FF3F] shadow-[0_0_10px_#D4FF3F]"
              animate={{ left: ["5%", "95%", "5%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      )}

      {/* Diagonal Lens Flare Sweep across glass */}
      {!reducedMotion && (
        <motion.div
          key={flareKey}
          className="absolute inset-[-50%] pointer-events-none z-10"
          initial={{ x: "-60%", y: "-60%", opacity: 0 }}
          animate={{ x: "60%", y: "60%", opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            background:
              "linear-gradient(135deg, transparent 35%, rgba(212,255,63,0.3) 48%, rgba(255,45,168,0.5) 50%, rgba(212,255,63,0.3) 53%, transparent 65%)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Shutter Click Flash Overlay on Step 1 (Shoot) - High-voltage Chartreuse Flash */}
      <AnimatePresence>
        {triggerFlash && (
          <motion.div
            key="shutter-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 bg-[#D4FF3F] z-20 pointer-events-none rounded-full"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Center Optical Hub */}
      <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
        <AnimatePresence mode="wait">
          {stepIndex === 0 && (
            <motion.div
              key="brief"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0B0B] border border-[#D4FF3F] shadow-[0_0_12px_rgba(212,255,63,0.3)]"
            >
              <motion.span
                animate={reducedMotion ? undefined : { opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-[#D4FF3F] shadow-[0_0_6px_#D4FF3F]"
              />
              <span className="font-mono text-[10px] tracking-widest font-bold text-[#D4FF3F] uppercase">
                REC
              </span>
            </motion.div>
          )}

          {stepIndex === 1 && (
            <motion.div
              key="shoot"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0B0B] border border-[#FF2DA8] shadow-[0_0_15px_rgba(255,45,168,0.5)]"
            >
              <motion.span
                animate={reducedMotion ? undefined : { opacity: [1, 0, 1] }}
                transition={{ duration: 0.35, repeat: Infinity, ease: "linear", times: [0, 0.5, 1] }}
                className="w-1.5 h-1.5 rounded-full bg-[#FF2DA8] shadow-[0_0_8px_#FF2DA8]"
              />
              <span className="font-mono text-[10px] tracking-widest font-bold text-[#FF2DA8] uppercase">
                ON AIR
              </span>
            </motion.div>
          )}

          {stepIndex === 2 && (
            <motion.div
              key="edit"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0B0B] border border-[#D4FF3F] shadow-[0_0_12px_rgba(212,255,63,0.3)]"
            >
              <span className="font-mono text-[10px] tracking-widest font-bold text-[#D4FF3F] uppercase">
                CUT / 4K
              </span>
            </motion.div>
          )}

          {stepIndex === 3 && (
            <motion.div
              key="delivered"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center w-7 h-7 bg-[#D4FF3F] text-[#0B0B0B] shadow-[0_0_16px_rgba(212,255,63,0.6)]"
            >
              {!reducedMotion && (
                <motion.div
                  animate={{ scale: [1, 2.3], opacity: [0.85, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 border-2 border-[#D4FF3F] pointer-events-none"
                />
              )}
              <svg
                className="w-4 h-4 stroke-[3] stroke-[#0B0B0B] fill-none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
