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
        <label className="font-mono text-xs uppercase tracking-wider text-[#FF2DA8] flex items-center gap-1.5">
          {mediaType === "video" ? <Film size={13} className="text-[#D4FF3F]" /> : <ImageIcon size={13} className="text-[#D4FF3F]" />}
          <span>{label}</span>
        </label>
        {value && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[11px] font-mono text-[#FF2DA8] hover:text-[#D4FF3F] transition-colors inline-flex items-center gap-1"
            >
              <Eye size={12} /> {showPreview ? "Hide preview" : "Show preview"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] font-mono text-[#FF2DA8] hover:text-[#D4FF3F] transition-colors inline-flex items-center gap-0.5"
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
          className="w-full bg-[#0B0B0B] border border-[#FF2DA8] focus:border-[#D4FF3F] rounded px-3 py-2 text-xs font-mono text-[#D4FF3F] placeholder-[#FF2DA8] outline-none transition-colors pr-24"
        />

        {/* Local File Upload Button embedded inside the right side */}
        <label
          className={`absolute right-1 px-2.5 py-1 text-[11px] font-mono rounded cursor-pointer transition-all flex items-center gap-1 ${
            uploading
              ? "bg-[#FF2DA8] text-[#FF2DA8] cursor-wait"
              : "bg-[#0B0B0B] hover:bg-[#FF2DA8] text-[#D4FF3F] border border-[#0B0B0B]"
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
          <span className="inline-flex items-center gap-1 text-[#D4FF3F] bg-[#D4FF3F]/10 px-2 py-0.5 rounded border border-[#D4FF3F]/30">
            <Check size={11} /> Google Drive linked (ID: {parsed.googleDriveId?.slice(0, 8)}…)
          </span>
        )}

        {parsed.posterSuggestionUrl && onGeneratePoster && (
          <button
            type="button"
            onClick={() => onGeneratePoster(parsed.posterSuggestionUrl!)}
            className="inline-flex items-center gap-1 text-[#0B0B0B] !text-[#0B0B0B] bg-[#D4FF3F] hover:bg-[#D4FF3F] px-2 py-0.5 rounded font-bold transition-colors"
            style={{ color: "#0B0B0B" }}
            title="Auto-extracts first video frame as poster image from Cloudinary"
          >
            <Sparkles size={11} style={{ color: "#0B0B0B" }} />
            <span style={{ color: "#0B0B0B" }}>Auto-Generate Poster (.jpg)</span>
          </button>
        )}

        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-[#FF2DA8] hover:text-[#D4FF3F] inline-flex items-center gap-1 transition-colors ml-auto"
          >
            Open raw asset <ExternalLink size={11} />
          </a>
        )}
      </div>

      {uploadError && (
        <p className="text-[11px] font-mono text-[#FF2DA8] flex items-center gap-1 mt-0.5">
          <AlertCircle size={12} /> {uploadError}
        </p>
      )}

      {/* Help text */}
      {helpText && !parsed.isGoogleDrive && (
        <p className="text-[11px] font-mono text-[#FF2DA8] leading-relaxed">
          {helpText}
        </p>
      )}

      {parsed.isGoogleDrive && (
        <p className="text-[11px] font-mono text-[#D4FF3F]/80 leading-relaxed bg-[#0B0B0B] p-1.5 rounded border border-[#D4FF3F]/20">
          💡 <strong>Tip:</strong> Ensure this Google Drive file is set to &ldquo;Anyone with the link can view&rdquo; in Google Drive sharing settings.
        </p>
      )}

      {/* Live Preview Box */}
      {value && showPreview && (
        <div className="mt-1.5 rounded border border-[#FF2DA8] bg-[#0B0B0B] overflow-hidden p-2 flex flex-col items-center justify-center">
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
              <span className="font-mono text-[10px] text-[#FF2DA8] mt-1">Live Video Stream Preview</span>
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
              <span className="font-mono text-[10px] text-[#FF2DA8] mt-1">Live Image Preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
