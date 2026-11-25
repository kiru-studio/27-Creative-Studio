"use client";

import { heroConfig } from "@/data/hero";
import { siteContent } from "@/lib/site-content";

interface CameraMenuProps {
  className?: string;
  onNavigate?: () => void;
}

export function CameraMenu({ className = "" }: CameraMenuProps) {
  const cameraReadout = siteContent.hero?.cameraReadout || heroConfig.cameraReadout;
  const readoutText = `${cameraReadout.resolution} · ${cameraReadout.fps} · ${cameraReadout.aperture} · ${cameraReadout.iso}`;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Camera Readout Cluster (Desktop & Tablet, 60% opacity) */}
      <span className="font-mono text-xs tracking-widest text-[var(--paper)] opacity-60 select-none">
        {readoutText}
      </span>
    </div>
  );
}

export const CameraReadout = CameraMenu;

