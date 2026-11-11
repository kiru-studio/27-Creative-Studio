"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import { heroConfig } from "@/data/hero";
import { HudCorners } from "./hud-corners";

interface ReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnFocusTo?: HTMLElement | null;
  videoSrc?: string;
  posterSrc?: string;
}

export function ReelModal({
  isOpen,
  onClose,
  returnFocusTo,
  videoSrc = heroConfig.reelVideoSrc || heroConfig.videoSrc,
  posterSrc = heroConfig.reelPosterSrc || heroConfig.posterSrc,
}: ReelModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      returnFocusTo?.focus();
    };
  }, [isOpen, onClose, returnFocusTo]);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reel-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl aspect-video max-h-[85vh] bg-[var(--panel-raised,#111)] border border-[var(--line)] rounded-lg overflow-hidden shadow-2xl flex flex-col items-center justify-center"
          >
            {/* Viewfinder Corner Brackets around Video */}
            <HudCorners insetClassName="inset-3 sm:inset-4" />

            {/* Video Container */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {videoSrc ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  poster={posterSrc || undefined}
                  autoPlay
                  playsInline
                  controls={false}
                  muted={isMuted}
                  loop
                  onClick={togglePlay}
                  className="w-full h-full object-contain cursor-pointer"
                />
              ) : (
                <div className="text-center p-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-[var(--industry)] mb-2">
                    ● REEL PREVIEW
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-[var(--paper)]">
                    Featured Studio Reel
                  </p>
                  <p className="font-mono text-xs text-[var(--muted)] mt-2">
                    Placeholder reel video (add videoSrc in data/hero.ts)
                  </p>
                </div>
              )}
            </div>

            {/* Top Bar Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--paper)] bg-black/60 px-2.5 py-1 rounded backdrop-blur border border-[var(--line)]">
                  <span className="text-[var(--rec,#FF3B30)] mr-1.5">●</span>
                  27 CREATIVE STUDIO SHOWREEL
                </span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                {videoSrc && (
                  <button
                    type="button"
                    onClick={() => setIsMuted((prev) => !prev)}
                    aria-label={isMuted ? "Unmute reel" : "Mute reel"}
                    className="p-2 rounded bg-black/60 border border-[var(--line)] text-[var(--paper)] hover:text-[var(--industry)] hover:border-[var(--industry)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)]"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close reel viewer"
                  className="p-2 rounded bg-black/60 border border-[var(--line)] text-[var(--paper)] hover:text-[var(--industry)] hover:border-[var(--industry)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry)]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Bar Details */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-30 font-mono text-xs text-[var(--muted)] pointer-events-none">
              <span id="reel-modal-title" className="text-[var(--paper)] opacity-80">
                {heroConfig.reelLabel}
              </span>
              <span className="hidden sm:inline-block opacity-60">
                PRESS ESC TO CLOSE
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
