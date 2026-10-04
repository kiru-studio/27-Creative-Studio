"use client";

import { useEffect, useState } from "react";

function format2d(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function LiveTimecode({ className = "" }: { className?: string }) {
  // Start from initial timecode (00:00:00:11 as in spec/screenshot)
  const [timecode, setTimecode] = useState("00:00:00:11");

  useEffect(() => {
    let frameCount = 11; // initial frames
    let lastTime = performance.now();
    let animId: number;
    let isHidden = false;

    const FRAME_DURATION = 1000 / 24; // 24 fps

    const tick = (now: number) => {
      if (!isHidden) {
        const elapsed = now - lastTime;
        if (elapsed >= FRAME_DURATION) {
          const framesToAdd = Math.floor(elapsed / FRAME_DURATION);
          frameCount += framesToAdd;
          lastTime = now - (elapsed % FRAME_DURATION);

          const ff = frameCount % 24;
          const totalSeconds = Math.floor(frameCount / 24);
          const ss = totalSeconds % 60;
          const totalMinutes = Math.floor(totalSeconds / 60);
          const mm = totalMinutes % 60;
          const hh = Math.floor(totalMinutes / 60) % 24;

          setTimecode(
            `${format2d(hh)}:${format2d(mm)}:${format2d(ss)}:${format2d(ff)}`
          );
        }
      } else {
        lastTime = now;
      }
      animId = requestAnimationFrame(tick);
    };

    const handleVisibilityChange = () => {
      isHidden = document.visibilityState === "hidden";
      if (!isHidden) {
        lastTime = performance.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <span
      className={`font-mono text-xs sm:text-sm tracking-wider text-[var(--paper)] select-none tabular-nums ${className}`}
      aria-hidden="true"
    >
      {timecode}
    </span>
  );
}
