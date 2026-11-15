"use client";

import { heroConfig } from "@/data/hero";

interface CameraMenuProps {
  className?: string;
  onNavigate?: () => void;
}

export function CameraMenu({ className = "" }: CameraMenuProps) {
  const { cameraReadout } = heroConfig;
  const readoutText = `${cameraReadout.resolution} · ${cameraReadout.fps} · ${cameraReadout.aperture} · ${cameraReadout.iso}`;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Camera Readout Cluster (Desktop & Tablet) */}
      <span className="font-mono text-xs tracking-widest text-[#D4FF3F] font-bold select-none border border-[#D4FF3F] px-2.5 py-1 bg-[#0B0B0B]">
        {readoutText}
      </span>
    </div>
  );
}

export const CameraReadout = CameraMenu;

