"use client";

import { useState } from "react";
import Image from "next/image";
import { VideoPlayer } from "./video-player";
import { siteContent } from "@/lib/site-content";

type MediaSlotProps = {
  label: string;
  posterAlt?: string;
  src?: string;
  posterSrc?: string;
  loading?: "eager" | "lazy";
  loop?: boolean;
  className?: string;
  playLabel?: string;
  onActivate?: (opener: HTMLButtonElement) => void;
}

export function MediaSlot({
  label,
  posterAlt = "",
  src,
  posterSrc,
  loading = "lazy",
  loop = true,
  className = "",
  playLabel = siteContent.ui.mediaPlayLabel,
  onActivate,
}: MediaSlotProps) {
  const [started, setStarted] = useState(false);

  return (
    <div className={`media-slot ${className}`}>
      {started && src ? (
        <VideoPlayer
          src={src}
          poster={posterSrc}
          title={label}
          loop={loop}
          autoPlay={true}
          muted={true}
          className="w-full h-full border-0"
        />
      ) : (
        <>
          {posterSrc ? (
            <Image
              className="media-poster"
              src={posterSrc}
              alt={posterAlt}
              fill
              sizes="(max-width: 48rem) 100vw, 58vw"
              loading={loading}
            />
          ) : (
            <div className="poster-grid" aria-hidden="true" />
          )}
          <span className="media-label">{label}</span>
          {(src || onActivate) && (
            <button
              className="media-play"
              type="button"
              onClick={(event) => {
                if (onActivate) {
                  onActivate(event.currentTarget);
                  return;
                }
                setStarted(true);
              }}
              aria-label={`${playLabel}: ${label}`}
              aria-haspopup={onActivate ? "dialog" : undefined}
            >
              <span aria-hidden="true">▶</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
