import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLockup } from '@/components/brand-lockup';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy of 27 Creative Studio, Thoothukudi. How we handle client inquiries, communications, and media.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 12, 2026';

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#F4F1EA] select-none p-6 sm:p-10 lg:p-16 relative overflow-hidden">
      {/* Background overlay */}
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto flex items-center justify-between border-b border-[#2A2A30] pb-6 mb-12">
        <BrandLockup href="/" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO HOME</span>
        </Link>
      </header>

      {/* Content */}
      <article className="relative z-10 max-w-4xl mx-auto font-sans leading-relaxed">
        <div className="mb-10">
          <p className="font-mono text-xs text-[#C6FF3D] tracking-widest uppercase mb-2">
            // LEGAL DOCUMENTATION
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F1EA]">
            PRIVACY POLICY
          </h1>
          <p className="font-mono text-xs text-[#A9A7A0] mt-2">
            EFFECTIVE DATE: {lastUpdated} · 27 CREATIVE STUDIO, THOOTHUKUDI
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base text-[#D0CDC6] border-t border-[#2A2A30] pt-8">
          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              1. Overview
            </h2>
            <p>
              At <strong>27 Creative Studio</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), registered in Thoothukudi, Tamil Nadu, India, we respect your privacy and are committed to protecting the personal information you share with us through our website (<strong>27creativestudio.com</strong>), WhatsApp communications, phone calls, and direct on-location production engagements.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-2">We collect only information necessary to deliver video production, creative strategy, and digital marketing services:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#A9A7A0]">
              <li><strong>Contact Information:</strong> Name, phone number, WhatsApp number, email address, and business brand name submitted via our project brief clapperboard.</li>
              <li><strong>Project Details:</strong> Business type, marketing goals, preferred filming dates, brand social media handles, and creative references.</li>
              <li><strong>Media & Footage:</strong> Video recordings, raw b-roll, audio stems, photographs, and logos created during scheduled shoot sessions with client consent.</li>
              <li><strong>Technical Data:</strong> Anonymized web analytics (such as page views and browser characteristics) through privacy-conscious analytics to improve site responsiveness.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#A9A7A0]">
              <li>To prepare customized video production packages, quotations, and creative briefs.</li>
              <li>To coordinate shoot dates, locations, logistics, and delivery timelines with you via WhatsApp or phone.</li>
              <li>To execute video editing, sound design, color grading, and social media posting workflows as agreed.</li>
              <li>To feature agreed-upon showcase reels or portfolio case studies with prior explicit client authorization.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              4. Media & Filming Consent
            </h2>
            <p>
              During on-location shoots (e.g. at restaurants, showrooms, clinics, retail spaces), clients are responsible for securing necessary premises permissions and informing their staff and customers regarding filming activities. 27 Creative Studio will respect any request to avoid filming specific proprietary areas or individuals who decline to appear on camera.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              5. Data Protection & Sharing
            </h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We share data only with authorized technical platforms essential to our operations (such as secure cloud storage for raw footage backups and Vercel infrastructure hosting).
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              6. Cookies & Local Storage
            </h2>
            <p>
              Our website uses minimal local storage to remember your cookie consent preferences and preloader status. We do not use intrusive cross-site tracking cookies or invasive third-party ad retargeting networks.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              7. Studio Contact Details
            </h2>
            <p className="mb-2">For any questions or privacy inquiries, contact our studio team directly:</p>
            <div className="p-4 rounded-xl bg-[#141419] border border-[#2A2A30] font-mono text-xs text-[#A9A7A0] space-y-1">
              <p><strong className="text-white">27 Creative Studio</strong></p>
              <p>Address: Polpettai / Ettayapuram Road, Thoothukudi, Tamil Nadu 628002, India</p>
              <p>Phone / WhatsApp: +91 83004 78244</p>
              <p>Email: hello@27creativestudio.com</p>
            </div>
          </section>
        </div>
      </article>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto mt-16 pt-6 border-t border-[#2A2A30] flex flex-col sm:flex-row items-center justify-between font-mono text-xs text-[#A9A7A0] gap-2">
        <p>© {new Date().getFullYear()} 27 Creative Studio. All rights reserved.</p>
        <Link href="/" className="hover:text-[#C6FF3D] transition-colors">
          Return to Studio Home →
        </Link>
      </footer>
    </main>
  );
}
