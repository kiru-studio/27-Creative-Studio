"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("27studio_cookie_consent");
      if (!consent) {
        // Small delay so it doesn't pop up abruptly on initial frame
        const timer = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const handleChoice = (choice: "accepted" | "essential") => {
    try {
      localStorage.setItem("27studio_cookie_consent", choice);
      window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: choice }));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="relative p-4 sm:p-5 rounded-2xl bg-[#141419]/95 backdrop-blur-md border border-[#2A2A30] shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-[#F4F1EA]">
        {/* L-shaped corner brackets */}
        <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#C6FF3D]" aria-hidden="true" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#C6FF3D]" aria-hidden="true" />
        <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#C6FF3D]" aria-hidden="true" />
        <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#C6FF3D]" aria-hidden="true" />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C6FF3D]/10 text-[#C6FF3D] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck size={18} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-[#C6FF3D] uppercase tracking-wider">
                COOKIE & PRIVACY NOTICE
              </span>
              <button
                type="button"
                onClick={() => handleChoice("essential")}
                className="text-[#A9A7A0] hover:text-white transition-colors p-1"
                aria-label="Dismiss cookie notice"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-[#A9A7A0] leading-relaxed mb-3">
              We use privacy-friendly analytics to monitor reel playback quality and site speed. No invasive third-party ad retargeting. Read our{" "}
              <Link href="/privacy" className="text-white underline hover:text-[#C6FF3D]">
                Privacy Policy
              </Link>.
            </p>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleChoice("accepted")}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#C6FF3D] !text-[#0B0B0F] font-black hover:bg-[#d4ff66] transition-colors"
                style={{ color: "#0B0B0F" }}
              >
                <span style={{ color: "#0B0B0F" }}>ACCEPT ALL</span>
              </button>
              <button
                type="button"
                onClick={() => handleChoice("essential")}
                className="py-1.5 px-3 rounded-lg border border-[#2A2A30] bg-[#181822] text-[#A9A7A0] hover:text-white transition-colors"
              >
                ESSENTIAL ONLY
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
