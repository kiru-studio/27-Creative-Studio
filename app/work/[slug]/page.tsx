import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { getCaseStudyBySlug, getCaseStudyPages } from "@/lib/seo-pages";
import { getMediaStreamUrl } from "@/lib/media-utils";
import { getSiteBaseUrl, whatsappHref } from "@/lib/site-content";

const siteUrl = getSiteBaseUrl();

export function generateStaticParams() {
  return getCaseStudyPages().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) {
    return { title: "Case Study Not Found" };
  }

  const displayTitle =
    cs.client.toLowerCase() === cs.title.toLowerCase()
      ? cs.client
      : `${cs.client} — ${cs.title}`;
  const title = `${displayTitle} Case Study | 27 Creative Studio`;
  const description =
    cs.result ||
    cs.goal ||
    `How 27 Creative Studio grew ${cs.client} in ${cs.location || "Thoothukudi"}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/work/${cs.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/work/${cs.slug}`,
      siteName: "27 Creative Studio",
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: cs.posterSrc || "/images/og-preview.png",
          width: 2400,
          height: 1260,
          alt: displayTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cs.posterSrc || "/images/og-preview.png"],
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) {
    notFound();
  }

  const streamUrl = cs.videoSrc ? getMediaStreamUrl(cs.videoSrc) : "";
  const fullVideoUrl = streamUrl.startsWith("http")
    ? streamUrl
    : streamUrl
      ? `${siteUrl}${streamUrl}`
      : "";
  const displayTitle =
    cs.client.toLowerCase() === cs.title.toLowerCase()
      ? cs.client
      : `${cs.client} — ${cs.title}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Case Studies",
          item: `${siteUrl}/work`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: cs.client,
          item: `${siteUrl}/work/${cs.slug}`,
        },
      ],
    },
    {
      "@type": "Article",
      headline: `${displayTitle} — Instagram Growth & Video Production Case Study`,
      description: cs.result || cs.goal,
      author: {
        "@id": `${siteUrl}/#organization`,
        "@type": ["LocalBusiness", "ProfessionalService"],
        name: "27 Creative Studio",
        url: siteUrl,
      },
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      mainEntityOfPage: `${siteUrl}/work/${cs.slug}`,
    },
  ];

  if (fullVideoUrl) {
    graph.push({
      "@type": "VideoObject",
      name: `${cs.client} Campaign Film — 27 Creative Studio`,
      description: cs.shot || cs.result || cs.goal,
      thumbnailUrl: [cs.posterSrc || `${siteUrl}/images/og-preview.png`],
      contentUrl: fullVideoUrl,
      uploadDate: "2026-11-19T06:00:00+05:30",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    });
  }

  const allCases = getCaseStudyPages().filter((c) => c.slug !== cs.slug);

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#F4F1EA] p-6 sm:p-10 lg:p-16 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": graph,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <div className="faq-grain-overlay pointer-events-none" aria-hidden="true" />

      <header className="relative z-10 max-w-5xl mx-auto flex items-center justify-between border-b border-[#2A2A30] pb-6 mb-12 gap-4">
        <BrandLockup href="/" />
        <nav
          aria-label="Case study detail navigation"
          className="flex items-center gap-5 font-mono text-xs"
        >
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>ALL CASE STUDIES</span>
          </Link>
          <Link
            href="/services"
            className="text-[#A9A7A0] hover:text-[#C6FF3D] transition-colors"
          >
            SERVICES
          </Link>
        </nav>
      </header>

      <article className="relative z-10 max-w-5xl mx-auto space-y-12">
        <header>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs mb-3">
            <span className="text-[#C6FF3D] uppercase tracking-widest font-bold">
              {cs.label}
            </span>
            {cs.handle && <span className="text-[#A9A7A0]">{cs.handle}</span>}
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F1EA] leading-[0.95]">
            {displayTitle}
          </h1>
          {cs.location && (
            <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-[#A9A7A0]">
              <MapPin size={14} className="text-[#C6FF3D]" />
              <span>{cs.location}</span>
            </p>
          )}
        </header>

        <section
          aria-label="Verified growth metrics"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono"
        >
          {cs.growthMultiplier && (
            <div className="p-4 rounded-xl border border-[#2A2A30] bg-[#141419]">
              <span className="block text-[10px] text-[#7E7D88] uppercase">
                Growth Multiplier
              </span>
              <span className="mt-1 block text-2xl font-black text-[#C6FF3D]">
                {cs.growthMultiplier}
              </span>
              {cs.newFollowers && (
                <span className="block text-xs text-[#D0CDC6] mt-0.5">
                  {cs.newFollowers} new followers
                </span>
              )}
            </div>
          )}
          {cs.followersStart && cs.followersNow && (
            <div className="p-4 rounded-xl border border-[#2A2A30] bg-[#141419]">
              <span className="block text-[10px] text-[#7E7D88] uppercase">
                Follower Trajectory
              </span>
              <span className="mt-1 block text-xl font-bold text-[#F4F1EA]">
                {cs.followersStart} → {cs.followersNow}
              </span>
            </div>
          )}
          {cs.topViews && (
            <div className="p-4 rounded-xl border border-[#2A2A30] bg-[#141419]">
              <span className="block text-[10px] text-[#7E7D88] uppercase">
                Top Reel Views
              </span>
              <span className="mt-1 block text-2xl font-bold text-[#F4F1EA]">
                {cs.topViews}
              </span>
              {cs.postsCount && (
                <span className="block text-xs text-[#A9A7A0] mt-0.5">
                  {cs.postsCount} posts
                </span>
              )}
            </div>
          )}
          {cs.googleRating && (
            <div className="p-4 rounded-xl border border-[#2A2A30] bg-[#141419]">
              <span className="block text-[10px] text-[#7E7D88] uppercase">
                Google Maps Rating
              </span>
              <span className="mt-1 block text-2xl font-bold text-[#FFD700]">
                ★ {cs.googleRating}
              </span>
              {cs.googleReviews && (
                <span className="block text-xs text-[#A9A7A0] mt-0.5">
                  {cs.googleReviews}
                </span>
              )}
            </div>
          )}
        </section>

        {streamUrl && (
          <section aria-label="Campaign video reel" className="rounded-2xl overflow-hidden border border-[#2A2A30] bg-black aspect-video max-h-[520px]">
            <video
              src={streamUrl}
              poster={cs.posterSrc || undefined}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-contain"
              aria-label={`${cs.client} campaign video`}
            />
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[#2A2A30] pt-8">
          {cs.goal && (
            <div className="p-5 rounded-xl border border-[#2A2A30] bg-[#121217]">
              <h2 className="font-mono text-xs uppercase text-[#C6FF3D] font-bold mb-2">
                01 / Goal
              </h2>
              <p className="text-sm text-[#D0CDC6] leading-relaxed">{cs.goal}</p>
            </div>
          )}
          {cs.shot && (
            <div className="p-5 rounded-xl border border-[#2A2A30] bg-[#121217]">
              <h2 className="font-mono text-xs uppercase text-[#C6FF3D] font-bold mb-2">
                02 / What We Did
              </h2>
              <p className="text-sm text-[#D0CDC6] leading-relaxed">{cs.shot}</p>
            </div>
          )}
          {cs.result && (
            <div className="p-5 rounded-xl border border-[#2A2A30] bg-[#121217]">
              <h2 className="font-mono text-xs uppercase text-[#C6FF3D] font-bold mb-2">
                03 / Result
              </h2>
              <p className="text-sm text-[#D0CDC6] leading-relaxed">
                {cs.result}
              </p>
            </div>
          )}
        </section>

        {allCases.length > 0 && (
          <section className="border-t border-[#2A2A30] pt-10 space-y-4">
            <h2 className="font-display font-black text-2xl uppercase text-[#F4F1EA]">
              More Thoothukudi Case Studies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {allCases.map((other) => (
                <Link
                  key={other.slug}
                  href={`/work/${other.slug}`}
                  className="p-4 rounded-xl border border-[#2A2A30] bg-[#141419] hover:border-[#C6FF3D] transition-colors block"
                >
                  <span className="font-mono text-[10px] text-[#C6FF3D] uppercase">
                    {other.growthMultiplier || other.meta}
                  </span>
                  <h3 className="mt-1 font-display font-bold text-lg uppercase text-[#F4F1EA]">
                    {other.client}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#C6FF3D] text-[#0B0B0F] font-mono text-xs font-bold uppercase tracking-wider"
          >
            <span>Grow Your Brand Like {cs.client}</span>
            <ArrowUpRight size={14} />
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-[#2A2A30] text-[#F4F1EA] font-mono text-xs uppercase tracking-wider hover:border-[#C6FF3D]"
          >
            <span>WhatsApp Studio</span>
          </a>
        </div>
      </article>
    </main>
  );
}
