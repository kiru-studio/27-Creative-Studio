"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { siteContent } from "@/lib/site-content";

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
  (film, index) => ({
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
    src: film.videoSrc,
    posterSrc: film.posterSrc,
    caption: `${film.client ?? ""} · ${film.type}`,
  }),
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
  onProgressChange: (val: number) => void;
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

  return (
    <div
      className="film-player"
      ref={playerRef}
      role="group"
      aria-label={siteContent.ui.filmPlayerLabel}
    >
      <div className="film-poster">
        {item.src ? (
          <video
            className="film-video"
            src={item.src}
            poster={item.posterSrc}
            controls
            muted={muted}
            playsInline
            preload="none"
            aria-label={item.title}
          />
        ) : (
          <>
            {/* Viewfinder Lock-on Brackets */}
            <ViewfinderBrackets
              isLocked={isLocked}
              pulseKey={pulseKey}
              shouldReduceMotion={shouldReduceMotion}
            />

            {/* Top-left blinking ● REC label (hidden if prefers-reduced-motion) */}
            {!shouldReduceMotion && (
              <motion.div
                className="film-rec-label"
                initial={{ opacity: 0 }}
                animate={isLocked ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                aria-hidden="true"
              >
                <motion.span
                  className="film-rec-dot"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span>REC</span>
              </motion.div>
            )}

            {item.posterSrc && (
              <img className="poster-image" src={item.posterSrc} alt="" />
            )}

            {/* FILM / PLACEHOLDER label: fades in after brackets land + 0.3s */}
            <motion.span
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={isLocked ? { opacity: 1 } : { opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, delay: 0.9 }
              }
            >
              {playing
                ? siteContent.ui.filmPlayingPlaceholder
                : item.label}
            </motion.span>

            {/* Timecode: fades in after brackets land + 0.3s */}
            <motion.b
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={isLocked ? { opacity: 1 } : { opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, delay: 0.9 }
              }
            >
              {item.duration}
            </motion.b>
          </>
        )}
      </div>

      {!item.src && (
        <div className="film-controls">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={
              playing ? siteContent.ui.pauseFilm : siteContent.ui.playFilm
            }
            aria-pressed={playing}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
          <input
            aria-label={siteContent.ui.seekFilm}
            type="range"
            min="0"
            max="100"
            value={progress}
            aria-valuetext={`${progress}%`}
            onChange={(e) => onProgressChange(Number(e.target.value))}
          />
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={
              muted ? siteContent.ui.unmuteFilm : siteContent.ui.muteFilm
            }
            aria-pressed={!muted}
          >
            {muted
              ? siteContent.ui.filmMuteLabel
              : siteContent.ui.filmSoundLabel}
          </button>
          <button
            type="button"
            aria-label={siteContent.ui.fullscreenFilm}
            onClick={() => playerRef.current?.requestFullscreen?.()}
          >
            {siteContent.ui.filmFullscreenLabel}
          </button>
        </div>
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
            alt=""
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
  const shouldReduceMotion = Boolean(useReducedMotion());

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
            {/* Mobile Quick-Switch Film Chips (Visible only on mobile) */}
            <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none select-none">
              {filmsData.map((film, idx) => {
                const isSelected = film.id === activeItem.id;
                return (
                  <button
                    key={film.id}
                    type="button"
                    onClick={() => handleSwap(film.id)}
                    className={`shrink-0 px-3 py-1.5 rounded text-[11px] font-mono tracking-wider uppercase transition-all ${
                      isSelected
                        ? "bg-[#C6FF3D] text-[#0B0B0F] font-bold border border-[#C6FF3D]"
                        : "bg-[#141419] text-[#A9A7A0] border border-[#2A2A30]"
                    }`}
                  >
                    0{idx + 1} // {film.client}
                  </button>
                );
              })}
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

            {/* Main Caption Line with 0.2s AnimatePresence Crossfade */}
            <AnimatePresence mode="wait">
              <motion.p
                key={activeItem.id}
                className="film-caption"
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 4 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -4 }
                }
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <strong>{activeItem.client}</strong> / {activeItem.goal} /{" "}
                {activeItem.format}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* SIDEBAR THUMBNAILS (Fading up 100ms apart on scroll) */}
          <div className="film-list">
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
