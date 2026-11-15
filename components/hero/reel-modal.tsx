"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX } from "lucide-react";
import { heroConfig } from "@/data/hero";
import { HudCorners } from "./hud-corners";

interface ReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
  posterSrc?: string;
  returnFocusTo?: HTMLElement | null;
}

export function ReelModal({
  isOpen,
  onClose,
  videoSrc = heroConfig.reelVideoSrc,
  posterSrc = heroConfig.reelPosterSrc,
  returnFocusTo,
}: ReelModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap & keyboard control (Escape to close, Space to pause/play)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === " " && e.target === modalRef.current) {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      } else if (e.key === "Tab") {
        // Simple 2-button trap
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [tabindex="0"]'
        );
        if (!focusable || focusable.length === 0) return;

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
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Auto-focus close button when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      returnFocusTo?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#0B0B0B]/90 backdrop-blur-md select-none"
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
            className="relative w-full max-w-5xl aspect-video max-h-[85vh] bg-[#0B0B0B] border-2 border-[#FF2DA8] overflow-hidden shadow-[0_0_50px_rgba(255,45,168,0.3)] flex flex-col items-center justify-center"
          >
            {/* Viewfinder Corner Brackets around Video */}
            <HudCorners insetClassName="inset-3 sm:inset-4" />

            {/* Video Container */}
            <div className="relative w-full h-full flex items-center justify-center bg-[#0B0B0B]">
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
                  style={{ filter: "url(#duotone-pink)" }}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#D4FF3F] mb-2 font-bold">
                    ● REEL PREVIEW
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-[#FF2DA8]">
                    Featured Studio Reel
                  </p>
                  <p className="font-mono text-xs text-[#D4FF3F] mt-2">
                    Sony FX3 4K DCI Commercial Production
                  </p>
                </div>
              )}
            </div>

            {/* Top Bar Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="font-mono text-xs uppercase tracking-wider text-[#D4FF3F] bg-[#0B0B0B] px-3 py-1 border border-[#FF2DA8]/50">
                  <span className="text-[#FF2DA8] mr-1.5 animate-pulse font-bold">●</span>
                  27 CREATIVE STUDIO SHOWREEL
                </span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                {videoSrc && (
                  <button
                    type="button"
                    onClick={() => setIsMuted((prev) => !prev)}
                    aria-label={isMuted ? "Unmute reel" : "Mute reel"}
                    className="p-2 bg-[#0B0B0B] border border-[#FF2DA8] text-[#D4FF3F] hover:text-[#0B0B0B] hover:bg-[#D4FF3F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F]"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close reel viewer"
                  className="p-2 bg-[#0B0B0B] border border-[#FF2DA8] text-[#FF2DA8] hover:text-[#0B0B0B] hover:bg-[#FF2DA8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF3F]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Bar Details */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-30 font-mono text-xs text-[#D4FF3F] pointer-events-none">
              <span id="reel-modal-title" className="text-[#D4FF3F] font-bold">
                // {heroConfig.reelLabel}
              </span>
              <span className="hidden sm:inline-block font-bold text-[#FF2DA8]">
                [ PRESS ESC TO CLOSE ]
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
