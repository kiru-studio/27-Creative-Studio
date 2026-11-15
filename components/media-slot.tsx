'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Blob } from '@/components/graphics/Blob'
import { Halftone } from '@/components/graphics/Halftone'
import { AlertCircle } from 'lucide-react'

export type MediaSlotProps = {
  label?: string
  src?: string
  poster?: string
  posterSrc?: string
  aspect?: '9/16' | '16/9' | '1/1' | '4/5' | string
  loop?: boolean
  className?: string
  hideLabel?: boolean
  autoPlayInView?: boolean
  controls?: boolean
}

/**
 * Production-ready MediaSlot component:
 * - When no src or poster: displays branded placeholder (Blob + Halftone), not a flat shape
 * - When src present: muted, playsInline, loop, preload="none", loads via IntersectionObserver
 * - Poster is always preserved as fallback/thumbnail
 * - Visible error state if media load fails
 * - Dark text scrim overlay over footage
 */
export function MediaSlot({
  label = '',
  src,
  poster,
  posterSrc,
  aspect,
  loop = true,
  className = '',
  hideLabel = false,
  autoPlayInView = false,
  controls = false,
}: MediaSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [started, setStarted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const activePoster = poster || posterSrc

  // Aspect ratio class calculation
  const aspectClass =
    aspect === '9/16'
      ? 'aspect-[9/16]'
      : aspect === '16/9'
      ? 'aspect-video'
      : aspect === '1/1'
      ? 'aspect-square'
      : aspect === '4/5'
      ? 'aspect-[4/5]'
      : ''

  // IntersectionObserver for video lazy loading
  useEffect(() => {
    if (!src || !containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { rootMargin: '120px' }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [src])

  // Autoplay or play management
  useEffect(() => {
    if (!videoRef.current || !src) return
    if ((isInView && autoPlayInView) || started) {
      void videoRef.current.play().catch(() => {
        setStarted(false)
      })
    } else {
      videoRef.current.pause()
    }
  }, [isInView, autoPlayInView, started, src])

  return (
    <div
      ref={containerRef}
      className={`media-slot relative overflow-hidden bg-[#0E0E14] select-none ${aspectClass} ${className}`}
      aria-hidden={hideLabel ? true : undefined}
    >
      {/* 1. Branded Placeholder when no video src and no poster (Blob + Halftone + 27 mark) */}
      {!src && !activePoster && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#0B0B0B] text-[#EFE6D8]/60 overflow-hidden">
          <Blob color="pink" className="w-32 h-32 top-1/4 -right-8 pointer-events-none" opacity={0.2} />
          <Blob color="lime" className="w-32 h-32 bottom-1/4 -left-8 pointer-events-none" opacity={0.16} />
          <Halftone opacity={0.14} />
          <div className="relative z-10 flex flex-col items-center text-center gap-1">
            <span className="font-display font-black text-2xl tracking-tighter text-[#D4FF3F]">
              27
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#B9B2A5]">
              {label || 'STUDIO PRODUCTION'}
            </span>
          </div>
        </div>
      )}

      {/* 2. Poster Image */}
      {activePoster && (
        <img
          className={`media-poster absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded && (started || autoPlayInView) ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          src={activePoster}
          alt={label || '27 Studio production media'}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* 3. Live Video Element */}
      {src && isInView && !hasError && (
        <video
          ref={videoRef}
          className={`media-video absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={src}
          poster={activePoster}
          controls={controls || started}
          muted={!controls}
          loop={loop}
          playsInline
          preload="none"
          onLoadedData={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          aria-label={label}
        />
      )}

      {/* 4. Visible Error State */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B0B0B]/90 p-4 text-center">
          <AlertCircle className="w-5 h-5 text-[#FF2DA8] mb-1" />
          <span className="font-mono text-[11px] text-[#EFE6D8]">Playback unavailable</span>
        </div>
      )}

      {/* 5. Dark Text Scrim Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-10"
        aria-hidden="true"
      />

      {/* 6. Label & Play Action Button */}
      {!hideLabel && label && (
        <span className="media-label relative z-20 pointer-events-none">{label}</span>
      )}

      {src && !started && !autoPlayInView && !hasError && (
        <button
          className="media-play relative z-20 cursor-pointer"
          type="button"
          onClick={() => setStarted(true)}
          aria-label={`Play ${label || 'media'}`}
        >
          <span aria-hidden="true">▶</span>
        </button>
      )}
    </div>
  )
}

export default MediaSlot
