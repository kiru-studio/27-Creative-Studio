"use client";

import React, { useState } from "react";
import { Eye, X, Check, Film, Image as ImageIcon, Sparkles, ExternalLink } from "lucide-react";
import { parseMediaUrl, normalizeMediaInput } from "@/lib/media-utils";

interface SmartMediaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mediaType: "video" | "image";
  placeholder?: string;
  helpText?: string;
  onGeneratePoster?: (posterUrl: string) => void;
}

export function SmartMediaInput({
  label,
  value = "",
  onChange,
  mediaType,
  placeholder,
  helpText,
  onGeneratePoster,
}: SmartMediaInputProps) {
  const [showPreview, setShowPreview] = useState(true);

  const parsed = parseMediaUrl(value, mediaType);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Auto-normalize if it's a Google Drive share link
    const normalized = normalizeMediaInput(raw, mediaType);
    onChange(normalized);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs uppercase tracking-wider text-[#A9A7A0] flex items-center gap-1.5">
          {mediaType === "video" ? <Film size={13} className="text-[#C6FF3D]" /> : <ImageIcon size={13} className="text-[#C6FF3D]" />}
          <span>{label}</span>
        </label>
        {value && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[11px] font-mono text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors inline-flex items-center gap-1"
            >
              <Eye size={12} /> {showPreview ? "Hide preview" : "Show preview"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] font-mono text-[#FF5C5C] hover:text-white transition-colors inline-flex items-center gap-0.5"
            >
              <X size={12} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Input container */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={
            placeholder ||
            (mediaType === "video"
              ? "Paste Google Drive or video URL (e.g. drive.google.com/file/d/...)"
              : "Paste Google Drive or image URL (e.g. drive.google.com/file/d/...)")
          }
          className="w-full bg-[#141418] border border-[#2A2A30] focus:border-[#C6FF3D] rounded px-3 py-2 text-xs font-mono text-[#F4F1EA] placeholder-[#666] outline-none transition-colors"
        />
      </div>

      {/* Smart Status Badges & Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        {parsed.isGoogleDrive && (
          <span className="inline-flex items-center gap-1 text-[#C6FF3D] bg-[#C6FF3D]/10 px-2 py-0.5 rounded border border-[#C6FF3D]/30 text-[10px]">
            <Check size={11} /> DRIVE LINKED
          </span>
        )}

        {parsed.posterSuggestionUrl && onGeneratePoster && (
          <button
            type="button"
            onClick={() => onGeneratePoster(parsed.posterSuggestionUrl!)}
            className="inline-flex items-center gap-1 text-[#0B0B0F] !text-[#0B0B0F] bg-[#C6FF3D] hover:bg-[#b0f025] px-2 py-0.5 rounded font-bold transition-colors text-[10px] tracking-wider uppercase"
            style={{ color: "#0B0B0F" }}
            title="Auto-extracts first video frame as poster image"
          >
            <Sparkles size={11} style={{ color: "#0B0B0F" }} />
            <span style={{ color: "#0B0B0F" }}>AUTO POSTER</span>
          </button>
        )}

        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-[#A9A7A0] hover:text-[#C6FF3D] inline-flex items-center gap-1 transition-colors ml-auto text-[10px] uppercase"
          >
            RAW ↗
          </a>
        )}
      </div>

      {/* Help text */}
      {helpText && !parsed.isGoogleDrive && (
        <p className="text-[11px] font-mono text-[#777] leading-relaxed">
          {helpText}
        </p>
      )}

      {/* Live Preview Box */}
      {value && showPreview && (
        <div className="mt-1.5 rounded border border-[#2A2A30] bg-[#0E0E12] overflow-hidden p-2 flex flex-col items-center justify-center">
          {mediaType === "video" ? (
            <div className="w-full flex flex-col items-center">
              <video
                src={parsed.streamUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-56 rounded bg-black object-contain"
                onError={() => {
                  // Silent fallback if direct video fails (e.g. permission or format)
                }}
              />
              <span className="font-mono text-[9px] text-[#666] uppercase tracking-wider mt-1">24FPS PREVIEW</span>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={parsed.streamUrl}
                alt={label}
                className="w-full max-h-48 rounded object-contain bg-black/40"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="font-mono text-[9px] text-[#666] uppercase tracking-wider mt-1">FRAME PREVIEW</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
