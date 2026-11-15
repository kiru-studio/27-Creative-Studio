"use client";

import { useEffect, useState } from "react";
import { Phone, MessageSquare, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export function StickyMobileCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Show after scrolling past hero (~400px)
        const pastHero = scrollY > 400;

        // Hide completely in the contact area
        const contactEl = document.getElementById("contact");
        let nearContact = false;
        if (contactEl) {
          const rect = contactEl.getBoundingClientRect();
          // Hide as soon as contact area top is within 250px of window bottom
          nearContact = rect.top < windowHeight - 100 && rect.bottom > 0;
        }

        setIsVisible(pastHero && !nearContact);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Quick contact actions"
      className="sm:hidden fixed left-3 right-3 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
    >
      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0B0B0B]/95 backdrop-blur-md border border-[#2A2A30] shadow-[0_12px_36px_rgba(0,0,0,0.8)] font-mono text-xs">
        {/* Call button */}
        <a
          href="tel:+918300478244"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#2A2A30] bg-[#141419] text-[#EFE6D8] active:scale-95 transition-transform"
        >
          <Phone size={14} className="text-[#B9B2A5]" />
          <span className="font-bold">CALL</span>
        </a>

        {/* WhatsApp primary CTA button: dark text on lime, no glow, prefilled message */}
        <a
          href={`https://wa.me/918300478244?text=${encodeURIComponent(
            "Hi 27 Creative Studio, I want to grow my business in Thoothukudi. Let's talk."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#D4FF3F] text-[#0B0B0B] font-black active:scale-95 transition-transform border border-[#D4FF3F]"
        >
          <MessageSquare size={14} className="text-[#0B0B0B]" />
          <span className="text-[#0B0B0B]">WhatsApp us</span>
          <ArrowUpRight size={14} className="text-[#0B0B0B]" />
        </a>
      </div>
    </aside>
  );
}
