"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
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
import { VideoPlayer } from "@/components/ui/video-player";

export type FilmVideoItem = {
  id: string;
  title: string;
  client: string;
  categoryTag: string;
  scope: string;
  year: string;
  story: string;
  formatBadge: string;
  duration: string;
  src?: string;
  posterSrc: string;
};

// Real production films data with authentic stills & specific provenance
export const filmsData: FilmVideoItem[] = [
  {
    id: "film-0-thamira",
    title: "Taste of Thoothukudi",
    client: "Thamira Restaurant",
    categoryTag: "RESTAURANT",
    scope: "Shot + Edit + Grade",
    year: "2026",
    story:
      "Brand film shot over two evenings in Polpettai. Cut into a 45-second cinema hero for their website and 3 high-tempo food Reels that drove 10.1K views.",
    formatBadge: "16:9 Brand Film",
    duration: "00:45",
    posterSrc: "/images/films/thamira-film-still.jpg",
    src: "/api/media/stream?id=1VPqiT6ziwmNU0Xmio4TGIvtyXtWdk4eB",
  },
  {
    id: "film-1-mmcars",
    title: "Driven by Trust",
    client: "MM Cars",
    categoryTag: "AUTOMOTIVE",
    scope: "Shot + Edit + Delivery",
    year: "2026",
    story:
      "Automotive showcase shot at the showroom opposite Manikam Mahal. Focused on vehicle walkarounds and transparent buyer handover stories, generating 13.6K views.",
    formatBadge: "16:9 Brand Film",
    duration: "00:50",
    posterSrc: "/images/films/mmcars-film-still.jpg",
  },
  {
    id: "film-2-thoorigai",
    title: "The AI Revolution in Tuticorin",
    client: "ThoorigAI Infotech",
    categoryTag: "TECH & SUMMIT",
    scope: "Summit Coverage + Edit",
    year: "2026",
    story:
      "Full on-ground coverage of AICCI National Startup Summit (Stall C16). Multi-camera capture of student transformations and founder vision, cut into a 65-second brand film.",
    formatBadge: "16:9 Summit Film",
    duration: "01:05",
    posterSrc: "/images/films/thoorigai-film-still.jpg",
    src: "/api/media/stream?id=1zAjKAtnYReYBw4gLJaSiamQ538nNBagN",
  },
];

// Single Organic Hand-Drawn Marker Scribble (Human Touch)
function PlayButtonScribble() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] pointer-events-none text-[#C6FF3D]/75 select-none -rotate-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M 52,12 C 76,11 92,28 91,52 C 90,75 72,90 48,89 C 24,88 9,72 11,48 C 13,24 33,10 56,11 C 70,12 85,22 88,40"
      />
    </svg>
  );
}

// MAIN PLAYER COMPONENT
interface MainPlayerProps {
  item: FilmVideoItem;
  progress: number;
  onProgressChange: React.Dispatch<React.SetStateAction<number>>;
  playing: boolean;
  onTogglePlay: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export function MainPlayer({
  item,
  progress,
  onProgressChange,
  playing,
  onTogglePlay,
  muted,
  onToggleMute,
}: MainPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance progress when playing without a direct backend stream
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
      setIsControlsVisible(false); // Hidden when paused per instruction 5
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [playing]);

