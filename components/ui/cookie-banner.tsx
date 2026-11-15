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
      <div className="relative p-4 sm:p-5 bg-[#0B0B0B] border-2 border-[#FF2DA8] shadow-[0_0_30px_rgba(255,45,168,0.3)] text-[#D4FF3F]">
        {/* L-shaped corner brackets */}
        <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#D4FF3F]" aria-hidden="true" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#D4FF3F]" aria-hidden="true" />
        <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#D4FF3F]" aria-hidden="true" />
        <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#D4FF3F]" aria-hidden="true" />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#0B0B0B] border border-[#D4FF3F] text-[#D4FF3F] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck size={18} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-[#D4FF3F] uppercase tracking-wider">
                COOKIE & PRIVACY NOTICE
              </span>
              <button
                type="button"
                onClick={() => handleChoice("essential")}
                className="text-[#FF2DA8] hover:text-[#D4FF3F] transition-colors p-1"
                aria-label="Dismiss cookie notice"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-[#FF2DA8] leading-relaxed mb-3 font-mono">
              We monitor reel playback telemetry and site speed without invasive trackers. Read our{" "}
              <Link href="/privacy" className="text-[#D4FF3F] underline hover:text-[#FF2DA8]">
                Privacy Policy
              </Link>.
            </p>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleChoice("accepted")}
                className="flex-1 py-1.5 px-3 bg-[#D4FF3F] !text-[#0B0B0B] font-black hover:bg-[#FF2DA8] transition-colors"
              >
                ACCEPT ALL
              </button>
              <button
                type="button"
                onClick={() => handleChoice("essential")}
                className="py-1.5 px-3 border border-[#FF2DA8] bg-[#0B0B0B] text-[#D4FF3F] hover:text-[#0B0B0B] hover:bg-[#FF2DA8] transition-colors"
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
