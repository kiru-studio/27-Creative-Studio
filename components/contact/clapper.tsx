"use client";

import { useEffect, useRef, useState } from "react";
import { siteContent } from "@/lib/site-content";

interface ClapperProps {
  isShut: boolean;
  reducedMotion?: boolean;
}

export function Clapper({ isShut, reducedMotion = false }: ClapperProps) {
  const [isSnapping, setIsSnapping] = useState(false);
  const snapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (snapTimeout.current) clearTimeout(snapTimeout.current);
    },
    [],
  );

  const handleSnap = () => {
    if (isShut || isSnapping) return;
    setIsSnapping(true);
    snapTimeout.current = setTimeout(() => setIsSnapping(false), 320);
  };

  const topStickClassName = [
    "clapper-stick",
    "clapper-stick-top",
    isShut && "is-shut",
    isSnapping && !reducedMotion && "is-snapping",
    reducedMotion && "is-static",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="clapper-stick-assembly">
      <button
        type="button"
        className={topStickClassName}
        onClick={handleSnap}
        disabled={isShut}
        aria-label={
          isShut
            ? siteContent.ui.clapperShutting
            : siteContent.ui.clapperActionLabel
        }
      >
        <span className="clapper-hinge" aria-hidden="true" />
      </button>
      <div className="clapper-stick clapper-stick-bottom" aria-hidden="true">
        <span className="clapper-hinge" />
      </div>
    </div>
  );
}
