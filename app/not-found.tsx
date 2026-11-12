import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { BrandLockup } from '@/components/brand-lockup';
import { siteContent, whatsappHref } from '@/lib/site-content';

export const metadata: Metadata = {
  title: '404 — Scene Not Found',
  description: 'The requested scene or take does not exist on this reel.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen min-h-[100svh] flex flex-col justify-between bg-[#0B0B0F] text-[#F4F1EA] select-none p-6 sm:p-10 lg:p-14 relative overflow-hidden">
      {/* Film grain overlay */}
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      {/* Top Header */}
      <header className="relative z-10 w-full flex items-center justify-between border-b border-[#2A2A30] pb-6">
        <BrandLockup href="/" />
        <div className="font-mono text-xs text-[#A9A7A0] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span>ERR // 404_CUT</span>
        </div>
      </header>

      {/* Viewfinder Center Slate */}
      <div className="relative z-10 max-w-2xl mx-auto my-auto py-12 text-center flex flex-col items-center">
        {/* L-shaped corner brackets */}
        <div className="relative p-8 sm:p-12 border border-[#2A2A30] bg-[#141419]/90 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)]">
          <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C6FF3D]" aria-hidden="true" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C6FF3D]" aria-hidden="true" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C6FF3D]" aria-hidden="true" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C6FF3D]" aria-hidden="true" />

          {/* Timecode Readout */}
          <p className="font-mono text-xs sm:text-sm tracking-widest text-[#C6FF3D] uppercase mb-4">
            [ TIMECODE: 00:04:04:00 · CUT_OFF ]
          </p>

          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-[#F4F1EA] leading-[0.92]">
            SCENE NOT FOUND.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#A9A7A0] max-w-md mx-auto leading-relaxed">
            The take you are looking for has been cut from the timeline or moved to another reel.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 font-mono text-xs">
            <Link
              href="/"
              style={{ color: "#0B0B0F" }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#C6FF3D] !text-[#0B0B0F] font-bold hover:bg-[#d4ff66] transition-colors"
            >
              <ArrowLeft size={16} style={{ color: "#0B0B0F" }} />
              <span style={{ color: "#0B0B0F" }}>RETURN TO MAIN STAGE</span>
            </Link>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#2A2A30] bg-[#1B1B21] text-[#F4F1EA] hover:border-[#C6FF3D] transition-colors"
            >
              <span>MESSAGE STUDIO</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between border-t border-[#2A2A30] pt-6 font-mono text-xs text-[#A9A7A0] gap-2">
        <p>© {new Date().getFullYear()} 27 Creative Studio · Thoothukudi</p>
        <p className="flex items-center gap-2">
          <span>STATUS: 404 REC STOPPED</span>
        </p>
      </footer>
    </main>
  );
}
