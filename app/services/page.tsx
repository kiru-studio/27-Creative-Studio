import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { siteContent, getSiteBaseUrl, whatsappHref } from "@/lib/site-content";

const siteUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: "Video Production, Instagram Reels & Local SEO in Thoothukudi",
  description:
    "27 Creative Studio offers 4K Instagram reels, commercial brand films, page management & Google Business Profile growth across Thoothukudi, Tuticorin, and Tirunelveli.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title:
      "Video Production, Instagram Reels & Local SEO | 27 Creative Studio",
    description:
      "Full-service commercial video production, 9:16 Instagram reels, and Google Maps visibility for businesses in Thoothukudi, Tuticorin, and Tirunelveli.",
    url: `${siteUrl}/services`,
    siteName: "27 Creative Studio",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/og-preview.png",
        width: 2400,
        height: 1260,
        alt: "27 Creative Studio Services — Thoothukudi",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services — 27 Creative Studio | Thoothukudi & Tamil Nadu",
    description:
      "4K commercial ad films, Instagram growth sprints, and local SEO engineered in Thoothukudi.",
    images: ["/images/og-preview.png"],
  },
};

export default function ServicesPage() {
  const packages = siteContent.packages || [];
  const industries = (siteContent.industries || []).filter(
    (ind) => ind.id !== "everything",
  );
  const areas = siteContent.seo.business?.areaServed || [
    "Thoothukudi",
    "Tuticorin",
    "Tirunelveli",
    "Tamil Nadu",
    "India",
  ];

  const servicesGraph = {
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
            name: "Services",
            item: `${siteUrl}/services`,
          },
        ],
      },
      {
        "@type": "Service",
        name: "Video Production, Instagram Reels & Local Growth",
        provider: {
          "@id": `${siteUrl}/#organization`,
          "@type": ["LocalBusiness", "ProfessionalService"],
          name: "27 Creative Studio",
          url: siteUrl,
        },
        serviceType: [
          "Instagram Reels Production",
          "Commercial Ad Films",
          "Instagram Page Management",
          "Google Business Profile Optimization",
        ],
        areaServed: areas.map((area) => ({
          "@type":
            area.toLowerCase() === "india"
              ? "Country"
              : area.toLowerCase() === "tamil nadu"
                ? "State"
                : "City",
          name: area,
        })),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Studio Engagement Packages",
          itemListElement: packages.map((pkg) => ({
            "@type": "Offer",
            name: pkg.name,
            description: pkg.tagline || pkg.description,
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
          __html: JSON.stringify(servicesGraph).replace(/</g, "\\u003c"),
        }}
      />
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between border-b border-[#2A2A30] pb-6 mb-12 gap-4">
        <BrandLockup href="/" />
        <nav aria-label="Services page navigation" className="flex items-center gap-5 font-mono text-xs">
          <Link href="/work" className="text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors">
            CASE STUDIES
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
        <section aria-labelledby="services-page-heading">
          <p className="font-mono text-xs text-[#C6FF3D] tracking-widest uppercase mb-3">
            // PRODUCTION &amp; GROWTH CAPABILITIES · THOOTHUKUDI
          </p>
          <h1
            id="services-page-heading"
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F1EA] leading-[0.95] max-w-4xl"
          >
            Commercial Video Production &amp; Instagram Growth in Thoothukudi
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#A9A7A0] max-w-3xl leading-relaxed">
            27 Creative Studio partners with ambitious local businesses across{" "}
            <strong className="text-[#F4F1EA]">Thoothukudi (Tuticorin)</strong>,{" "}
            <strong className="text-[#F4F1EA]">Tirunelveli</strong>, and Southern Tamil Nadu to plan, shoot, edit, and scale high-converting vertical reels, 16:9 brand films, and Google Maps search visibility.
          </p>
        </section>

        <section aria-labelledby="packages-list-heading">
          <h2
            id="packages-list-heading"
            className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F4F1EA] mb-6"
          >
            Core Packages &amp; Engagement Models
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <article
                key={pkg.id || idx}
                className="p-6 rounded-2xl border border-[#2A2A30] bg-[#141419] flex flex-col justify-between gap-6"
              >
                <div>
                  <span className="font-mono text-xs text-[#C6FF3D] tracking-widest uppercase">
                    {pkg.tierNumber || `WAY / 0${idx + 1}`}
                  </span>
                  <h3 className="mt-2 font-display font-black text-2xl uppercase text-[#F4F1EA]">
                    {pkg.name}
                  </h3>
                  {pkg.tagline && (
                    <p className="mt-2 text-sm text-[#A9A7A0] leading-relaxed">
                      {pkg.tagline}
                    </p>
                  )}
                  <ul className="mt-4 space-y-2 text-xs font-mono text-[#D0CDC6]">
                    {(pkg.deliverables || []).map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-[#C6FF3D] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/#contact?package=${pkg.id || "reels-sprint"}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#C6FF3D] text-[#0B0B0F] font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  <span>Book Consultation</span>
                  <ArrowUpRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="industries-heading" className="border-t border-[#2A2A30] pt-12">
          <h2
            id="industries-heading"
            className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F4F1EA] mb-6"
          >
            Industries We Scale Across Tamil Nadu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {industries.map((ind) => (
              <div
                key={ind.id}
                className="p-5 rounded-xl border border-[#2A2A30] bg-[#121217]"
              >
                <h3 className="font-display font-bold text-xl uppercase text-[#C6FF3D]">
                  {ind.label}
                </h3>
                <p className="mt-1.5 text-sm text-[#A9A7A0] leading-relaxed">
                  {ind.pitch}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-8 rounded-2xl border border-[#2A2A30] bg-[#141419] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#C6FF3D] uppercase">
              <MapPin size={14} />
              <span>Polpettai / Ettayapuram Road, Thoothukudi 628002</span>
            </div>
            <p className="text-sm text-[#A9A7A0] max-w-xl">
              Ready to shoot 4K reels or launch a local visibility sprint for your business in Thoothukudi or Tirunelveli?
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-lg bg-[#C6FF3D] text-[#0B0B0F] font-mono text-xs font-bold uppercase tracking-wider"
            >
              WhatsApp Studio
            </a>
            <Link
              href="/#contact"
              className="px-5 py-3 rounded-lg border border-[#2A2A30] text-[#F4F1EA] font-mono text-xs uppercase tracking-wider hover:border-[#C6FF3D]"
            >
              Project Brief Form
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
