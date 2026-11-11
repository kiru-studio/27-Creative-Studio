"use client";

import { MediaSlot } from "@/components/media-slot";
import { siteContent, type WorkItem } from "@/lib/site-content";

interface ReelsSectionProps {
  kicker?: string;
  heading?: string;
  items?: WorkItem[];
  onOpenViewer: (index: number, opener: HTMLElement) => void;
}

export function ReelsSection({
  kicker = siteContent.ui.reelsKicker,
  heading = siteContent.ui.reelsHeading,
  items = siteContent.reels.slice(0, 4),
  onOpenViewer,
}: ReelsSectionProps) {
  return (
    <section
      className="reels-section"
      id="work"
      aria-labelledby="reels-heading"
    >
      <div className="work-heading">
        <div>
          <p className="kicker">{kicker}</p>
          <h2 id="reels-heading">{heading}</h2>
        </div>
      </div>
      <ul className="reels-grid">
        {items.map((item, index) => (
          <li key={item.title}>
            <article className="reel-card">
              <MediaSlot
                className="reel-card-image-frame"
                label={item.client ?? item.title}
                posterAlt={`${item.client ?? item.title}: ${item.title}`}
                posterSrc={item.posterSrc}
                playLabel={siteContent.ui.playWorkLabel}
                onActivate={(opener) => onOpenViewer(index, opener)}
              />
              <span className="reel-card-copy">
                {item.client && <small>{item.client}</small>}
                <strong>{item.title}</strong>
                <span>{item.delivered ?? item.type}</span>
                <span className="reel-card-label">{item.label}</span>
              </span>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ReelsSection;
