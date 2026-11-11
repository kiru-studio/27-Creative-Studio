"use client";

import { MediaSlot } from "@/components/media-slot";
import { siteContent } from "@/lib/site-content";
import { heroConfig } from "@/data/hero";

export function Hero() {
  return (
    <section
      id="hero"
      className="hero-section"
      aria-labelledby="hero-heading"
    >
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="hero-eyebrow">{heroConfig.eyebrow}</p>
          <h1 id="hero-heading">
            {heroConfig.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="hero-description">{heroConfig.body}</p>
          <div className="hero-actions">
            <a className="hero-primary" href={heroConfig.ctaHref}>
              {heroConfig.ctaText}
            </a>
            <a className="hero-secondary" href="#work">
              {heroConfig.secondaryCtaText}
            </a>
          </div>
        </div>
        <div className="hero-feature-wrap">
          <MediaSlot
            className="hero-feature"
            label={heroConfig.reelLabel}
            posterAlt={siteContent.hero.posterAlt}
            posterSrc={heroConfig.posterSrc}
            src={heroConfig.videoSrc}
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
