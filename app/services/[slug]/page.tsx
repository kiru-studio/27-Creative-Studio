import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, MapPin } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import {
  SERVICE_LANDING_PAGES,
  getCaseStudyPages,
  getServicePageBySlug,
} from "@/lib/seo-pages";
import { siteContent, getSiteBaseUrl, whatsappHref } from "@/lib/site-content";

const siteUrl = getSiteBaseUrl();

export function generateStaticParams() {
  return SERVICE_LANDING_PAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicePageBySlug(slug);
  if (!service) {
    return { title: "Service Not Found" };
  }

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `${siteUrl}/services/${service.slug}`,
      siteName: "27 Creative Studio",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "/images/og-preview.png",
          width: 2400,
          height: 1260,
          alt: service.title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: service.metaTitle,
      description: service.metaDescription,
      images: ["/images/og-preview.png"],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServicePageBySlug(slug);
  if (!service) {
    notFound();
  }

  const packages = (siteContent.packages || []).filter((p) =>
    service.relatedPackageIds.includes(p.id || ""),
  );
  const cases = getCaseStudyPages().slice(0, 2);

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: `${siteUrl}/services`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: `${siteUrl}/services/${service.slug}`,
          },
        ],
      },
      {
        "@type": "Service",
        name: service.title,
        description: service.metaDescription,
        url: `${siteUrl}/services/${service.slug}`,
        areaServed: service.locationFocus,
        provider: {
          "@id": `${siteUrl}/#organization`,
          "@type": ["LocalBusiness", "ProfessionalService"],
          name: "27 Creative Studio",
          url: siteUrl,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer,
          },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#F4F1EA] p-6 sm:p-10 lg:p-16 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaGraph).replace(/</g, "\\u003c"),
        }}
      />
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      <header className="relative z-10 max-w-5xl mx-auto flex items-center justify-between border-b border-[#2A2A30] pb-6 mb-12 gap-4">
        <BrandLockup href="/" />
        <nav
          aria-label="Service detail navigation"
          className="flex items-center gap-5 font-mono text-xs"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>ALL SERVICES</span>
          </Link>
          <Link
            href="/work"
            className="text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors"
          >
            CASE STUDIES
          </Link>
        </nav>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto space-y-14">
        <section aria-labelledby="service-hero-title">
          <p className="font-mono text-xs text-[#C6FF3D] tracking-widest uppercase mb-3">
            {service.eyebrow}
          </p>
          <h1
            id="service-hero-title"
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F1EA] leading-[0.95]"
          >
            {service.h1}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#A9A7A0] max-w-3xl leading-relaxed">
            {service.intro}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-[#D0CDC6]">
            <MapPin size={14} className="text-[#C6FF3D]" />
            <span>Coverage: {service.locationFocus}</span>
          </p>
        </section>

        <section aria-labelledby="highlights-heading">
          <h2
            id="highlights-heading"
            className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F4F1EA] mb-6"
          >
            How 27 Creative Studio Executes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {service.highlights.map((item) => (
              <div
                key={item.heading}
                className="p-5 rounded-2xl border border-[#2A2A30] bg-[#141419] space-y-2.5"
              >
                <h3 className="font-display font-bold text-xl uppercase text-[#C6FF3D]">
                  {item.heading}
                </h3>
                <p className="text-sm text-[#A9A7A0] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {packages.length > 0 && (
          <section aria-labelledby="service-packages-heading" className="border-t border-[#2A2A30] pt-12">
            <h2
              id="service-packages-heading"
              className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F4F1EA] mb-6"
            >
              Recommended Studio Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg, idx) => (
                <article
                  key={pkg.id || idx}
                  className="p-6 rounded-2xl border border-[#2A2A30] bg-[#121217] flex flex-col justify-between gap-5"
                >
                  <div>
                    <span className="font-mono text-xs text-[#C6FF3D] uppercase">
                      {pkg.tierNumber || `WAY / 0${idx + 1}`}
                    </span>
                    <h3 className="mt-1 font-display font-black text-2xl uppercase text-[#F4F1EA]">
                      {pkg.name}
                    </h3>
                    {pkg.tagline && (
                      <p className="mt-2 text-sm text-[#A9A7A0] leading-relaxed">
                        {pkg.tagline}
                      </p>
                    )}
                    <ul className="mt-4 space-y-1.5 text-xs font-mono text-[#D0CDC6]">
                      {(pkg.deliverables || []).map((del, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <CheckCircle2
                            size={14}
                            className="text-[#C6FF3D] shrink-0 mt-0.5"
                          />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={`/#contact?package=${pkg.id || "reels-sprint"}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#C6FF3D] text-[#0B0B0F] font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    <span>Book {pkg.name}</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="service-proof-heading" className="border-t border-[#2A2A30] pt-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2
              id="service-proof-heading"
              className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F4F1EA]"
            >
              Local Campaign Proof
            </h2>
            <Link
              href="/work"
              className="font-mono text-xs text-[#C6FF3D] hover:underline inline-flex items-center gap-1"
            >
              <span>All Case Studies</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cases.map((cs) => (
              <Link
                key={cs.slug}
                href={`/work/${cs.slug}`}
                className="p-5 rounded-xl border border-[#2A2A30] bg-[#141419] hover:border-[#C6FF3D] transition-colors space-y-2 block"
              >
                <span className="font-mono text-[11px] text-[#C6FF3D] uppercase">
                  {cs.label} · {cs.growthMultiplier || cs.meta}
                </span>
                <h3 className="font-display font-bold text-xl uppercase text-[#F4F1EA]">
                  {cs.client}
                </h3>
                {cs.result && (
                  <p className="text-sm text-[#A9A7A0] leading-relaxed">
                    {cs.result}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="service-faq-heading" className="border-t border-[#2A2A30] pt-12">
          <h2
            id="service-faq-heading"
            className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F4F1EA] mb-6"
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {service.faqs.map((faq) => (
              <div
                key={faq.question}
                className="p-5 rounded-xl border border-[#2A2A30] bg-[#121217]"
              >
                <h3 className="font-display font-bold text-lg text-[#F4F1EA]">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm text-[#A9A7A0] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-4 flex flex-wrap gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#C6FF3D] text-[#0B0B0F] font-mono text-xs font-bold uppercase tracking-wider"
          >
            <span>WhatsApp Studio (83004 78244)</span>
            <ArrowUpRight size={14} />
          </a>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-[#2A2A30] text-[#F4F1EA] font-mono text-xs uppercase tracking-wider hover:border-[#C6FF3D]"
          >
            <span>Open Project Brief</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
