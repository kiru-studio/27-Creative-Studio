"use client";

import { useEffect, useState, useRef } from "react";

interface LiveTimecodeProps {
  isFrozen?: boolean;
  frozenValue?: string;
  onTimecodeUpdate?: (tc: string) => void;
}

export function LiveTimecode({
  isFrozen = false,
  frozenValue,
  onTimecodeUpdate,
}: LiveTimecodeProps) {
  const [timecode, setTimecode] = useState(frozenValue || "00:00:00:00");
  const framesRef = useRef(0);
  const frozenRef = useRef(isFrozen);
  frozenRef.current = isFrozen;

  useEffect(() => {
    if (frozenRef.current && frozenValue) {
      setTimecode(frozenValue);
      return;
    }

    // 24fps tick interval: ~41.67ms
    const interval = setInterval(() => {
      if (document.hidden || frozenRef.current) return;

      framesRef.current += 1;
      const totalFrames = framesRef.current;
      const ff = totalFrames % 24;
      const totalSec = Math.floor(totalFrames / 24);
      const ss = totalSec % 60;
      const totalMin = Math.floor(totalSec / 60);
      const mm = totalMin % 60;
      const hh = Math.floor(totalMin / 60) % 24;

      const formatted = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;
      setTimecode(formatted);
      onTimecodeUpdate?.(formatted);
    }, 1000 / 24);

    return () => clearInterval(interval);
  }, [frozenValue, onTimecodeUpdate]);

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[var(--ink)]/90 border border-[var(--line)] font-mono text-[11px] tracking-wider text-[var(--industry)] select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
      role="timer"
      aria-label={`Recording timecode: ${timecode}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isFrozen ? "bg-[var(--muted)]" : "bg-[var(--rec)] animate-pulse"
        }`}
        aria-hidden="true"
      />
      <span>{frozenValue || timecode}</span>
    </div>
  );
}
