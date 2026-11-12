import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock, Phone, Sparkles } from 'lucide-react';
import { BrandLockup } from '@/components/brand-lockup';
import { siteContent, whatsappHref } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Brief Received // Scene 01 Logged',
  description: 'Thank you for reaching out to 27 Creative Studio. Your growth brief has been logged.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return (
    <main className="min-h-screen min-h-[100svh] flex flex-col justify-between bg-[#0B0B0F] text-[#F4F1EA] select-none p-6 sm:p-10 lg:p-14 relative overflow-hidden">
      {/* Film grain overlay */}
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      {/* Top Header */}
      <header className="relative z-10 w-full flex items-center justify-between border-b border-[#2A2A30] pb-6">
        <BrandLockup href="/" />
        <div className="font-mono text-xs text-[#C6FF3D] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-pulse" aria-hidden="true" />
          <span>BRIEF_LOGGED // TAKE_01</span>
        </div>
      </header>

      {/* Main Confirmation Content */}
      <div className="relative z-10 max-w-3xl mx-auto my-auto py-10 w-full">
        <div className="relative p-6 sm:p-10 md:p-12 border border-[#2A2A30] bg-[#141419]/90 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)]">
          {/* L-shaped corner brackets */}
          <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C6FF3D]" aria-hidden="true" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C6FF3D]" aria-hidden="true" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C6FF3D]" aria-hidden="true" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C6FF3D]" aria-hidden="true" />

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] font-mono text-xs mb-6">
            <CheckCircle2 size={14} />
            <span>TRANSMISSION COMPLETE · SLATE LOCKED</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F1EA] leading-[0.95]">
            BRIEF RECEIVED.
            <br />
            <span className="text-[#C6FF3D]">WE SHOOT & SCALE.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#A9A7A0] leading-relaxed max-w-xl">
            Your project details have landed with the 27 Creative Studio production desk in Thoothukudi. We review every brief individually to find the exact visual hook that stops the scroll.
          </p>

          {/* 3-Step Production Timeline */}
          <div className="mt-8 pt-8 border-t border-[#2A2A30] grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#1B1B21] border border-white/5">
              <span className="text-[#C6FF3D] font-bold block mb-1">01 / REVIEW</span>
              <p className="text-white font-medium mb-1">Within 2 Hours</p>
              <p className="text-[#A9A7A0] text-[11px] leading-normal">
                Market angle analysis and visual opportunity check for your business.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1B1B21] border border-white/5">
              <span className="text-[#C6FF3D] font-bold block mb-1">02 / DISCOVERY CALL</span>
              <p className="text-white font-medium mb-1">Within 24 Hours</p>
              <p className="text-[#A9A7A0] text-[11px] leading-normal">
                Quick 10-minute strategy call on WhatsApp to confirm deliverables & dates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1B1B21] border border-white/5">
              <span className="text-[#C6FF3D] font-bold block mb-1">03 / SHOOT & SCALE</span>
              <p className="text-white font-medium mb-1">Day 02 – 05</p>
              <p className="text-[#A9A7A0] text-[11px] leading-normal">
                On-location 4K production, fast glass cinematography, and viral pacing.
              </p>
            </div>
          </div>

          {/* Need Urgent Attention? */}
          <div className="mt-8 p-4 rounded-xl bg-[#0B0B0F] border border-[#2A2A30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#C6FF3D]/10 text-[#C6FF3D] flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-white font-bold">Need an immediate shoot or campaign sprint?</p>
                <p className="text-[#A9A7A0] text-[11px]">Direct WhatsApp channel connects straight to the creative lead.</p>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0B0B0F" }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C6FF3D] !text-[#0B0B0F] font-black shrink-0 hover:bg-[#d4ff66] transition-colors"
            >
              <span style={{ color: "#0B0B0F" }}>OPEN WHATSAPP</span>
              <ArrowUpRight size={14} style={{ color: "#0B0B0F" }} />
            </a>
          </div>

          {/* Action Back */}
          <div className="mt-8 flex items-center justify-start font-mono text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#A9A7A0] hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span>RETURN TO MAIN SITE</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between border-t border-[#2A2A30] pt-6 font-mono text-xs text-[#A9A7A0] gap-2">
        <p>© {new Date().getFullYear()} 27 Creative Studio · Polpettai / Ettayapuram Road, Thoothukudi 628002</p>
        <p className="flex items-center gap-2">
          <span>Call: +91 83004 78244</span>
        </p>
      </footer>
    </main>
  );
}
