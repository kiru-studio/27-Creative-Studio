import { siteContent } from "@/lib/site-content";
import { MediaSlot } from "@/components/media-slot";

interface BrandLockupProps {
  href: string;
  className?: string;
  onClick?: () => void;
}

export function BrandLockup({
  href,
  className = "",
  onClick,
}: BrandLockupProps) {
  return (
    <a
      href={href}
      className={`brand-lockup ${className}`}
      aria-label={`${siteContent.brand.name} ${siteContent.brand.descriptor}`}
      onClick={onClick}
    >
      <MediaSlot
        label={`${siteContent.brand.name} ${siteContent.brand.descriptor}`}
        posterSrc={siteContent.brand.logoMark}
        className="brand-mark"
        hideLabel
      />
      <span className="brand-descriptor">
        <span className="sr-only">{siteContent.brand.name} </span>
        {siteContent.brand.descriptor}
      </span>
    </a>
  );
}