  const handlePointerInteraction = () => {
    if (!playing) return;
    setIsControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 2500);
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
      className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#0A0A0E] border border-[#2A2A30] shadow-2xl flex items-center justify-center select-none group"
      role="group"
      aria-label={siteContent.ui.filmPlayerLabel || "Film player"}
      onMouseMove={handlePointerInteraction}
      onTouchStart={handlePointerInteraction}
    >
      {item.src && playing ? (
        <VideoPlayer
          src={item.src}
          poster={item.posterSrc}
          className="w-full h-full"
          objectFit="cover"
          preload="none"
          autoPlay={true}
          onPlay={() => !playing && onTogglePlay()}
          onPause={() => playing && onTogglePlay()}
        />
      ) : (
        <>
          {/* Authentic 16:9 Still filling the frame */}
          <img
            src={item.posterSrc}
            alt={`${item.client} — ${item.title}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {/* Subtle contrast gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40 pointer-events-none" />

          {/* Real Production Metadata Stamp (Replaces fake STANDBY HUD) */}
          <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-20 pointer-events-none select-none max-w-[calc(100%-20px)]">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-white/90 text-[11px] sm:text-[13px] font-sans font-medium tracking-normal whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="truncate">{item.client}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/70">{item.year}</span>
              <span className="text-white/40">·</span>
              <span className="text-[#C6FF3D] font-mono text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
                {item.scope}
              </span>
            </div>
          </div>

          {/* Single Center Play Button with Hand-drawn Scribble */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative flex items-center justify-center">
              <PlayButtonScribble />
              <button
                type="button"
                onClick={onTogglePlay}
                className="relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#C6FF3D] text-[#0B0B0F] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:scale-110 active:scale-95 hover:shadow-[0_0_28px_rgba(198,255,61,0.5)] outline-none"
                aria-label="Play film"
              >
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Control Bar: ONLY visible during active playback (Point 5) */}
      {playing && (
        <div
          className={`absolute bottom-3 left-3 right-3 z-30 flex items-center gap-3 px-3 py-2 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 transition-opacity duration-300 ${
            isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Play/Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-1 text-[#C6FF3D] hover:scale-110 transition-transform cursor-pointer outline-none shrink-0"
            aria-label="Pause"
          >
            <Pause className="w-4 h-4 fill-current" />
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

          {/* Mute Button (Pure White icon, NOT error red - Point 4) */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer outline-none shrink-0"
            title={muted ? "Unmute audio" : "Mute audio"}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-white/90" />
            ) : (
              <Volume2 className="w-4 h-4 text-white/90" />
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer outline-none shrink-0"
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
      )}
    </div>
  );
}

// PLAYLIST ITEM COMPONENT (Horizontal card with compact 16:9 thumbnail beside title)
interface PlaylistItemProps {
  item: FilmVideoItem;
  isActive: boolean;
  onSelect: () => void;
}

function PlaylistItem({ item, isActive, onSelect }: PlaylistItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!item.src || !videoRef.current) return;
    if (isHovered && !isActive) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isActive, item.src]);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3.5 ${
        isActive
          ? "bg-[#16161D] border-[#C6FF3D]/50 shadow-lg shadow-black/40"
          : "bg-[#111116] border-[#22222A] hover:bg-[#16161D] hover:border-white/20"
      }`}
    >
      {/* 16:9 Compact Thumbnail */}
      <div className="relative w-28 sm:w-36 aspect-[16/9] rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
        {item.src ? (
          <video
            ref={videoRef}
            src={item.src}
            poster={item.posterSrc}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
        ) : (
          <img
            src={item.posterSrc}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Play Icon Overlay on Thumbnail */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            isActive ? "bg-black/40" : "bg-black/30 group-hover:bg-black/10"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
              isActive ? "bg-[#C6FF3D] text-[#0B0B0F]" : "bg-black/60 text-white group-hover:scale-110"
            }`}
          >
            <Play className="w-3 h-3 fill-current translate-x-0.2" />
          </div>
        </div>
      </div>

      {/* Title & Metadata on the Right */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Top: Category Tag + Duration + Hot Pink "NOW PLAYING" */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-mono text-[10px] text-[#A9A7A0] tracking-wider uppercase">
            {item.categoryTag}
          </span>
          <span className="text-[#A9A7A0]/40 text-xs">·</span>
          <span className="font-mono text-[10px] text-[#A9A7A0] tabular-nums">
            {item.duration}
          </span>
          {isActive && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-[#FF2D55] text-white font-mono text-[9px] font-bold tracking-wider uppercase">
              NOW PLAYING
            </span>
          )}
        </div>

        {/* Project Name (Big, tight display face) */}
        <h4 className="font-display font-black text-base sm:text-lg text-[var(--paper)] tracking-tight uppercase leading-tight truncate m-0 group-hover:text-white transition-colors">
          {item.client}
        </h4>

        {/* Scope and Year */}
        <p className="font-sans text-xs text-[var(--muted)] truncate mt-0.5 m-0">
          {item.scope} · {item.year}
        </p>
      </div>
    </button>
  );
}

