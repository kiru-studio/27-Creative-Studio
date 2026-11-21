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
  SkipBack,
  SkipForward,
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

    const formatTime = (time: number) => {
      if (isNaN(time) || time < 0) return "00:00";
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

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

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
        setIsMuted(newVolume === 0);
      }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      setCurrentTime(newTime);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
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

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
            {/* Play/Pause Center Overlay */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300",
                !isPlaying || showControlsState ? "opacity-100" : "opacity-0",
              )}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#C6FF3D] hover:text-black hover:border-[#C6FF3D] transition-all duration-200 pointer-events-auto shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent",
                "transition-opacity duration-300 pointer-events-none z-30",
                showControlsState ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 pointer-events-auto">
                {/* Progress Bar & Time Displays */}
                <div className="flex items-center gap-2.5 text-white text-xs font-mono">
                  <span className="min-w-0 tabular-nums text-[11px] text-[#F4F1EA]">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative group/progress flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSeek(e);
                      }}
                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C6FF3D] 
                        [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(198,255,61,0.6)] [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                        group-hover/progress:[&::-webkit-slider-thumb]:scale-125"
                      style={{
                        background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
                      }}
                      aria-label="Seek timeline"
                    />
                  </div>
                  <span className="min-w-0 tabular-nums text-[11px] text-[#A9A7A0]">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        skip(-10);
                      }}
                      className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                      title="Skip -10s (Left Arrow)"
                      aria-label="Skip backward 10 seconds"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="p-1.5 sm:p-2 text-white hover:text-[#C6FF3D] hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                      title="Play/Pause (Space)"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        skip(10);
                      }}
                      className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                      title="Skip +10s (Right Arrow)"
                      aria-label="Skip forward 10 seconds"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-1 group/volume ml-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                        title="Mute / Unmute (M)"
                        aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-[#FF5C5C]" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <div className="w-0 group-hover/volume:w-16 sm:group-hover/volume:w-20 transition-all duration-200 overflow-hidden flex items-center">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleVolumeChange(e);
                          }}
                          className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                            [&::-webkit-slider-thumb]:cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                              (isMuted ? 0 : volume) * 100
                            }%, rgba(255,255,255,0.2) ${
                              (isMuted ? 0 : volume) * 100
                            }%, rgba(255,255,255,0.2) 100%)`,
                          }}
                          aria-label="Volume slider"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFullscreen();
                      }}
                      className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                      title="Fullscreen (F)"
                      aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer, videoPlayerVariants };
