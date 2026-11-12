"use client";

import React, { useState } from "react";
import { Upload, Eye, X, Check, AlertCircle, Film, Image as ImageIcon, Sparkles, ExternalLink } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const parsed = parseMediaUrl(value, mediaType);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Auto-normalize if it's a Google Drive share link
    const normalized = normalizeMediaInput(raw, mediaType);
    onChange(normalized);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed.");
      }

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
          placeholder={placeholder || (mediaType === "video" ? "Paste video URL (Google Drive, Cloudinary, MP4...)" : "Paste image URL (Google Drive, Cloudinary, WebP...)")}
          className="w-full bg-[#141418] border border-[#2A2A30] focus:border-[#C6FF3D] rounded px-3 py-2 text-xs font-mono text-[#F4F1EA] placeholder-[#666] outline-none transition-colors pr-24"
        />

        {/* Local File Upload Button embedded inside the right side */}
        <label
          className={`absolute right-1 px-2.5 py-1 text-[11px] font-mono rounded cursor-pointer transition-all flex items-center gap-1 ${
            uploading
              ? "bg-[#2A2A30] text-[#A9A7A0] cursor-wait"
              : "bg-[#1E1E24] hover:bg-[#2A2A30] text-[#C6FF3D] border border-[#333]"
          }`}
          title="Upload file directly from computer (saves to /public/uploads/)"
        >
          <Upload size={12} />
          <span>{uploading ? "Uploading…" : "Upload"}</span>
          <input
            type="file"
            accept={mediaType === "video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/avif"}
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Smart Status Badges & Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        {parsed.isGoogleDrive && (
          <span className="inline-flex items-center gap-1 text-[#C6FF3D] bg-[#C6FF3D]/10 px-2 py-0.5 rounded border border-[#C6FF3D]/30">
            <Check size={11} /> Google Drive linked (ID: {parsed.googleDriveId?.slice(0, 8)}…)
          </span>
        )}

        {parsed.posterSuggestionUrl && onGeneratePoster && (
          <button
            type="button"
            onClick={() => onGeneratePoster(parsed.posterSuggestionUrl!)}
            className="inline-flex items-center gap-1 text-[#0B0B0F] !text-[#0B0B0F] bg-[#C6FF3D] hover:bg-[#b0f025] px-2 py-0.5 rounded font-bold transition-colors"
            style={{ color: "#0B0B0F" }}
            title="Auto-extracts first video frame as poster image from Cloudinary"
          >
            <Sparkles size={11} style={{ color: "#0B0B0F" }} />
            <span style={{ color: "#0B0B0F" }}>Auto-Generate Poster (.jpg)</span>
          </button>
        )}

        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-[#A9A7A0] hover:text-[#F4F1EA] inline-flex items-center gap-1 transition-colors ml-auto"
          >
            Open raw asset <ExternalLink size={11} />
          </a>
        )}
      </div>

      {uploadError && (
        <p className="text-[11px] font-mono text-[#FF5C5C] flex items-center gap-1 mt-0.5">
          <AlertCircle size={12} /> {uploadError}
        </p>
      )}

      {/* Help text */}
      {helpText && !parsed.isGoogleDrive && (
        <p className="text-[11px] font-mono text-[#777] leading-relaxed">
          {helpText}
        </p>
      )}

      {parsed.isGoogleDrive && (
        <p className="text-[11px] font-mono text-[#C6FF3D]/80 leading-relaxed bg-[#181C10] p-1.5 rounded border border-[#C6FF3D]/20">
          💡 <strong>Tip:</strong> Ensure this Google Drive file is set to &ldquo;Anyone with the link can view&rdquo; in Google Drive sharing settings.
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
              <span className="font-mono text-[10px] text-[#777] mt-1">Live Video Stream Preview</span>
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
              <span className="font-mono text-[10px] text-[#777] mt-1">Live Image Preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
