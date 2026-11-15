"use client";

import React from "react";
import { X, ExternalLink, HardDrive, Cloud, FolderPlus, CheckCircle2 } from "lucide-react";

interface MediaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MediaGuideModal({ isOpen, onClose }: MediaGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0B0B0B] border border-[#FF2DA8] rounded-lg shadow-2xl overflow-hidden text-[#D4FF3F]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FF2DA8] bg-[#0B0B0B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF3F] animate-pulse" />
            <h2 className="font-mono text-sm uppercase tracking-wider text-[#D4FF3F] font-semibold">
              Free Media Storage &amp; Hosting Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#FF2DA8] text-[#FF2DA8] hover:text-[#D4FF3F] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs font-mono leading-relaxed">
          {/* Method 1: Google Drive */}
          <div className="p-4 rounded border border-[#FF2DA8] bg-[#0B0B0B]">
            <div className="flex items-center gap-2 text-[#D4FF3F] font-bold text-sm mb-2">
              <HardDrive size={16} />
              <span>Method 1: Google Drive (100% Free · Unlimited Personal Accounts)</span>
            </div>
            <p className="text-[#FF2DA8] mb-3">
              You can paste any standard Google Drive share link directly into any video or image field. The Admin will automatically convert it into a streamable direct link.
            </p>
            <div className="bg-[#0B0B0B] p-3 rounded border border-[#0B0B0B] space-y-2">
              <p className="text-[#D4FF3F] font-semibold">Step-by-step instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-[#FF2DA8]">
                <li>Upload your `.mp4` video or image to your Google Drive.</li>
                <li>Right click the file → Click <strong>Share</strong>.</li>
                <li>Under General access, change from <em>Restricted</em> to <strong>&ldquo;Anyone with the link&rdquo;</strong>.</li>
                <li>Click <strong>Copy link</strong> and paste it directly into this Admin!</li>
              </ol>
            </div>
          </div>

          {/* Method 2: Cloudinary */}
          <div className="p-4 rounded border border-[#D4FF3F]/30 bg-[#0B0B0B]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#D4FF3F] font-bold text-sm">
                <Cloud size={16} />
                <span>Method 2: Cloudinary Free Tier (Recommended for Smooth Videos)</span>
              </div>
              <span className="text-[10px] bg-[#D4FF3F] text-[#0B0B0B] px-2 py-0.5 rounded font-bold">
                BEST PERFORMANCE
              </span>
            </div>
            <p className="text-[#FF2DA8] mb-3">
              Cloudinary offers a free forever plan with <strong>25 GB bandwidth/storage monthly</strong> with zero credit card needed. Unlike Google Drive, it provides true byte-range video streaming (scrubbing &amp; instant iPhone playback).
            </p>
            <div className="bg-[#0B0B0B] p-3 rounded border border-[#0B0B0B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#D4FF3F] font-semibold">Why Cloudinary is superior:</span>
                <a
                  href="https://cloudinary.com/users/register_free"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#D4FF3F] hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  Create Free Account <ExternalLink size={11} />
                </a>
              </div>
              <ul className="space-y-1 text-[#FF2DA8]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#D4FF3F] shrink-0" />
                  Smooth video scrub on mobile &amp; low-end PCs (no 403 quota errors).
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#D4FF3F] shrink-0" />
                  <strong>Instant Video Poster:</strong> Replace <code>.mp4</code> with <code>.jpg</code> at the end of the URL to automatically extract a poster frame!
                </li>
              </ul>
            </div>
          </div>

          {/* Method 3: Local Uploads */}
          <div className="p-4 rounded border border-[#FF2DA8] bg-[#0B0B0B]">
            <div className="flex items-center gap-2 text-[#D4FF3F] font-bold text-sm mb-2">
              <FolderPlus size={16} />
              <span>Method 3: Direct Upload Button (Local &amp; Repository Files)</span>
            </div>
            <p className="text-[#FF2DA8] mb-2">
              Click the <strong>Upload</strong> button next to any field to pick a file directly from your computer. It saves to <code>/public/uploads/</code> and can be committed to GitHub to be served directly by Vercel CDN at zero cost.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-[#FF2DA8] bg-[#0B0B0B]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#D4FF3F] text-[#0B0B0B] font-bold font-mono text-xs hover:bg-[#D4FF3F] transition-colors"
          >
            GOT IT // CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
