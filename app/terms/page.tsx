import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLockup } from '@/components/brand-lockup';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service & Video Production Agreement for 27 Creative Studio, Thoothukudi.',
};

export default function TermsOfServicePage() {
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
            // CLIENT PRODUCTION AGREEMENT
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F1EA]">
            TERMS OF SERVICE
          </h1>
          <p className="font-mono text-xs text-[#A9A7A0] mt-2">
            LAST REVISED: {lastUpdated} · 27 CREATIVE STUDIO, THOOTHUKUDI
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base text-[#D0CDC6] border-t border-[#2A2A30] pt-8">
          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              1. Engagement & Scope
            </h2>
            <p>
              These Terms of Service govern all creative services provided by <strong>27 Creative Studio</strong> (&ldquo;Studio&rdquo;) to clients (&ldquo;Client&rdquo;), including Instagram page handling, fast-glass video production sprints, 4K reel cinematography, event coverage, and Google Business Profile setup. Specific deliverables, deliverables counts, and shoot dates are confirmed in each project quotation or written agreement.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              2. Production & On-Location Shoots
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#A9A7A0]">
              <li><strong>Location Access:</strong> The Client is responsible for ensuring the designated business venue (e.g., dining floor, kitchen, showroom floor, campus) is prepped, lit, and accessible at the agreed call-sheet time.</li>
              <li><strong>Weather & Rescheduling:</strong> Outdoor shoots impacted by heavy rain, force majeure, or power outages will be rescheduled to the earliest mutual date at zero penalty.</li>
              <li><strong>Client Cancellation:</strong> Cancellations made less than 24 hours prior to a scheduled shoot may incur a crew mobilization fee.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              3. Post-Production & Revision Policy
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#A9A7A0]">
              <li><strong>Turnaround:</strong> Standard first cuts of reels are delivered within 3 to 5 business days following shoot completion.</li>
              <li><strong>Included Revisions:</strong> Every video package includes up to <strong>two (2) rounds of reasonable revisions</strong> (e.g., audio mix adjustment, pacing cuts, text caption typos, color balance tweaks).</li>
              <li><strong>Out-of-Scope Revisions:</strong> Requests for complete conceptual rework or re-shooting scenes after sign-off will be quoted as an add-on sprint.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              4. Payment Terms & Milestones
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#A9A7A0]">
              <li><strong>Sprint Deposits:</strong> A 50% advance deposit is required to lock production dates and reserve gear/crew on the studio schedule.</li>
              <li><strong>Final Balance:</strong> The remaining 50% balance is due upon review and final delivery of master 4K high-bitrate video files.</li>
              <li><strong>Monthly Retainers:</strong> Instagram page handling retainers are billed at the beginning of each 30-day growth cycle.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              5. Copyright & Intellectual Property
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#A9A7A0]">
              <li><strong>Client Usage Rights:</strong> Upon full settlement of invoices, the Client holds perpetual, royalty-free rights to publish, promote, and advertise the final edited video exports across all digital channels.</li>
              <li><strong>Raw Footage:</strong> Raw camera rushes/log files remain the archival property of the Studio unless explicitly contracted as a buyout deliverable.</li>
              <li><strong>Portfolio Rights:</strong> 27 Creative Studio retains the customary professional right to showcase completed client work on our portfolio website, showreels, and awards presentations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with our services shall be subject to the exclusive jurisdiction of the competent courts in Thoothukudi, Tamil Nadu.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl uppercase tracking-wide text-[#F4F1EA] mb-3">
              7. Contact
            </h2>
            <div className="p-4 rounded-xl bg-[#141419] border border-[#2A2A30] font-mono text-xs text-[#A9A7A0] space-y-1">
              <p><strong className="text-white">27 Creative Studio</strong></p>
              <p>Polpettai / Ettayapuram Road, Thoothukudi 628002, Tamil Nadu</p>
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
