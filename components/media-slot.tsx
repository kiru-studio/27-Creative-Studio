'use client'

import { useEffect, useRef, useState } from 'react'

type MediaSlotProps = {
  label: string
  src?: string
  posterSrc?: string
  loop?: boolean
  className?: string
  hideLabel?: boolean
}

export function MediaSlot({
  label,
  src,
  posterSrc,
  loop = true,
  className = '',
  hideLabel = false,
}: MediaSlotProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started || !videoRef.current) return
    void videoRef.current.play().catch(() => setStarted(false))
  }, [started])

  return (
    <div
      className={`media-slot ${className}`}
      aria-hidden={hideLabel ? true : undefined}
    >
      {started && src ? (
        <video
          ref={videoRef}
          className="media-video"
          src={src}
          controls
          muted
          loop={loop}
          playsInline
          preload="none"
          aria-label={label}
        />
      ) : (
        <>
          {posterSrc ? (
            <img
              className="media-poster"
              src={posterSrc}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="poster-grid" aria-hidden="true" />
          )}
          {!hideLabel && <span className="media-label">{label}</span>}
          {src && (
            <button
              className="media-play"
              type="button"
              onClick={() => setStarted(true)}
              aria-label={label}
            >
              <span aria-hidden="true">▶</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}
