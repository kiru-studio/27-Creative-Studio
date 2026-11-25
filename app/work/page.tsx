import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { siteContent, getSiteBaseUrl } from "@/lib/site-content";

const siteUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: "Case Studies & Client Growth Results in Thoothukudi",
  description:
    "Verified Instagram growth, reel view counts, and Google Maps visibility results by 27 Creative Studio for Thamira Restaurant, MM Cars, Surya Mobiles & ThoorigAI Infotech.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Client Case Studies | 27 Creative Studio Thoothukudi",
    description:
      "Explore how 27 Creative Studio drove 6,300+ followers and up to 6.1x Instagram growth for Thoothukudi businesses.",
    url: `${siteUrl}/work`,
    siteName: "27 Creative Studio",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/og-preview.png",
        width: 2400,
        height: 1260,
        alt: "27 Creative Studio Client Case Studies",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Studies — 27 Creative Studio | Thoothukudi",
    description:
      "6,300+ new followers and real walk-in results across Thoothukudi restaurants, car showrooms & retail.",
    images: ["/images/og-preview.png"],
  },
};

export default function WorkPage() {
  const cases = siteContent.caseStudies || [];
  const films = siteContent.films || [];

  const workSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Case Studies",
            item: `${siteUrl}/work`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "27 Creative Studio Client Case Studies — Thoothukudi",
        url: `${siteUrl}/work`,
        about: {
          "@id": `${siteUrl}/#organization`,
        },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: cases.map((cs, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: `${cs.client || cs.title} — ${cs.title}`,
            description: cs.result || cs.goal,
          })),
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#F4F1EA] p-6 sm:p-10 lg:p-16 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(workSchema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between border-b border-[#2A2A30] pb-6 mb-12 gap-4">
        <BrandLockup href="/" />
        <nav aria-label="Case studies navigation" className="flex items-center gap-5 font-mono text-xs">
          <Link href="/services" className="text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors">
            SERVICES
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>BACK TO HOME</span>
          </Link>
        </nav>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        <section aria-labelledby="work-page-heading">
          <p className="font-mono text-xs text-[#C6FF3D] tracking-widest uppercase mb-3">
            // VERIFIED CAMPAIGN ARCHIVE · 4 CLIENTS · 6,300+ NEW FOLLOWERS
          </p>
          <h1
            id="work-page-heading"
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F1EA] leading-[0.95] max-w-4xl"
          >
            Thoothukudi Case Studies &amp; Production Results
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#A9A7A0] max-w-3xl leading-relaxed">
            Measurable follower growth, top reel views, and Google Business Profile visibility engineered by 27 Creative Studio for local brands across Thoothukudi and Tuticorin.
          </p>
        </section>

        <section aria-labelledby="case-grid-heading" className="space-y-6">
          <h2
            id="case-grid-heading"
            className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F4F1EA]"
          >
            Client Growth Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((cs, idx) => (
              <article
                key={`${cs.client}-${idx}`}
                className="p-6 rounded-2xl border border-[#2A2A30] bg-[#141419] flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span className="text-[#C6FF3D] uppercase tracking-wider font-bold">
                      {cs.label}
                    </span>
                    {cs.handle && (
                      <span className="text-[#A9A7A0]">{cs.handle}</span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-2xl uppercase text-[#F4F1EA]">
                    {cs.client &&
                    cs.title &&
                    cs.client.toLowerCase() !== cs.title.toLowerCase()
                      ? `${cs.client} — ${cs.title}`
                      : cs.title}
                  </h3>
                  {cs.location && (
                    <p className="inline-flex items-center gap-1.5 font-mono text-xs text-[#A9A7A0]">
                      <MapPin size={13} className="text-[#C6FF3D]" />
                      <span>{cs.location}</span>
                    </p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 font-mono">
                    {cs.growthMultiplier && (
                      <div className="p-2.5 rounded-lg bg-[#0B0B0F] border border-[#232326]">
                        <span className="block text-[10px] text-[#7E7D88] uppercase">Growth</span>
                        <span className="text-sm font-bold text-[#C6FF3D]">{cs.growthMultiplier}</span>
                      </div>
                    )}
                    {cs.topViews && (
                      <div className="p-2.5 rounded-lg bg-[#0B0B0F] border border-[#232326]">
                        <span className="block text-[10px] text-[#7E7D88] uppercase">Top Views</span>
                        <span className="text-sm font-bold text-[#F4F1EA]">{cs.topViews}</span>
                      </div>
                    )}
                    {cs.googleRating && (
                      <div className="p-2.5 rounded-lg bg-[#0B0B0F] border border-[#232326]">
                        <span className="block text-[10px] text-[#7E7D88] uppercase">Google</span>
                        <span className="text-sm font-bold text-[#FFD700]">★ {cs.googleRating}</span>
                      </div>
                    )}
                  </div>

                  {cs.goal && (
                    <p className="text-sm text-[#D0CDC6] leading-relaxed">
                      <strong className="text-[#F4F1EA]">Goal: </strong>
                      {cs.goal}
                    </p>
                  )}
                  {cs.shot && (
                    <p className="text-sm text-[#A9A7A0] leading-relaxed">
                      <strong className="text-[#F4F1EA]">Production: </strong>
                      {cs.shot}
                    </p>
                  )}
                  {cs.result && (
                    <p className="text-sm text-[#A9A7A0] leading-relaxed">
                      <strong className="text-[#C6FF3D]">Result: </strong>
                      {cs.result}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="films-archive-heading" className="border-t border-[#2A2A30] pt-12 space-y-5">
          <h2
            id="films-archive-heading"
            className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F4F1EA]"
          >
            Signature Brand Films (16:9)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {films.map((film, idx) => (
              <div
                key={`${film.client}-${idx}`}
                className="p-5 rounded-xl border border-[#2A2A30] bg-[#121217] space-y-2"
              >
                <span className="font-mono text-[11px] text-[#C6FF3D] uppercase">
                  {film.label} · {film.meta}
                </span>
                <h3 className="font-display font-bold text-xl uppercase text-[#F4F1EA]">
                  {film.client} — {film.title}
                </h3>
                {film.goal && (
                  <p className="text-sm text-[#A9A7A0] leading-relaxed">
                    {film.goal}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#C6FF3D] text-[#0B0B0F] font-mono text-xs font-bold uppercase tracking-wider"
          >
            <span>Start Your Brand Campaign</span>
            <ArrowUpRight size={14} />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-[#2A2A30] text-[#F4F1EA] font-mono text-xs uppercase tracking-wider hover:border-[#C6FF3D]"
          >
            <span>View Production Packages</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
