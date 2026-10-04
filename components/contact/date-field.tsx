"use client";

import React, { useState } from "react";
import { dateShortcuts, type DateShortcut } from "@/data/contact";
import { FieldWithBrackets } from "./field-with-brackets";

interface DateFieldProps {
  dateValue: string;
  shortcutValue?: string;
  onDateChange: (date: string) => void;
  onShortcutChange: (shortcut: string) => void;
  error?: string;
  reducedMotion?: boolean;
}

export function DateField({
  dateValue,
  shortcutValue,
  onDateChange,
  onShortcutChange,
  error,
  reducedMotion = false,
}: DateFieldProps) {
  const today = new Date().toISOString().split("T")[0];

  const handleShortcutClick = (shortcut: DateShortcut) => {
    if (shortcutValue === shortcut) {
      onShortcutChange("");
    } else {
      onShortcutChange(shortcut);
      onDateChange(""); // Selecting shortcut clears date input
    }
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
    if (e.target.value) {
      onShortcutChange(""); // Picking a date clears shortcut
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Date Shortcuts Above */}
      <div
        role="group"
        aria-label="Quick timeline options"
        className="flex flex-wrap items-center gap-1.5 mb-1"
      >
        <span className="font-mono text-[10px] text-[#A9A7A0] uppercase mr-1 select-none">
          Quick timeline:
        </span>
        {dateShortcuts.map((sc) => {
          const isActive = shortcutValue === sc;
          return (
            <button
              key={sc}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleShortcutClick(sc)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono tracking-wider transition-all border cursor-pointer ${
                isActive
                  ? "border-[#C6FF3D] bg-[#C6FF3D]/20 text-[#C6FF3D] font-bold"
                  : "border-[#2A2A30] bg-[#141419] text-[#A9A7A0] hover:border-[#C6FF3D]/50 hover:text-[#F4F1EA]"
              }`}
            >
              {sc}
            </button>
          );
        })}
      </div>

      {/* Styled Native Date Input */}
      <FieldWithBrackets
        id="preferredDate"
        label="Preferred date"
        slateTag="DATE"
        error={error}
        reducedMotion={reducedMotion}
      >
        {({ onFocus, onBlur, hasError }) => (
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            min={today}
            value={dateValue}
            onChange={handleDateInput}
            onFocus={onFocus}
            onBlur={onBlur}
            style={{ colorScheme: "dark" }}
            aria-invalid={hasError}
            aria-describedby={hasError ? "preferredDate-error" : undefined}
            className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border bg-[#141419] text-base text-[#F4F1EA] outline-none transition-colors font-mono cursor-pointer ${
              hasError
                ? "border-[#FF5A3D]"
                : "border-[#2A2A30] hover:border-[#C6FF3D]/50 focus:border-[#C6FF3D]"
            }`}
          />
        )}
      </FieldWithBrackets>
    </div>
  );
}
