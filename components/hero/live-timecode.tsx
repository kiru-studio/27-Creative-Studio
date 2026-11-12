"use client";

import { useEffect, useRef, useState } from "react";

function format2d(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function LiveTimecode({ className = "" }: { className?: string }) {
  const [timecode, setTimecode] = useState("00:00:00:11");
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frameCount = 11; // initial frames
    let lastTime = performance.now();
    let animId: number = 0;
    let isHidden = false;
    let isIntersecting = true;

    const FRAME_DURATION = 1000 / 24; // 24 fps

    const tick = (now: number) => {
      if (!isHidden && isIntersecting) {
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
        animId = requestAnimationFrame(tick);
      } else {
        // Paused while out of view or tab hidden
        animId = 0;
      }
    };

    const startTicker = () => {
      if (!animId && !isHidden && isIntersecting) {
        lastTime = performance.now();
        animId = requestAnimationFrame(tick);
      }
    };

    const stopTicker = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const handleVisibilityChange = () => {
      isHidden = document.visibilityState === "hidden";
      if (!isHidden && isIntersecting) {
        startTicker();
      } else {
        stopTicker();
      }
    };

    // IntersectionObserver to sleep ticker whenever hero is off-screen
    let observer: IntersectionObserver | null = null;
    if (spanRef.current && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting && !isHidden) {
            startTicker();
          } else {
            stopTicker();
          }
        },
        { threshold: 0 }
      );
      observer.observe(spanRef.current);
    } else {
      startTicker();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopTicker();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <span
      ref={spanRef}
      className={`font-mono text-xs sm:text-sm tracking-wider text-[var(--paper)] select-none tabular-nums ${className}`}
      aria-hidden="true"
    >
      {timecode}
    </span>
  );
}
