"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { heroConfig, type SceneMarker } from "@/data/hero";

interface SceneProgressProps {
  isMuted: boolean;
  onToggleMute: () => void;
  shouldReduceMotion?: boolean;
  className?: string;
}

export function SceneProgress({
  isMuted,
  onToggleMute,
  shouldReduceMotion = false,
  className = "",
}: SceneProgressProps) {
  const [activeScene, setActiveScene] = useState<SceneMarker>(
    heroConfig.scenes[0] || { id: "hero", number: "01", label: "home" }
  );

  // Track active scene using IntersectionObserver
  useEffect(() => {
    const scenes = heroConfig.scenes;
    const observedElements: { id: string; element: HTMLElement }[] = [];

    scenes.forEach((scene) => {
      const el = document.getElementById(scene.id);
      if (el) observedElements.push({ id: scene.id, element: el });
    });

    if (!observedElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible section closest to viewport center or top
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by intersectionRatio
          visibleEntries.sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio
          );
          const topVisibleId = visibleEntries[0].target.id;
          const found = scenes.find((s) => s.id === topVisibleId);
          if (found) {
            setActiveScene(found);
          }
        }
      },
      {
        rootMargin: "-20% 0px -40% 0px",
        threshold: [0, 0.2, 0.5, 0.8],
      }
    );

    observedElements.forEach(({ element }) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const sceneText = `scene ${activeScene.number} · ${activeScene.label}`;

  return (
    <div
      className={`w-full flex items-end justify-between gap-4 font-mono text-xs select-none ${className}`}
    >
      {/* Left: Dynamic Scene Marker */}
      <div
        className="text-xs tracking-wider text-[var(--muted)] flex items-center shrink-0"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={activeScene.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className="text-[var(--paper)] font-medium text-xs whitespace-nowrap"
          >
            {sceneText}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Right: Stacked Sound Toggle & Secondary Reel Label */}
      <div className="flex flex-col items-end gap-1.5 sm:gap-2 pr-3 shrink-0">
        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={!isMuted}
          aria-label={isMuted ? "Unmute background video" : "Mute background video"}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--paper)] hover:text-[var(--industry)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--industry)] rounded px-1.5 py-0.5 -mr-1.5 cursor-pointer"
        >
          {isMuted ? (
            <VolumeX size={13} className="text-[var(--muted)]" aria-hidden="true" />
          ) : (
            <Volume2 size={13} className="text-[var(--industry)]" aria-hidden="true" />
          )}
          <span>{isMuted ? "sound off" : "sound on"}</span>
        </button>

        {/* Secondary Line: Lower Opacity (60%), visible on tablet and desktop */}
        <span className="hidden sm:inline-block text-[10px] sm:text-xs text-[var(--muted)] opacity-60 tracking-wider text-right">
          {heroConfig.reelLabel}
        </span>
      </div>
    </div>
  );
}
export default SceneProgress;
