"use client";

import { useEffect, useState } from "react";
import { Phone, MessageSquare, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export function StickyMobileCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Show after scrolling past hero (~450px)
      const pastHero = scrollY > 400;

      // Check if near the contact section at the bottom to avoid overlapping form buttons
      const contactEl = document.getElementById("contact");
      let nearContact = false;
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        nearContact = rect.top < windowHeight && rect.bottom > 0;
      }

      setIsVisible(pastHero && !nearContact);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Quick contact actions"
      className="sm:hidden fixed bottom-3 left-3 right-3 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0E0E14]/95 backdrop-blur-md border border-[#2A2A30] shadow-[0_12px_36px_rgba(0,0,0,0.8)] font-mono text-xs">
        {/* Call button */}
        <a
          href="tel:+918300478244"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#2A2A30] bg-[#181822] text-[#F4F1EA] active:scale-95 transition-transform"
        >
          <Phone size={14} className="text-[#A9A7A0]" />
          <span className="font-bold">CALL</span>
        </a>

        {/* WhatsApp primary CTA button */}
        <a
          href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2027%20Creative%20Studio%2C%20I%20want%20to%20grow%20my%20brand%20in%20Thoothukudi.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#C6FF3D] text-[#0B0B0F] font-black active:scale-95 transition-transform shadow-[0_0_12px_rgba(198,255,61,0.25)]"
        >
          <MessageSquare size={14} />
          <span>TALK TO US</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </aside>
  );
}
