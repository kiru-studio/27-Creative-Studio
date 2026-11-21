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
      className="group relative flex-1 min-h-[48px] px-6 py-3 rounded-lg border border-[#2A2A30] bg-[#141419] font-mono text-xs font-bold uppercase tracking-wider text-[#F4F1EA] hover:border-[#C6FF3D] hover:text-[#C6FF3D] flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 select-none"
    >
      <MessageSquareShare
        size={16}
        className="transition-transform duration-200 group-hover:scale-110 text-[#C6FF3D]"
        aria-hidden="true"
      />
      <span>BOOK ON WHATSAPP</span>
    </motion.a>
  );
}
