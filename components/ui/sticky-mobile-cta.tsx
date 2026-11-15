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

      // Show after scrolling past hero (~400px)
      const pastHero = scrollY > 400;

      // Check if near the contact section at the bottom
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
      <div className="flex items-center gap-2 p-2 bg-[#0B0B0B] border-3 border-[#FF2DA8] shadow-[5px_5px_0px_#D4FF3F] font-mono text-xs">
        {/* Call button */}
        <a
          href="tel:+918300478244"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border-2 border-[#FF2DA8] bg-[#0B0B0B] text-[#D4FF3F] shadow-[2px_2px_0px_#D4FF3F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150"
        >
          <Phone size={14} className="text-[#FF2DA8]" />
          <span className="font-bold">CALL</span>
        </a>

        {/* WhatsApp primary CTA button */}
        <a
          href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2027%20Creative%20Studio%2C%20I%20want%20to%20grow%20my%20brand%20in%20Thoothukudi.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#D4FF3F] text-[#0B0B0B] font-black border-2 border-[#0B0B0B] shadow-[3px_3px_0px_#FF2DA8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150"
        >
          <MessageSquare size={14} />
          <span>TALK TO US</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </aside>
  );
}
