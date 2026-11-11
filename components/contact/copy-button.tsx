"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  textToCopy: string;
  ariaLabel?: string;
}

export function CopyButton({ textToCopy, ariaLabel = "Copy to clipboard" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider transition-all duration-200 border cursor-pointer ${
        copied
          ? "border-[var(--industry)] bg-[var(--industry)]/15 text-[var(--industry)]"
          : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-[var(--industry)]/60 hover:text-[var(--paper)]"
      }`}
    >
      {copied ? (
        <>
          <Check size={11} className="text-[var(--industry)]" aria-hidden="true" />
          <span className="font-bold">COPIED</span>
        </>
      ) : (
        <>
          <Copy size={11} aria-hidden="true" />
          <span>COPY</span>
        </>
      )}
    </button>
  );
}
