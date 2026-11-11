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
        <span className="font-mono text-[10px] text-[var(--muted)] uppercase mr-1 select-none">
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
                  ? "border-[var(--industry)] bg-[var(--industry)]/20 text-[var(--industry)] font-bold"
                  : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-[var(--industry)]/50 hover:text-[var(--paper)]"
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
            className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border bg-[var(--panel)] text-base text-[var(--paper)] outline-none transition-colors font-mono cursor-pointer ${
              hasError
                ? "border-[var(--danger)]"
                : "border-[var(--line)] hover:border-[var(--industry)]/50 focus:border-[var(--industry)]"
            }`}
          />
        )}
      </FieldWithBrackets>
    </div>
  );
}
