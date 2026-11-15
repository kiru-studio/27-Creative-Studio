"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ContactForm } from "./contact-form";
import { type ContactFormValues } from "@/data/contact";

interface MobileBriefSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onFormValuesChange?: (values: Partial<ContactFormValues>) => void;
  onSubmitSuccess: (frozenTimecode?: string) => void;
  currentTimecode?: string;
  reducedMotion?: boolean;
}

export function MobileBriefSheet({
  isOpen,
  onClose,
  onFormValuesChange,
  onSubmitSuccess,
  currentTimecode,
  reducedMotion = false,
}: MobileBriefSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-title"
          className="lg:hidden fixed inset-0 z-[2000] flex flex-col justify-end"
        >
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Slide-Up Cinema Slate Sheet */}
          <motion.div
            ref={sheetRef}
            initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 300,
            }}
            className="relative z-10 w-full max-h-[90vh] flex flex-col rounded-t-2xl border-t border-x border-[#2A2A30] bg-[#141419] shadow-[0_-20px_60px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Viewfinder corner brackets at top */}
            <div
              className="absolute inset-0 pointer-events-none select-none z-20"
              aria-hidden="true"
            >
              <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-[#C6FF3D]" />
              <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-[#C6FF3D]" />
            </div>

            {/* Drag Handle Bar */}
            <div className="pt-2.5 pb-1 flex justify-center items-center">
              <span className="w-10 h-1 rounded-full bg-[#2A2A30]" />
            </div>

            {/* Sheet Slate Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A2A30] bg-[#0E0E14]/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-pulse" />
                <h3
                  id="sheet-title"
                  className="font-mono text-xs font-bold tracking-widest text-[#F4F1EA] uppercase"
                >
                  PRODUCTION BRIEF // 27·STUDIO
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close brief sheet"
                className="flex items-center gap-1 py-1 px-2 rounded font-mono text-xs font-bold text-[#A9A7A0] hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <span>CLOSE</span>
                <X size={14} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto px-5 py-5 pb-10 overscroll-contain">
              <div className="mb-4">
                <p className="font-mono text-[11px] text-[#A9A7A0] uppercase tracking-wider">
                  Tell us about your brand · We reply within 24 hours
                </p>
              </div>

              <ContactForm
                onFormValuesChange={onFormValuesChange}
                onSubmitSuccess={(tc) => {
                  onClose();
                  onSubmitSuccess(tc);
                }}
                currentTimecode={currentTimecode}
                reducedMotion={reducedMotion}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
