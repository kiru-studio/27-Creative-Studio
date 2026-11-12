"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MediaSlot } from "@/components/media-slot";
import { siteContent } from "@/lib/site-content";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";

export interface FilmTestimonial {
  id: string;
  frameId: string;
  quote: string;
  author: string;
  role: string;
  avatarUrl: string;
  iso: string;
}

export interface FilmStripStaggerTestimonialsProps {
  testimonials?: FilmTestimonial[];
  speedMultiplier?: number;
  pauseOnHover?: boolean;
  className?: string;
  columnTilts?: [string?, string?, string?];
}

const filmTestimonials: FilmTestimonial[] = siteContent.testimonials.map(
  (item, index) => ({
    id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    frameId: `${siteContent.ui.filmExposurePrefix}${String(index + 1).padStart(2, "0")}`,
    quote: item.quote,
    author: item.name,
    role: item.role,
    avatarUrl: "",
    iso: siteContent.ui.filmIsoLabel,
  }),
);

const columns = [
  { duration: 24, direction: "up", offset: 0, tilt: "-0.5deg" },
  { duration: 32, direction: "down", offset: 1, tilt: "0.5deg" },
  { duration: 28, direction: "up", offset: 2, tilt: "-0.25deg" },
] as const;

const sprocketHoles = Array.from({ length: 10 }, (_, index) => index);

function initials(author: string) {
  return author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function FilmStripStaggerTestimonials({
  testimonials = filmTestimonials,
  speedMultiplier = 1,
  pauseOnHover = true,
  className = "",
  columnTilts = [],
}: FilmStripStaggerTestimonialsProps) {
  const shouldReduceMotion = useHydratedReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(stageRef, { margin: "80px" });

  if (!Number.isFinite(speedMultiplier) || speedMultiplier <= 0) {
    throw new RangeError("speedMultiplier must be a positive, finite number.");
  }

  if (testimonials.length === 0) return null;

  return (
    <section
      id="quotes"
      className={`testimonials-section filmstrip-testimonials ${className}`.trim()}
      aria-labelledby="testimonials-heading"
    >
      <div className="testimonials-grain-overlay" aria-hidden="true" />
      <div className="section-intro relative z-10 filmstrip-intro">
        <p className="kicker">{siteContent.ui.testimonialsKicker}</p>
        <h2 id="testimonials-heading">{siteContent.ui.testimonialsHeading}</h2>
      </div>

      <div
        ref={stageRef}
        className="filmstrip-stage relative z-10"
        data-paused={shouldReduceMotion || !isInView}
        data-pause-on-hover={pauseOnHover}
        role="region"
        aria-roledescription="carousel"
        aria-label={siteContent.ui.testimonialsCarouselLabel}
      >
        {columns.map((column, columnIndex) => {
          const tilt = columnTilts[columnIndex] ?? column.tilt;
          const orderedItems = [
            ...testimonials.slice(column.offset),
            ...testimonials.slice(0, column.offset),
          ];

          return (
            <div
              key={columnIndex}
              className="filmstrip-column"
              data-direction={column.direction}
              style={{ rotate: tilt }}
              aria-hidden={columnIndex > 0}
            >
              <div
                className="filmstrip-track"
                style={{
                  animationDuration: `${column.duration / speedMultiplier}s`,
                }}
              >
                {[0, 1].map((copyIndex) => (
                  <div
                    key={copyIndex}
                    className="filmstrip-loop"
                    aria-hidden={copyIndex === 1}
                  >
                    {orderedItems.map((item) => (
                      <motion.figure
                        key={`${copyIndex}-${item.id}`}
                        className="filmstrip-frame"
                        tabIndex={columnIndex === 0 && copyIndex === 0 ? 0 : -1}
                        whileHover={
                          shouldReduceMotion
                            ? undefined
                            : { scale: 1.02 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 26,
                        }}
                      >
                        <div
                          className="filmstrip-sprocket-rail"
                          aria-hidden="true"
                        >
                          {sprocketHoles.map((hole) => (
                            <span
                              className="filmstrip-sprocket-hole"
                              key={hole}
                            />
                          ))}
                        </div>

                        <div className="filmstrip-exposure">
                          <header className="filmstrip-stamp">
                            <MediaSlot
                              label={`${siteContent.brand.name} ${siteContent.brand.descriptor}`}
                              posterSrc={siteContent.brand.logoMark}
                              className="filmstrip-logo"
                              hideLabel
                            />
                            <span>{item.frameId}</span>
                            <span>{item.iso}</span>
                          </header>
                          <blockquote className="filmstrip-quote">
                            “{item.quote}”
                          </blockquote>
                          <figcaption className="filmstrip-footer">
                            <span className="filmstrip-author">
                              {item.avatarUrl ? (
                                <MediaSlot
                                  label={item.author}
                                  posterSrc={item.avatarUrl}
                                  className="filmstrip-avatar"
                                  hideLabel
                                />
                              ) : (
                                <span
                                  className="filmstrip-avatar filmstrip-initials"
                                  aria-hidden="true"
                                >
                                  {initials(item.author)}
                                </span>
                              )}
                              <span className="filmstrip-byline">
                                <strong>{item.author}</strong>
                                <span>{item.role}</span>
                              </span>
                            </span>
                            <span className="filmstrip-rate">
                              <span aria-hidden="true">▶</span>
                              {siteContent.ui.filmRateLabel}
                            </span>
                          </figcaption>
                        </div>

                        <div
                          className="filmstrip-sprocket-rail"
                          aria-hidden="true"
                        >
                          {sprocketHoles.map((hole) => (
                            <span
                              className="filmstrip-sprocket-hole"
                              key={hole}
                            />
                          ))}
                        </div>
                      </motion.figure>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FilmStripStaggerTestimonials;
