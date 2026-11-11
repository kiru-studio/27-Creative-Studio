"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  aspectRatio?: "video" | "reel" | "square" | "auto";
  className?: string;
  videoClassName?: string;
  showViewfinder?: boolean;
  compact?: boolean;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

const formatTime = (seconds: number) => {
  if (!isFinite(seconds) || seconds < 0 || isNaN(seconds)) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface CustomSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
}

export const CustomSlider = ({
  value,
  onChange,
  className,
  trackClassName,
  ariaLabel = "Slider",
}: CustomSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const calculatePercentage = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return 0;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      return Math.min(Math.max(percentage, 0), 100);
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const newPercent = calculatePercentage(e.clientX);
    onChange(newPercent);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const newPercent = calculatePercentage(e.clientX);
    onChange(newPercent);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  return (
    <div
      ref={sliderRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          onChange(Math.min(value + 5, 100));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          onChange(Math.max(value - 5, 0));
        }
      }}
      className={cn(
        "group relative flex items-center h-5 w-full cursor-pointer select-none touch-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--industry,#C6FF3D)] rounded-full",
        className
      )}
    >
      {/* Background track */}
      <div
        className={cn(
          "relative w-full h-1.5 bg-white/20 group-hover:bg-white/30 rounded-full overflow-hidden transition-all duration-200",
          trackClassName
        )}
      >
        {/* Animated fill bar with theme accent */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-[var(--industry,#C6FF3D)] rounded-full"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
          initial={false}
          animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
        />
      </div>

      {/* Scrubber thumb handle with active pulse */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3 sm:size-3.5 bg-white border border-[var(--industry,#C6FF3D)] rounded-full shadow-[0_0_8px_rgba(198,255,61,0.6)] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `${Math.min(Math.max(value, 0), 100)}%` }}
        animate={{ scale: isDraggingRef.current ? 1.25 : 1 }}
      />
    </div>
  );
};

export function VideoPlayer({
  src,
  poster,
  title,
  subtitle,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = true,
  preload = "metadata",
  aspectRatio = "video",
  className,
  videoClassName,
  showViewfinder = true,
  compact = false,
  onEnded,
  onPlay,
  onPause,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(muted ? 0 : 1);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2600);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    } else {
      resetHideTimer();
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying, resetHideTimer]);

  // Sync muted prop if changed externally
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle Fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    setHasInteracted(true);
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      void videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleVolumeChange = (value: number) => {
    if (!videoRef.current) return;
    const newVolume = value / 100;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    const mutedState = newVolume === 0;
    setIsMuted(mutedState);
    videoRef.current.muted = mutedState;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted || volume === 0) {
      const restoredVol = volume > 0 ? volume : 1;
      videoRef.current.muted = false;
      videoRef.current.volume = restoredVol;
      setIsMuted(false);
      setVolume(restoredVol);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(curr);
    if (dur && isFinite(dur)) {
      setDuration(dur);
      setProgress((curr / dur) * 100);
    }
  };

  const handleSeek = (percentage: number) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const newTime = (percentage / 100) * videoRef.current.duration;
    if (isFinite(newTime)) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage);
    }
  };

  const setSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    void videoRef.current.play();
    setIsPlaying(true);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "video":
        return "aspect-video";
      case "reel":
        return "aspect-[9/16]";
      case "square":
        return "aspect-square";
      case "auto":
      default:
        return "";
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "group relative w-full overflow-hidden bg-[var(--ink,#0B0B0F)] border border-[var(--line,#2A2A30)] select-none shadow-2xl transition-all",
        aspectRatio === "reel" ? "rounded-[var(--radius-phone,1rem)]" : "rounded-xl sm:rounded-2xl",
        getAspectClass(),
        className
      )}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={resetHideTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "k") {
          e.preventDefault();
          togglePlay();
        } else if (e.key === "m") {
          e.preventDefault();
          toggleMute();
        } else if (e.key === "f") {
          e.preventDefault();
          toggleFullscreen();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(
              videoRef.current.currentTime + 5,
              duration || 0
            );
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(
              videoRef.current.currentTime - 5,
              0
            );
          }
        }
      }}
    >
      {/* 1. Camera Viewfinder Corner Brackets */}
      {showViewfinder && (
        <div
          className="pointer-events-none absolute inset-3 sm:inset-4 z-20 transition-opacity duration-300"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-0 w-3.5 h-3.5 sm:w-5 sm:h-5 border-t-2 border-l-2 border-[var(--industry,#C6FF3D)]/80" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-5 sm:h-5 border-t-2 border-r-2 border-[var(--industry,#C6FF3D)]/80" />
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 sm:w-5 sm:h-5 border-b-2 border-l-2 border-[var(--industry,#C6FF3D)]/80" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-5 sm:h-5 border-b-2 border-r-2 border-[var(--industry,#C6FF3D)]/80" />
        </div>
      )}

      {/* 2. Top HUD Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-30 flex items-center justify-between pointer-events-none"
          >
            {/* Left: Blinking REC Badge & Studio Tag */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--ink,#0B0B0F)]/80 border border-[var(--line,#2A2A30)] backdrop-blur-md font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[var(--paper,#F4F1EA)] shadow-md">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    isPlaying
                      ? "bg-[var(--rec,#FF3B30)] animate-pulse"
                      : "bg-[var(--muted,#A9A7A0)]"
                  )}
                />
                <span className="font-semibold">
                  {isPlaying ? "REC" : "PAUSED"}
                </span>
                {title && (
                  <span className="hidden sm:inline-block border-l border-[var(--line,#2A2A30)] pl-2 text-[var(--muted,#A9A7A0)]">
                    {title}
                  </span>
                )}
              </span>
            </div>

            {/* Right: Format / HUD Specs */}
            <div className="flex items-center gap-1.5 pointer-events-auto font-mono text-[10px] sm:text-[11px] text-[var(--paper,#F4F1EA)]/80">
              <span className="px-2 py-0.5 rounded bg-[var(--ink,#0B0B0F)]/70 border border-[var(--line,#2A2A30)] backdrop-blur-md">
                4K 60FPS
              </span>
              {subtitle && (
                <span className="hidden md:inline-block px-2 py-0.5 rounded bg-[var(--ink,#0B0B0F)]/70 border border-[var(--line,#2A2A30)] backdrop-blur-md text-[var(--industry,#C6FF3D)]">
                  {subtitle}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Media Video Element or Fallback Canvas */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          playsInline={playsInline}
          preload={preload}
          className={cn(
            "w-full h-full object-cover cursor-pointer",
            videoClassName
          )}
          onClick={togglePlay}
          onPlay={() => {
            setIsPlaying(true);
            onPlay?.();
          }}
          onPause={() => {
            setIsPlaying(false);
            onPause?.();
          }}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onEnded={() => {
            setIsPlaying(false);
            onEnded?.();
          }}
        />
      ) : (
        <div
          onClick={togglePlay}
          className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#141419] to-[#0B0B0F] cursor-pointer p-6 text-center select-none"
        >
          {poster ? (
            <img
              src={poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
          )}

          <div className="relative z-10 space-y-2">
            <span className="font-mono text-xs text-[var(--industry,#C6FF3D)] uppercase tracking-widest block">
              ● VIEWING MONITOR
            </span>
            <p className="font-display text-xl sm:text-2xl text-[var(--paper,#F4F1EA)] font-bold">
              {title || "27 Creative Studio Reel"}
            </p>
            <p className="font-mono text-xs text-[var(--muted,#A9A7A0)] max-w-sm mx-auto">
              {subtitle || "Tap anywhere to toggle cinematic player controls"}
            </p>
          </div>
        </div>
      )}

      {/* 4. Center Play / Buffering Indicator */}
      <AnimatePresence>
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none bg-black/30 backdrop-blur-[2px]">
            <div className="size-12 rounded-full border-2 border-[var(--industry,#C6FF3D)] border-t-transparent animate-spin" />
          </div>
        )}

        {!isPlaying && !isBuffering && (
          <motion.button
            type="button"
            onClick={togglePlay}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="absolute inset-0 m-auto size-14 sm:size-18 rounded-full bg-[var(--ink,#0B0B0F)]/80 border border-[var(--industry,#C6FF3D)] text-[var(--industry,#C6FF3D)] backdrop-blur-md flex items-center justify-center z-25 shadow-[0_0_30px_rgba(198,255,61,0.25)] hover:shadow-[0_0_40px_rgba(198,255,61,0.45)] transition-shadow"
            aria-label="Play video"
          >
            <Play className="size-6 sm:size-7 ml-1 fill-current" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 5. Floating Glassmorphism Control Bar (Inspired dock) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 24, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 24, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute bottom-2 inset-x-2 sm:bottom-3 sm:inset-x-3 md:bottom-4 mx-auto z-30 max-w-xl p-2.5 sm:p-3 bg-[#0B0B0F]/90 backdrop-blur-md border border-[var(--line,#2A2A30)]/90 rounded-xl sm:rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-[var(--paper,#F4F1EA)]",
              compact && "p-2 max-w-md"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Row: Timecode + Custom Scrub Slider */}
            <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
              <span className="font-mono text-[11px] sm:text-xs text-[var(--paper,#F4F1EA)] min-w-[34px] sm:min-w-[38px] text-right">
                {formatTime(currentTime)}
              </span>

              <CustomSlider
                value={progress}
                onChange={handleSeek}
                className="flex-1"
                ariaLabel="Timeline scrubber"
              />

              <span className="font-mono text-[11px] sm:text-xs text-[var(--muted,#A9A7A0)] min-w-[34px] sm:min-w-[38px] text-left">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Row: Controls */}
            <div className="flex items-center justify-between gap-1 sm:gap-2 pt-0.5">
              {/* Left group: Play/Pause, Mute, Volume */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Play / Pause Toggle */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="size-8 sm:size-9 rounded-lg flex items-center justify-center text-[var(--paper,#F4F1EA)] hover:bg-white/10 hover:text-[var(--industry,#C6FF3D)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry,#C6FF3D)]"
                >
                  {isPlaying ? (
                    <Pause className="size-4 sm:size-4.5 fill-current" />
                  ) : (
                    <Play className="size-4 sm:size-4.5 fill-current ml-0.5" />
                  )}
                </motion.button>

                {/* Volume Toggle */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="size-8 sm:size-9 rounded-lg flex items-center justify-center text-[var(--paper,#F4F1EA)] hover:bg-white/10 hover:text-[var(--industry,#C6FF3D)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry,#C6FF3D)]"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="size-4 sm:size-4.5 text-[var(--rec,#FF3B30)]" />
                    ) : volume > 0.5 ? (
                      <Volume2 className="size-4 sm:size-4.5" />
                    ) : (
                      <Volume1 className="size-4 sm:size-4.5" />
                    )}
                  </motion.button>

                  {/* Volume Slider (hidden on extra small screens in compact mode) */}
                  <div className="hidden sm:block w-16 md:w-20">
                    <CustomSlider
                      value={isMuted ? 0 : volume * 100}
                      onChange={handleVolumeChange}
                      ariaLabel="Volume slider"
                    />
                  </div>
                </div>
              </div>

              {/* Right group: Playback Speeds & Fullscreen */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Replay Quick Action */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleReplay}
                  aria-label="Replay from start"
                  title="Replay from start"
                  className="hidden xs:flex size-7 sm:size-8 rounded-lg items-center justify-center text-[var(--muted,#A9A7A0)] hover:text-[var(--paper,#F4F1EA)] hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="size-3.5" />
                </motion.button>

                {/* Playback Speed Chips */}
                <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5">
                  {[0.5, 1, 1.5, 2].map((speed) => {
                    const isActive = playbackSpeed === speed;
                    return (
                      <motion.button
                        key={speed}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSpeed(speed)}
                        aria-label={`Playback speed ${speed}x`}
                        className={cn(
                          "px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-mono text-[10px] sm:text-[11px] transition-all",
                          isActive
                            ? "bg-[var(--industry,#C6FF3D)] text-[var(--industry-ink)] font-bold shadow-sm"
                            : "text-[var(--muted,#A9A7A0)] hover:text-[var(--paper,#F4F1EA)] hover:bg-white/5"
                        )}
                      >
                        {speed}x
                      </motion.button>
                    );
                  })}
                </div>

                {/* Fullscreen Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  className="size-8 sm:size-9 rounded-lg flex items-center justify-center text-[var(--paper,#F4F1EA)] hover:bg-white/10 hover:text-[var(--industry,#C6FF3D)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--industry,#C6FF3D)]"
                >
                  {isFullscreen ? (
                    <Minimize className="size-4" />
                  ) : (
                    <Maximize className="size-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default VideoPlayer;
