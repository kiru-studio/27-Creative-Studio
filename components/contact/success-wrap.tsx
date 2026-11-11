"use client";

import { motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

interface SuccessWrapProps {
  confirmationTimecode?: string;
  onReset: () => void;
  reducedMotion?: boolean;
}

export function SuccessWrap({
  confirmationTimecode,
  onReset,
  reducedMotion = false,
}: SuccessWrapProps) {
  const steps = [
    { title: "Brief logged", desc: "We review your goals, deliverables, and references." },
    { title: "Direct reply", desc: siteConfig.replyTime },
    { title: "Quick intro", desc: "We schedule a 15-minute call to lock in shoot dates." },
  ];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center py-8 px-4 sm:px-6 w-full max-w-xl mx-auto"
    >
      {/* Viewfinder brackets with lime check */}
      <div className="relative p-6 mb-6">
        {/* L-shaped corner brackets */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--industry)]" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--industry)]" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--industry)]" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--industry)]" />

        <div className="w-14 h-14 rounded-full bg-[var(--industry)] text-[var(--industry-ink)] flex items-center justify-center shadow-[0_0_24px_rgba(198,255,61,0.5)]">
          <Check size={28} className="stroke-[3]" aria-hidden="true" />
        </div>
      </div>

      <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[var(--paper)] font-display">
        That&apos;s a wrap.
      </h3>

      {confirmationTimecode && (
        <p className="mt-2 font-mono text-xs text-[var(--industry)] tracking-widest uppercase">
          LOCKED AT {confirmationTimecode}
        </p>
      )}

      <p className="mt-3 text-sm text-[var(--muted)] max-w-md">
        Your brief has been recorded to our master slate. We&apos;ve got everything we need to start shaping the frames.
      </p>

      {/* 3 Next Steps */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 pt-6 border-t border-[var(--line)] text-left">
        {steps.map((st, i) => (
          <div key={i} className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--panel)]/80 flex flex-col gap-1">
            <span className="font-mono text-[10px] text-[var(--industry)] uppercase tracking-wider font-bold">
              0{i + 1} // {st.title}
            </span>
            <span className="text-xs text-[var(--paper)]">{st.desc}</span>
          </div>
        ))}
      </div>

      {/* Reset button: increments TAKE and reopens clapper */}
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] font-mono text-xs text-[var(--muted)] hover:text-[var(--paper)] hover:border-[var(--industry)]/60 transition-colors cursor-pointer"
      >
        <RotateCcw size={14} aria-hidden="true" />
        <span>Send another brief</span>
      </button>
    </motion.div>
  );
}
