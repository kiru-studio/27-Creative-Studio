"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MessageSquareShare } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { buildWhatsAppMessage, type ContactFormValues } from "@/data/contact";

interface WhatsAppButtonProps {
  formValues: Partial<ContactFormValues>;
  reducedMotion?: boolean;
}

export function WhatsAppButton({
  formValues,
  reducedMotion = false,
}: WhatsAppButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  // Magnetic hover tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 250, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    mouseX.set(Math.max(-6, Math.min(6, x * 0.15)));
    mouseY.set(Math.max(-6, Math.min(6, y * 0.15)));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const messageText = buildWhatsAppMessage(formValues);
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="flex flex-col items-center flex-1">
      <motion.a
        ref={buttonRef}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          x: reducedMotion ? 0 : smoothX,
          y: reducedMotion ? 0 : smoothY,
        }}
        className="group relative w-full min-h-[48px] px-6 py-3 rounded-none border-2 border-[#FF2DA8] bg-[#0B0B0B] font-mono text-xs font-bold uppercase tracking-wider text-[#D4FF3F] shadow-[4px_4px_0px_#D4FF3F] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#D4FF3F] active:translate-x-1 active:translate-y-1 active:shadow-none hover:border-[#D4FF3F] flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 select-none"
      >
        <MessageSquareShare
          size={16}
          className="transition-transform duration-200 group-hover:scale-110 text-[#D4FF3F]"
          aria-hidden="true"
        />
        <span>BOOK VIA WHATSAPP</span>
      </motion.a>
      <span className="font-mono text-[10px] text-[#D4FF3F] uppercase tracking-wider mt-1 select-none font-bold">
        DIRECT TO DIRECTOR // INSTANT DISPATCH
      </span>
    </div>
  );
}
