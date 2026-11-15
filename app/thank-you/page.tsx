import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
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
    <main className="min-h-screen min-h-[100svh] flex flex-col justify-between bg-[#0B0B0B] text-[#FF2DA8] select-none p-6 sm:p-10 lg:p-14 relative overflow-hidden">
      {/* Top Header */}
      <header className="relative z-10 w-full flex items-center justify-between border-b border-[#FF2DA8]/30 pb-6">
        <BrandLockup href="/" />
        <div className="font-mono text-xs text-[#D4FF3F] flex items-center gap-2 font-bold">
          <span className="w-2 h-2 rounded-full bg-[#D4FF3F] animate-pulse" aria-hidden="true" />
          <span>BRIEF_LOGGED // TAKE_01</span>
        </div>
      </header>

      {/* Main Confirmation Content */}
      <div className="relative z-10 max-w-3xl mx-auto my-auto py-10 w-full">
        <div className="relative p-6 sm:p-10 md:p-12 border-2 border-[#FF2DA8] bg-[#0B0B0B] shadow-[0_0_40px_rgba(255,45,168,0.25)]">
          {/* L-shaped corner brackets */}
          <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4FF3F]" aria-hidden="true" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4FF3F]" aria-hidden="true" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4FF3F]" aria-hidden="true" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4FF3F]" aria-hidden="true" />

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0B0B0B] border border-[#D4FF3F] text-[#D4FF3F] font-mono text-xs mb-6 font-bold">
            <CheckCircle2 size={14} />
            <span>TRANSMISSION COMPLETE · SLATE LOCKED</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#FF2DA8] leading-[0.95]">
            BRIEF RECEIVED.
            <br />
            <span className="text-[#D4FF3F]">WE SHOOT & SCALE.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#D4FF3F] leading-relaxed max-w-xl font-mono">
            Your project details have landed with the 27 Creative Studio production desk in Thoothukudi. We review every brief individually to engineer the exact visual hook that stops the scroll.
          </p>

          {/* 3-Step Production Timeline */}
          <div className="mt-8 pt-8 border-t border-[#FF2DA8]/30 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#0B0B0B] border border-[#FF2DA8]/40">
              <span className="text-[#D4FF3F] font-bold block mb-1">01 / REVIEW</span>
              <p className="text-[#FF2DA8] font-bold mb-1">Within 2 Hours</p>
              <p className="text-[#D4FF3F] text-[11px] leading-normal">
                Market angle analysis and visual opportunity check for your business.
              </p>
            </div>

            <div className="p-4 bg-[#0B0B0B] border border-[#FF2DA8]/40">
              <span className="text-[#D4FF3F] font-bold block mb-1">02 / DISCOVERY CALL</span>
              <p className="text-[#FF2DA8] font-bold mb-1">Within 24 Hours</p>
              <p className="text-[#D4FF3F] text-[11px] leading-normal">
                Quick 10-minute strategy call on WhatsApp to confirm deliverables & dates.
              </p>
            </div>

            <div className="p-4 bg-[#0B0B0B] border border-[#FF2DA8]/40">
              <span className="text-[#D4FF3F] font-bold block mb-1">03 / SHOOT & SCALE</span>
              <p className="text-[#FF2DA8] font-bold mb-1">Day 02 – 05</p>
              <p className="text-[#D4FF3F] text-[11px] leading-normal">
                On-location 4K production, fast glass cinematography, and viral pacing.
              </p>
            </div>
          </div>

          {/* Need Urgent Attention? */}
          <div className="mt-8 p-4 bg-[#0B0B0B] border border-[#FF2DA8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0B0B0B] border border-[#D4FF3F] text-[#D4FF3F] flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-[#D4FF3F] font-bold">Need an immediate shoot or campaign sprint?</p>
                <p className="text-[#FF2DA8] text-[11px]">Direct WhatsApp channel connects straight to the creative lead.</p>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4FF3F] text-[#0B0B0B] font-black shrink-0 hover:bg-[#FF2DA8] hover:text-[#0B0B0B] transition-colors"
            >
              <span>OPEN WHATSAPP</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Action Back */}
          <div className="mt-8 flex items-center justify-start font-mono text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#FF2DA8] hover:text-[#D4FF3F] transition-colors font-bold uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              <span>RETURN TO MAIN SITE</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between border-t border-[#FF2DA8]/30 pt-6 font-mono text-xs text-[#D4FF3F] gap-2">
        <p>© {new Date().getFullYear()} 27 CREATIVE STUDIO · POLPETTAI / ETTAYAPURAM ROAD, THOOTHUKUDI 628002</p>
        <p className="flex items-center gap-2 text-[#FF2DA8] font-bold">
          <span>CALL: +91 83004 78244</span>
        </p>
      </footer>
    </main>
  );
}
