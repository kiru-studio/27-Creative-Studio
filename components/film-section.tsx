"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
} from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { siteContent } from "@/lib/site-content";
import { getMediaStreamUrl, parseMediaUrl } from "@/lib/media-utils";
import { VideoPlayer } from "@/components/ui/video-player";

export type FilmVideoItem = {
  id: string;
  title: string;
  client: string;
  type: string;
  goal: string;
  format: string;
  duration: string;
  label: string;
  src?: string;
  posterSrc?: string;
  caption: string;
};

// Data array of videos (id, title, caption, duration, src)
export const filmsData: FilmVideoItem[] = siteContent.films.map(
  (film, index) => {
    const matchingCase = siteContent.caseStudies.find(
      (c) =>
        c.client?.toLowerCase().includes("thoorig") ||
        (film.client && c.client?.toLowerCase().includes(film.client.toLowerCase()))
    );
    const videoSrc =
      film.videoSrc ||
      ((film.client || "").toLowerCase().includes("thoorig") ? matchingCase?.videoSrc : "") ||
      "";
    const posterSrc =
      film.posterSrc ||
      (videoSrc ? parseMediaUrl(videoSrc).posterSuggestionUrl : "");

    return {
      id: `film-${index}-${(film.client || "film")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}`,
      title: film.title,
      client: film.client ?? "Client",
      type: film.type,
      goal: film.goal ?? "",
      format: film.format ?? "",
      duration: film.meta,
      label: film.label,
      src: videoSrc ? getMediaStreamUrl(videoSrc) : undefined,
      posterSrc: posterSrc || undefined,
      caption: `${film.client ?? ""} · ${film.type}`,
    };
  },
);

// 1. VIEWFINDER BRACKETS (Lock-On & Pulse)
interface ViewfinderBracketsProps {
  isLocked: boolean;
  pulseKey: string | number;
  shouldReduceMotion?: boolean;
}

