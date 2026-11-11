"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import { heroConfig } from "@/data/hero";
import { VideoPlayer } from "@/components/video-player";

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
            {/* Video Player */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <VideoPlayer
                src={videoSrc}
                poster={posterSrc}
                title="27 CREATIVE STUDIO SHOWREEL"
                subtitle={heroConfig.reelLabel}
                autoPlay={true}
                muted={false}
                aspectRatio="video"
                showViewfinder={true}
                className="w-full h-full border-0 rounded-none"
              />
            </div>

            {/* Modal Close Button */}
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close reel viewer"
              className="absolute top-4 right-4 z-40 p-2 rounded-lg bg-[var(--ink,#0B0B0F)]/80 border border-[var(--line,#2A2A30)] text-[var(--paper,#F4F1EA)] hover:text-[var(--industry,#C6FF3D)] hover:border-[var(--industry,#C6FF3D)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry,#C6FF3D)] backdrop-blur-md shadow-lg"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
