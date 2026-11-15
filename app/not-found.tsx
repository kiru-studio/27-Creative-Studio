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
    <main className="min-h-screen min-h-[100svh] flex flex-col justify-between bg-[#0B0B0B] text-[#FF2DA8] select-none p-6 sm:p-10 lg:p-14 relative overflow-hidden">
      {/* Top Header */}
      <header className="relative z-10 w-full flex items-center justify-between border-b border-[#FF2DA8]/30 pb-6">
        <BrandLockup href="/" />
        <div className="font-mono text-xs text-[#D4FF3F] flex items-center gap-2 font-bold">
          <span className="w-2 h-2 rounded-full bg-[#FF2DA8] animate-pulse" aria-hidden="true" />
          <span>ERR // 404_CUT</span>
        </div>
      </header>

      {/* Viewfinder Center Slate */}
      <div className="relative z-10 max-w-2xl mx-auto my-auto py-12 text-center flex flex-col items-center">
        <div className="relative p-8 sm:p-12 border-2 border-[#FF2DA8] bg-[#0B0B0B] shadow-[0_0_40px_rgba(255,45,168,0.25)]">
          <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4FF3F]" aria-hidden="true" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4FF3F]" aria-hidden="true" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4FF3F]" aria-hidden="true" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4FF3F]" aria-hidden="true" />

          {/* Timecode Readout */}
          <p className="font-mono text-xs sm:text-sm tracking-widest text-[#D4FF3F] uppercase mb-4 font-bold">
            [ TIMECODE: 00:04:04:00 · CUT_OFF ]
          </p>

          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-[#FF2DA8] leading-[0.92]">
            SCENE NOT FOUND.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#D4FF3F] max-w-md mx-auto leading-relaxed font-mono">
            The take you are looking for has been cut from the timeline or moved to another reel.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 font-mono text-xs">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4FF3F] text-[#0B0B0B] font-black uppercase tracking-widest hover:bg-[#FF2DA8] hover:text-[#0B0B0B] transition-colors"
            >
              <ArrowLeft size={16} />
              <span>RETURN TO MAIN STAGE</span>
            </Link>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#FF2DA8] bg-[#0B0B0B] text-[#D4FF3F] hover:border-[#D4FF3F] hover:text-[#FF2DA8] transition-colors uppercase tracking-wider"
            >
              <span>MESSAGE STUDIO</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between border-t border-[#FF2DA8]/30 pt-6 font-mono text-xs text-[#D4FF3F] gap-2">
        <p>© {new Date().getFullYear()} 27 CREATIVE STUDIO · THOOTHUKUDI</p>
        <p className="flex items-center gap-2 font-bold text-[#FF2DA8]">
          <span>STATUS: 404 REC STOPPED</span>
        </p>
      </footer>
    </main>
  );
}
