"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";

export interface ChipOption {
  id: string;
  label: string;
}

interface ChipGroupProps {
  label: string;
  slateTag?: string;
  options: ChipOption[];
  selected: string | string[];
  onChange: (value: any) => void;
  isMulti?: boolean;
  error?: string;
  reducedMotion?: boolean;
}

export function ChipGroup({
  label,
  slateTag,
  options,
  selected,
  onChange,
  isMulti = false,
  error,
  reducedMotion = false,
}: ChipGroupProps) {
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isSelected = (id: string) => {
    if (isMulti) {
      return Array.isArray(selected) && selected.includes(id);
    }
    return selected === id;
  };

  const handleToggle = (id: string) => {
    if (isMulti) {
      const currentList = Array.isArray(selected) ? [...selected] : [];
      if (currentList.includes(id)) {
        onChange(currentList.filter((item) => item !== id));
      } else {
        onChange([...currentList, id]);
      }
    } else {
      onChange(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (index + 1) % options.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (index - 1 + options.length) % options.length;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      chipRefs.current[nextIndex]?.focus();
      if (!isMulti) {
        onChange(options[nextIndex].id);
      }
    }
  };

  return (
    <div
      className="flex flex-col gap-2"
      role={isMulti ? "group" : "radiogroup"}
      aria-label={`${slateTag ? slateTag + " " : ""}${label}`}
    >
      <div className="flex items-center gap-1.5 text-xs text-[#F4F1EA] font-medium">
        {slateTag && (
          <span className="font-mono text-[#C6FF3D]/70 font-semibold">{slateTag}</span>
        )}
        <span>{label}</span>
        {isMulti && (
          <span className="text-[10px] font-mono text-[#A9A7A0] ml-1">
            (select all that apply)
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option, idx) => {
          const active = isSelected(option.id);

          return (
            <button
              key={option.id}
              ref={(el) => {
                chipRefs.current[idx] = el;
              }}
              type="button"
              role={isMulti ? "checkbox" : "radio"}
              aria-checked={active}
              tabIndex={active || idx === 0 ? 0 : -1}
              onClick={() => handleToggle(option.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative px-3.5 py-2 rounded-lg border text-xs font-mono tracking-wider transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF3D] cursor-pointer min-h-[38px] flex items-center justify-center ${
                active
                  ? "border-[#C6FF3D] bg-[#C6FF3D]/15 text-[#C6FF3D] font-bold shadow-[0_0_10px_rgba(198,255,61,0.15)]"
                  : "border-[#2A2A30] bg-[#141419] text-[#A9A7A0] hover:border-[#C6FF3D]/50 hover:text-[#F4F1EA]"
              }`}
            >
              {/* Subtle active border glow */}
              {active && !reducedMotion && (
                <motion.div
                  layoutId={isMulti ? undefined : `active-chip-${label}`}
                  className="absolute inset-0 rounded-lg border border-[#C6FF3D] pointer-events-none"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="font-mono text-[11px] text-[#FF5A3D] tracking-wide mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
