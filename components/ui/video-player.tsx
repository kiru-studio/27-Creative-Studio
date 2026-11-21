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
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#C6FF3D] hover:text-black hover:border-[#C6FF3D] transition-all duration-200 pointer-events-auto shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 sm:w-8 sm:h-8" />
                ) : (
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" />
                )}
              </button>
            </div>

            {/* Bottom HUD Bar: ONLY Mute (Left) and Fullscreen (Right) */}
            <div
              className={cn(
                "absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30 transition-opacity duration-300",
                !isPlaying || showControlsState ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Mute / Unmute Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className={cn(
                  "px-3 py-2 rounded-lg bg-black/75 backdrop-blur-md border transition-all duration-200 cursor-pointer pointer-events-auto flex items-center gap-2 text-white shadow-xl hover:scale-105 active:scale-95",
                  isMuted || volume === 0
                    ? "border-[#FF5C5C]/60 text-[#FF5C5C] hover:bg-[#FF5C5C]/20"
                    : "border-white/20 hover:border-[#C6FF3D]/70 hover:text-[#C6FF3D] hover:bg-black/90",
                )}
                title={isMuted || volume === 0 ? "Unmute audio (M)" : "Mute audio (M)"}
                aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#FF5C5C]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#C6FF3D]" />
                )}
                <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-[#F4F1EA]">
                  {isMuted || volume === 0 ? "MUTED" : "SOUND ON"}
                </span>
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="px-3 py-2 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-[#F4F1EA] hover:text-[#C6FF3D] hover:border-[#C6FF3D]/70 hover:bg-black/90 transition-all duration-200 cursor-pointer pointer-events-auto shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95"
                title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 text-[#C6FF3D]" />
                ) : (
                  <Maximize className="w-4 h-4 text-[#C6FF3D]" />
                )}
                <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-[#F4F1EA]">
                  {isFullscreen ? "MINIMIZE" : "FULLSCREEN"}
                </span>
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
