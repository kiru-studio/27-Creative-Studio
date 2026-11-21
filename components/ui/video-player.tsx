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
              {/* Real Glass Sphere Play/Pause Orb */}
              <div className="relative group/glass flex items-center justify-center pointer-events-auto">
                {/* 3D Glass Sphere Ambient Shadow */}
                <div className="absolute inset-0 rounded-full bg-black/50 blur-xl scale-90 translate-y-3 pointer-events-none transition-transform duration-300 group-hover/glass:scale-100 group-hover/glass:translate-y-4" />

                {/* Main Physical Glass Orb Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className={cn(
                    "relative w-18 h-18 sm:w-22 sm:h-22 rounded-full",
                    // Real glass transparency and refraction
                    "bg-gradient-to-b from-white/25 via-white/5 to-white/10",
                    "backdrop-blur-md backdrop-saturate-200",
                    // Physical razor-thin glass boundary & inner spherical refraction rings
                    "border border-white/60",
                    "shadow-[0_14px_32px_-4px_rgba(0,0,0,0.5),inset_0_2.5px_4px_0_rgba(255,255,255,0.95),inset_0_-3px_8px_0_rgba(0,0,0,0.35),inset_0_0_14px_2px_rgba(255,255,255,0.35)]",
                    // Hover states
                    "hover:shadow-[0_18px_40px_-4px_rgba(0,0,0,0.6),inset_0_3px_5px_0_rgba(255,255,255,1),inset_0_-4px_10px_0_rgba(0,0,0,0.4),inset_0_0_20px_4px_rgba(198,255,61,0.4)]",
                    "hover:border-white/90",
                    "flex items-center justify-center",
                    "transition-all duration-300 ease-out",
                    "hover:scale-105 active:scale-95 cursor-pointer overflow-hidden",
                  )}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {/* Primary Top Specular Arc Highlight (characteristic of real glass spheres) */}
                  <div
                    className="absolute top-1 inset-x-2.5 h-[48%] rounded-t-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 12%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 80%)",
                    }}
                  />

                  {/* Secondary Bottom Caustic / Rim Bounce Highlight */}
                  <div
                    className="absolute bottom-1 inset-x-4 h-[22%] rounded-b-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 88%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 80%)",
                    }}
                  />

                  {/* Perimeter Glass Lens Refraction Rim (fresnel edge) */}
                  <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />

                  {/* Clean Solid White Icon (like the reference image icon) */}
                  {isPlaying ? (
                    <Pause className="w-8 h-8 sm:w-9 sm:h-9 text-white fill-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] group-hover/glass:text-[#C6FF3D] group-hover/glass:fill-[#C6FF3D] transition-colors duration-200 relative z-10" />
                  ) : (
                    <Play className="w-8 h-8 sm:w-9 sm:h-9 ml-1 text-white fill-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] group-hover/glass:text-[#C6FF3D] group-hover/glass:fill-[#C6FF3D] transition-colors duration-200 relative z-10" />
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
