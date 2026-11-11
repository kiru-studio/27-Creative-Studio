"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FieldWithBracketsProps {
  id: string;
  label: string;
  slateTag?: string;
  error?: string;
  charCount?: number;
  maxChars?: number;
  reducedMotion?: boolean;
  className?: string;
  children: (props: {
    onFocus: () => void;
    onBlur: () => void;
    isFocused: boolean;
    hasError: boolean;
  }) => React.ReactNode;
}

export function FieldWithBrackets({
  id,
  label,
  slateTag,
  error,
  charCount,
  maxChars,
  reducedMotion = false,
  className = "",
  children,
}: FieldWithBracketsProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className={`relative flex flex-col gap-1.5 ${className}`}
      animate={
        error && !reducedMotion
          ? { x: [-3, 3, -2, 2, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.3 }}
    >
      {/* Label and Character Count */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs text-[var(--paper)] font-medium flex items-center gap-1.5">
          {slateTag && (
            <span
              className={`font-mono transition-colors duration-200 ${
                isFocused ? "text-[var(--industry)] font-bold" : "text-[var(--industry)]/70"
              }`}
            >
              {slateTag}
            </span>
          )}
          <span>{label}</span>
        </label>

        {maxChars !== undefined && (
          <span className="font-mono text-[10px] text-[var(--muted)] tracking-wider">
            {charCount ?? 0}/{maxChars}
          </span>
        )}
      </div>

      {/* Input container with dynamic brackets and underline wipe */}
      <div className="relative group">
        {/* Four L-shaped Lime Corner Brackets */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-none z-10"
              aria-hidden="true"
            >
              {/* Top-Left */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--industry)]" />
              {/* Top-Right */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--industry)]" />
              {/* Bottom-Left */}
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--industry)]" />
              {/* Bottom-Right */}
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--industry)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The rendered input control */}
        {children({
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
          isFocused,
          hasError: Boolean(error),
        })}

        {/* Lime Underline Wipe */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--industry)] origin-left pointer-events-none z-10"
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 350, damping: 30 }
          }
          aria-hidden="true"
        />
      </div>

      {/* Inline Field Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-[11px] text-[var(--danger)] tracking-wide mt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