export function ViewfinderBrackets({
  isLocked,
  pulseKey,
  shouldReduceMotion = false,
}: ViewfinderBracketsProps) {
  if (shouldReduceMotion) {
    return (
      <span className="corner-brackets" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  return (
    <motion.span
      key={pulseKey}
      className="corner-brackets pointer-events-none"
      aria-hidden="true"
      initial={{ scale: 1.02 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Top-Left: starts x: -24, y: -24 */}
      <motion.i
        initial={{ x: -24, y: -24, opacity: 0 }}
        animate={
          isLocked
            ? { x: 0, y: 0, opacity: 1 }
            : { x: -24, y: -24, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Top-Right: starts x: 24, y: -24 */}
      <motion.i
        initial={{ x: 24, y: -24, opacity: 0 }}
        animate={
          isLocked
            ? { x: 0, y: 0, opacity: 1 }
            : { x: 24, y: -24, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Bottom-Left: starts x: -24, y: 24 */}
      <motion.i
        initial={{ x: -24, y: 24, opacity: 0 }}
        animate={
          isLocked
            ? { x: 0, y: 0, opacity: 1 }
            : { x: -24, y: 24, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Bottom-Right: starts x: 24, y: 24 */}
      <motion.i
        initial={{ x: 24, y: 24, opacity: 0 }}
        animate={
          isLocked
            ? { x: 0, y: 0, opacity: 1 }
            : { x: 24, y: 24, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.span>
  );
}

// 2. MAIN PLAYER COMPONENT
interface MainPlayerProps {
  item: FilmVideoItem;
  isLocked: boolean;
  pulseKey: string | number;
  shouldReduceMotion: boolean;
  progress: number;
  onProgressChange: React.Dispatch<React.SetStateAction<number>>;
  playing: boolean;
  onTogglePlay: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export function MainPlayer({
  item,
  isLocked,
  pulseKey,
  shouldReduceMotion,
  progress,
  onProgressChange,
  playing,
  onTogglePlay,
  muted,
  onToggleMute,
}: MainPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance progress when playing without a real video stream
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (playing && !item.src) {
      timer = setInterval(() => {
        onProgressChange((prev: number) => {
          if (prev >= 100) {
            onTogglePlay();
            return 0;
          }
          return prev + 1;
        });
      }, 450);
    }
    return () => clearInterval(timer);
  }, [playing, item.src, onProgressChange, onTogglePlay]);

  // Controls auto-hide timer during playback
  useEffect(() => {
    if (playing) {
      hideTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    } else {
      setIsControlsVisible(true);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [playing]);

  const handlePointerInteraction = () => {
    setIsControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div
      ref={playerRef}
      className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black border border-[#2A2A30] shadow-2xl flex items-center justify-center select-none group"
      role="group"
      aria-label={siteContent.ui.filmPlayerLabel}
      onMouseMove={handlePointerInteraction}
      onTouchStart={handlePointerInteraction}
    >
      {item.src ? (
        <VideoPlayer
          src={item.src}
          poster={item.posterSrc}
          className="w-full h-full"
          objectFit="contain"
          preload="none"
          autoPlay={playing}
          onPlay={() => !playing && onTogglePlay()}
          onPause={() => playing && onTogglePlay()}
        />
      ) : (
        <>
          {/* Viewfinder Lock-on Brackets */}
          <ViewfinderBrackets
            isLocked={isLocked}
            pulseKey={pulseKey}
            shouldReduceMotion={shouldReduceMotion}
          />

          {/* Background: Poster or Cinema Film Slate Gradient */}
          {item.posterSrc ? (
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={item.posterSrc}
              alt={`${item.client} — ${item.title}`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#121217] via-[#09090D] to-[#15151C] flex flex-col items-center justify-center overflow-hidden">
              {/* Subtle Film Grain / Grid Lines */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80 pointer-events-none" />
            </div>
          )}

          {/* Top HUD Bar: REC / STANDBY status badge and Timecode */}
          <div
            className={`absolute top-2.5 sm:top-3 left-3 right-3 z-20 flex items-center justify-between font-mono text-[10px] sm:text-[11px] pointer-events-none select-none tracking-widest transition-opacity duration-300 ${
              isControlsVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-black/80 backdrop-blur-md border border-white/10">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  playing ? "bg-[#FF3B30] animate-pulse" : "bg-[#C6FF3D]"
                }`}
              />
              <span
                className={
                  playing ? "text-[#FF3B30] font-bold" : "text-[#C6FF3D] font-bold"
                }
              >
                {playing ? "REC // 24FPS" : "STANDBY // 24FPS"}
              </span>
            </div>

            <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[#F4F1EA] tabular-nums font-bold">
              {playing
                ? `00:00:${String(Math.floor((progress / 100) * 45)).padStart(2, "0")}:18`
                : item.duration || "00:45:00"}
            </div>
          </div>

          {/* Center Play / Pause Icon Button */}
          <div
            className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ${
              !playing || isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              type="button"
              onClick={onTogglePlay}
              className="p-3 text-[#C6FF3D] transition-all duration-200 cursor-pointer drop-shadow-[0_3px_14px_rgba(0,0,0,0.95)] hover:drop-shadow-[0_0_20px_rgba(198,255,61,0.7)] hover:scale-115 active:scale-90 filter outline-none"
              aria-label={playing ? "Pause film" : "Play film"}
            >
              {playing ? (
                <Pause
                  className="w-11 h-11 sm:w-13 sm:h-13"
                  style={{ color: "#C6FF3D", fill: "#C6FF3D" }}
                />
              ) : (
                <Play
                  className="w-11 h-11 sm:w-13 sm:h-13 ml-1"
                  style={{ color: "#C6FF3D", fill: "#C6FF3D" }}
                />
              )}
            </button>
          </div>

          {/* Bottom HUD Bar: Play Button + Seek Bar + Mute & Fullscreen Icons */}
          <div
            className={`absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-30 flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 transition-opacity duration-300 ${
              isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Play/Pause Mini Button */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="p-1 text-white/90 hover:text-[#C6FF3D] transition-colors cursor-pointer outline-none shrink-0"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Precision Neon Lime Progress Bar */}
            <div
              className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newProgress = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
                onProgressChange(newProgress);
              }}
            >
              <div
                className="h-full bg-[#C6FF3D] rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Mute Button (Icon only) */}
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1 text-white/90 hover:text-[#C6FF3D] transition-colors cursor-pointer outline-none shrink-0"
              title={muted ? "Unmute audio" : "Mute audio"}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-[#FF5C5C]" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Fullscreen Button (Icon only) */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 text-white/90 hover:text-[#C6FF3D] transition-colors cursor-pointer outline-none shrink-0"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-[#C6FF3D]" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 3. VIDEO CARD (Hover-to-Play Thumbnail)
interface VideoCardProps {
  item: FilmVideoItem;
  isHovered: boolean;
  isOtherHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
  shouldReduceMotion: boolean;
}

export function VideoCard({
  item,
  isHovered,
  isOtherHovered,
  onHoverStart,
  onHoverEnd,
  onClick,
  shouldReduceMotion,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!item.src || !videoRef.current) return;
    if (isHovered) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, item.src]);

  return (
    <motion.button
      type="button"
      className="film-small"
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      animate={{ opacity: isOtherHovered ? 0.5 : 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      aria-label={`Switch to ${item.title}`}
    >
      <motion.div
        className="film-small-poster"
        animate={{
          scale: isHovered && !shouldReduceMotion ? 1.03 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {item.src ? (
          <video
            ref={videoRef}
            className="film-video"
            src={item.src}
            poster={item.posterSrc}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
        ) : item.posterSrc ? (
          <img
            className="poster-image"
            src={item.posterSrc}
            alt={`${item.client || "Film"} thumbnail — ${item.title}`}
            loading="lazy"
          />
        ) : null}

        <span>{item.label}</span>
        <b>{item.duration}</b>

        {/* Lime Preview Progress Bar: scaleX 0 -> 1 over 1.2s linear on hover */}
        <motion.div
          className="film-preview-bar"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={
            isHovered
              ? { duration: 1.2, ease: "linear" }
              : { duration: 0.25, ease: "easeOut" }
          }
        />
      </motion.div>

      {/* Caption: shifts up 2px and transitions from muted gray to white */}
      <motion.span
        className="film-small-caption"
        animate={{
          y: isHovered && !shouldReduceMotion ? -2 : 0,
          color: isHovered ? "#ffffff" : "var(--muted)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {item.caption}
      </motion.span>
    </motion.button>
  );
}

// 4. MAIN FILM SECTION COMPONENT
export function FilmSection() {
  const [videos] = useState<FilmVideoItem[]>(filmsData);
  const [activeId, setActiveId] = useState<string>(filmsData[0]?.id ?? "");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [progress, setProgress] = useState(18);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [pulseKey, setPulseKey] = useState<string | number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-12% 0px" });
  const shouldReduceMotion = useHydratedReducedMotion();

  const activeItem = videos.find((v) => v.id === activeId) ?? videos[0];
  const sideItems = videos.filter((v) => v.id !== activeId);

  // Swap handler: clicks thumbnail to become main, resets scrubber and triggers re-lock pulse
  const handleSwap = (clickedId: string) => {
    setActiveId(clickedId);
    setProgress(0);
    setPlaying(false);
    setPulseKey(clickedId);
  };

  if (!activeItem) return null;

  return (
    <section
      className="films-section"
      id="films"
      ref={sectionRef}
      aria-labelledby="films-heading"
    >
      <LayoutGroup id="longer-cut-films-group">
        {/* SCROLL REVEAL: Staggered heading lines sliding from behind overflow-hidden mask */}
        <div className="section-intro">
          <div className="overflow-mask-inline">
            <motion.p
              className="kicker"
              initial={
                shouldReduceMotion
                  ? { y: 0, opacity: 1 }
                  : { y: "100%", opacity: 0 }
              }
              animate={
                isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }
              }
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {siteContent.ui.filmsKicker}
            </motion.p>
          </div>

          <div className="overflow-mask">
            <motion.h2
              id="films-heading"
              initial={
                shouldReduceMotion
                  ? { y: 0, opacity: 1 }
                  : { y: "100%", opacity: 0 }
              }
              animate={
                isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }
              }
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.08,
              }}
            >
              {siteContent.ui.filmsHeading}
            </motion.h2>
          </div>

          <div className="overflow-mask">
            <motion.p
              initial={
                shouldReduceMotion
                  ? { y: 0, opacity: 1 }
                  : { y: "100%", opacity: 0 }
              }
              animate={
                isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }
              }
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.16,
              }}
            >
              {siteContent.ui.filmSubtitle}
            </motion.p>
          </div>
        </div>

        {/* FILMS LAYOUT: Main Player + Side Thumbnails */}
        <div className="films-layout">
          {/* MAIN PLAYER COLUMN */}
          <motion.div
            initial={
              shouldReduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 24 }
            }
            animate={
              isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
            }
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.25,
            }}
          >
            {/* Mobile Multi-Cam Switcher Bar (fits all phone widths perfectly, zero cut-off) */}
            <div className="md:hidden mb-3.5">
              <div className="grid grid-cols-3 p-1 rounded-xl bg-[#121217] border border-[#2A2A30] gap-1 select-none shadow-lg">
                {filmsData.map((film, idx) => {
                  const isSelected = film.id === activeItem.id;
                  const clientStr = (film.client || "").toLowerCase();
                  const shortName = clientStr.includes("thamira")
                    ? "THAMIRA"
                    : clientStr.includes("mm")
                    ? "MM CARS"
                    : "THOORIGAI";

                  return (
                    <button
                      key={film.id}
                      type="button"
                      onClick={() => handleSwap(film.id)}
                      className={`relative py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center min-w-0 ${
                        isSelected
                          ? "bg-[#C6FF3D] !text-[#0B0B0F] shadow-md shadow-[#C6FF3D]/10 font-bold"
                          : "text-[#A9A7A0] hover:text-[#FFFFFF] hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`block text-[9px] font-mono tracking-widest uppercase leading-tight ${
                          isSelected ? "!text-[#0B0B0F]/70 font-semibold" : "text-[#7E7D88]"
                        }`}
                      >
                        CAM 0{idx + 1}
                      </span>
                      <span
                        className={`block text-[11px] font-mono font-bold uppercase truncate max-w-full leading-tight mt-0.5 ${
                          isSelected ? "!text-[#0B0B0F]" : "text-[#E6E4DF]"
                        }`}
                      >
                        {shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shared Layout Card Container */}
            <motion.div
              layoutId={`film-card-${activeItem.id}`}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="film-player-wrapper"
            >
              <MainPlayer
                item={activeItem}
                isLocked={isInView}
                pulseKey={pulseKey}
                shouldReduceMotion={shouldReduceMotion}
                progress={progress}
                onProgressChange={setProgress}
                playing={playing}
                onTogglePlay={() => setPlaying((v) => !v)}
                muted={muted}
                onToggleMute={() => setMuted((v) => !v)}
              />
            </motion.div>

            {/* Main Caption Line with Cinema Card Styling */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                className="mt-3 p-3.5 sm:p-4 rounded-xl bg-[#141419] border border-[#2A2A30] shadow-lg"
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 6 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6 }
                }
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Header Row: Client Name + Format Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-pulse" />
                    <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight text-[var(--paper)] m-0">
                      {activeItem.client}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full border border-[#C6FF3D]/40 text-[#C6FF3D] font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-[#C6FF3D]/10">
                    {activeItem.format || "16:9 BRAND STORY"}
                  </span>
                </div>

                {/* Story Goal */}
                <p className="text-xs sm:text-sm text-[var(--paper)]/80 font-body leading-relaxed m-0 mb-2.5">
                  {activeItem.goal}
                </p>

                {/* Tech Specs Line */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#2A2A30] text-[9px] sm:text-[10px] font-mono text-[#7E7D88] tracking-widest uppercase">
                  <span className="text-[#C6FF3D] font-bold">SONY FX3</span>
                  <span>•</span>
                  <span>24 FPS</span>
                  <span>•</span>
                  <span>4K DCI</span>
                  <span>•</span>
                  <span>S-CINETONE</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* SIDEBAR THUMBNAILS (Visible as 2-column sidebar on desktop md:grid, hidden on mobile) */}
          <div className="film-list hidden md:grid">
            {sideItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 24 }
                }
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
                }
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.35 + index * 0.1, // Staggered 100ms apart
                }}
              >
                <motion.div
                  layoutId={`film-card-${item.id}`}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <VideoCard
                    item={item}
                    isHovered={hoveredId === item.id}
                    isOtherHovered={hoveredId !== null && hoveredId !== item.id}
                    onHoverStart={() => setHoveredId(item.id)}
                    onHoverEnd={() =>
                      setHoveredId((current) =>
                        current === item.id ? null : current,
                      )
                    }
                    onClick={() => handleSwap(item.id)}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </LayoutGroup>
    </section>
  );
}

export default FilmSection;