// MAIN FILM SECTION COMPONENT
export function FilmSection() {
  const [videos] = useState<FilmVideoItem[]>(filmsData);
  const [activeId, setActiveId] = useState<string>(filmsData[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-12% 0px" });
  const shouldReduceMotion = useHydratedReducedMotion();

  const activeItem = videos.find((v) => v.id === activeId) ?? videos[0];

  const handleSelectFilm = (id: string) => {
    setActiveId(id);
    setProgress(0);
    setPlaying(false);
  };

  if (!activeItem) return null;

  return (
    <section
      className="films-section"
      id="films"
      ref={sectionRef}
      aria-labelledby="films-heading"
    >
      {/* SECTION INTRO */}
      <div className="section-intro mb-8">
        <div className="overflow-mask-inline">
          <motion.p
            className="kicker"
            initial={shouldReduceMotion ? false : { y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {siteContent.ui.filmsKicker || "The Longer Cut"}
          </motion.p>
        </div>

        <div className="overflow-mask">
          <motion.h2
            id="films-heading"
            initial={shouldReduceMotion ? false : { y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.08,
            }}
          >
            {siteContent.ui.filmsHeading || "Films with room to breathe."}
          </motion.h2>
        </div>

        <div className="overflow-mask">
          <motion.p
            initial={shouldReduceMotion ? false : { y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.16,
            }}
          >
            {siteContent.ui.filmSubtitle ||
              "Cinematic stories, built for local authority and lasting attention."}
          </motion.p>
        </div>
      </div>

      {/* FILMS LAYOUT: Main Cinema Player + Playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN PLAYER COLUMN (7 cols on large desktop) */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Mobile Quick Switcher (< lg) */}
          <div className="lg:hidden mb-3">
            <div className="grid grid-cols-3 p-1 rounded-xl bg-[#121217] border border-[#2A2A30] gap-1 select-none">
              {videos.map((film, idx) => {
                const isSelected = film.id === activeItem.id;
                const shortName = film.client.replace(/ (Restaurant|Infotech)/g, "");
                return (
                  <button
                    key={film.id}
                    type="button"
                    onClick={() => handleSelectFilm(film.id)}
                    className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center min-w-0 ${
                      isSelected
                        ? "bg-[#C6FF3D] !text-[#0B0B0F] font-bold shadow-md"
                        : "text-[#A9A7A0] hover:text-white"
                    }`}
                  >
                    <span
                      className={`block text-[9px] font-mono tracking-widest uppercase leading-tight ${
                        isSelected ? "!text-[#0B0B0F]/70 font-semibold" : "text-[#7E7D88]"
                      }`}
                    >
                      FILM 0{idx + 1}
                    </span>
                    <span className="block text-[11px] font-sans font-bold uppercase truncate max-w-full leading-tight mt-0.5">
                      {shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Cinema Player with Real Still */}
          <MainPlayer
            item={activeItem}
            progress={progress}
            onProgressChange={setProgress}
            playing={playing}
            onTogglePlay={() => setPlaying((v) => !v)}
            muted={muted}
            onToggleMute={() => setMuted((v) => !v)}
          />

          {/* Grounded, Specific Production Caption Card (Points 3, 5, 6) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              className="mt-4 p-4 sm:p-5 rounded-xl bg-[#121217] border border-[#22222A]"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Header: Project Name + Format Badge (No green dots - Point 5) */}
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[var(--paper)] m-0">
                  {activeItem.client}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full border border-white/20 text-white/90 font-mono text-[10px] tracking-wider uppercase font-semibold bg-white/5">
                  {activeItem.formatBadge}
                </span>
              </div>

              {/* Specific, honest copy (Point 3) */}
              <p className="text-sm sm:text-base text-[var(--paper)]/85 font-sans leading-relaxed m-0 mb-3">
                {activeItem.story}
              </p>

              {/* Real Production Credits Line */}
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-sans text-[var(--muted)]">
                <span>Thoothukudi, Tamil Nadu</span>
                <span className="font-medium text-white/70">
                  Directed & Produced by 27 Creative Studio
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* PLAYLIST COLUMN (5 cols on large desktop, full width on mobile - Point 7) */}
        <div className="lg:col-span-5 flex flex-col gap-3 mt-4 lg:mt-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs text-[var(--muted)] uppercase tracking-widest font-semibold">
              FILM REPERTORY ({videos.length})
            </span>
            <span className="font-mono text-[11px] text-[var(--muted)]/60">
              CLICK TO LOAD
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {videos.map((film) => (
              <PlaylistItem
                key={film.id}
                item={film}
                isActive={film.id === activeItem.id}
                onSelect={() => handleSelectFilm(film.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FilmSection;