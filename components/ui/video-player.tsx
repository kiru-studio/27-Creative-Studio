"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";

const videoPlayerVariants = cva(
  "relative w-full bg-black rounded-card overflow-hidden group select-none",
  {
    variants: {
      size: {
        sm: "max-w-md",
        default: "max-w-2xl",
        lg: "max-w-4xl",
        full: "w-full",
      },
    },
    defaultVariants: {
      size: "full",
    },
  },
);

export interface VideoPlayerProps
  extends React.VideoHTMLAttributes<HTMLVideoElement>,
    VariantProps<typeof videoPlayerVariants> {
  src: string;
  poster?: string;
  showControls?: boolean;
  autoHide?: boolean;
  className?: string;
  videoClassName?: string;
  objectFit?: "cover" | "contain";
  accentColor?: string;
}

const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      className,
      videoClassName,
      size = "full",
      src,
      poster,
      showControls = true,
      autoHide = true,
      objectFit = "contain",
      accentColor = "#C6FF3D",
      onTimeUpdate,
      onPlay,
      onPause,
      onWaiting,
      onPlaying,
      ...props
    },
    ref,
  ) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [showControlsState, setShowControlsState] = React.useState(true);

    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const hideControlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useImperativeHandle(ref, () => videoRef.current!, []);

    const togglePlay = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {});
        }
      }
    };

    const toggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    };

    const skip = (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(
          0,
          Math.min(duration, currentTime + seconds),
        );
      }
    };

    const resetHideControlsTimeout = () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }

      if (autoHide && isPlaying) {
        hideControlsTimeoutRef.current = setTimeout(() => {
          setShowControlsState(false);
        }, 2800);
      }
    };

    const handleMouseMove = () => {
      setShowControlsState(true);
      resetHideControlsTimeout();
    };

    React.useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };

      const handleInternalTimeUpdate = (e: Event) => {
        setCurrentTime(video.currentTime);
        if (onTimeUpdate) {
          onTimeUpdate(e as unknown as React.SyntheticEvent<HTMLVideoElement, Event>);
        }
      };

      const handleInternalPlay = (e: Event) => {
        setIsPlaying(true);
        resetHideControlsTimeout();
        if (onPlay) {
          onPlay(e as unknown as React.SyntheticEvent<HTMLVideoElement, Event>);
        }
      };

      const handleInternalPause = (e: Event) => {
        setIsPlaying(false);
        setShowControlsState(true);
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
        if (onPause) {
          onPause(e as unknown as React.SyntheticEvent<HTMLVideoElement, Event>);
        }
      };

      const handleInternalWaiting = (e: Event) => {
        if (onWaiting) {
          onWaiting(e as unknown as React.SyntheticEvent<HTMLVideoElement, Event>);
        }
      };

      const handleInternalPlaying = (e: Event) => {
        if (onPlaying) {
          onPlaying(e as unknown as React.SyntheticEvent<HTMLVideoElement, Event>);
        }
      };

      const handleInternalVolumeChange = () => {
        setVolume(video.volume);
        setIsMuted(video.muted);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("timeupdate", handleInternalTimeUpdate);
      video.addEventListener("play", handleInternalPlay);
      video.addEventListener("pause", handleInternalPause);
      video.addEventListener("waiting", handleInternalWaiting);
      video.addEventListener("playing", handleInternalPlaying);
      video.addEventListener("volumechange", handleInternalVolumeChange);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("timeupdate", handleInternalTimeUpdate);
        video.removeEventListener("play", handleInternalPlay);
        video.removeEventListener("pause", handleInternalPause);
        video.removeEventListener("waiting", handleInternalWaiting);
        video.removeEventListener("playing", handleInternalPlaying);
        video.removeEventListener("volumechange", handleInternalVolumeChange);
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
      };
    }, [autoHide, isPlaying, onTimeUpdate, onPlay, onPause, onWaiting, onPlaying]);

    React.useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }, []);

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!containerRef.current?.contains(document.activeElement)) return;

        switch (e.key) {
          case " ":
          case "k":
          case "K":
            e.preventDefault();
            togglePlay();
            break;
          case "m":
          case "M":
            e.preventDefault();
            toggleMute();
            break;
          case "f":
          case "F":
            e.preventDefault();
            toggleFullscreen();
            break;
          case "ArrowLeft":
            e.preventDefault();
            skip(-10);
            break;
          case "ArrowRight":
            e.preventDefault();
            skip(10);
            break;
          case "ArrowUp":
            e.preventDefault();
            setVolume((prev) => Math.min(1, prev + 0.1));
            break;
          case "ArrowDown":
            e.preventDefault();
            setVolume((prev) => Math.max(0, prev - 0.1));
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [currentTime, duration]);

    return (
      <div
        ref={containerRef}
        className={cn(videoPlayerVariants({ size }), "outline-none", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => autoHide && isPlaying && setShowControlsState(false)}
        onContextMenu={(e) => e.preventDefault()}
        tabIndex={0}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={cn(
            "w-full h-full bg-black cursor-pointer",
            objectFit === "contain" ? "object-contain" : "object-cover",
            videoClassName,
          )}
          onClick={togglePlay}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          playsInline
          {...props}
        />

        {showControls && (
          <>
            {/* Play/Pause Center Overlay (Hover to reveal when playing, visible when paused) */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-20",
                !isPlaying || showControlsState ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Liquid Glass Play/Pause Container */}
              <div className="relative group/liquid flex items-center justify-center pointer-events-auto">
                {/* Ambient liquid lighting glow with vibrant color accents */}
                <div
                  className={cn(
                    "absolute -inset-3 rounded-[32px] blur-xl transition-all duration-500 pointer-events-none",
                    "bg-gradient-to-tr from-[#C6FF3D]/30 via-cyan-400/20 to-purple-500/25",
                    "opacity-70 group-hover/liquid:opacity-100 group-hover/liquid:scale-115",
                  )}
                />

                {/* Main Liquid Glass Button: Frosted translucent surface, glossy specular reflections, 3D beveled rim */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className={cn(
                    "relative w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] sm:rounded-[28px]",
                    "bg-gradient-to-b from-white/30 via-white/10 to-white/5",
                    "backdrop-blur-2xl backdrop-saturate-150",
                    "border border-white/40 hover:border-white/70",
                    "shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.35),0_12px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(198,255,61,0.2)]",
                    "hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_6px_rgba(198,255,61,0.35),0_16px_40px_rgba(0,0,0,0.55),0_0_36px_rgba(198,255,61,0.45)]",
                    "flex items-center justify-center",
                    "transition-all duration-300 ease-out",
                    "hover:scale-105 active:scale-95 cursor-pointer overflow-hidden",
                  )}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {/* Glossy liquid specular reflection arc across the top */}
                  <div className="absolute inset-x-2 top-1.5 h-[44%] rounded-t-[20px] bg-gradient-to-b from-white/50 via-white/15 to-transparent pointer-events-none" />

                  {/* Internal liquid color refraction pill */}
                  <div className="absolute inset-x-3 bottom-1.5 h-2 rounded-full bg-gradient-to-r from-cyan-400/20 via-[#C6FF3D]/40 to-fuchsia-400/20 blur-[2px] pointer-events-none" />

                  {/* Play / Pause Icon with energetic luminous contrast */}
                  {isPlaying ? (
                    <Pause className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover/liquid:text-[#C6FF3D] group-hover/liquid:drop-shadow-[0_0_12px_rgba(198,255,61,0.9)] transition-all duration-200 relative z-10" />
                  ) : (
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 text-white fill-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover/liquid:text-[#C6FF3D] group-hover/liquid:fill-[#C6FF3D] group-hover/liquid:drop-shadow-[0_0_12px_rgba(198,255,61,0.9)] transition-all duration-200 relative z-10" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom HUD Bar: ONLY Mute (Left) and Fullscreen (Right) — pure icon buttons, no background overlay, no text */}
            <div
              className={cn(
                "absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30 transition-opacity duration-300",
                !isPlaying || showControlsState ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Mute / Unmute Button (Icon only) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="p-2 text-white/90 hover:text-[#C6FF3D] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto drop-shadow-md"
                title={isMuted || volume === 0 ? "Unmute audio (M)" : "Mute audio (M)"}
                aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-[#FF5C5C]" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              {/* Fullscreen Button (Icon only) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="p-2 text-white/90 hover:text-[#C6FF3D] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto drop-shadow-md"
                title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-[#C6FF3D]" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer, videoPlayerVariants };
