import type { Metadata } from "next";
import { siteContent, getSiteBaseUrl } from "@/lib/site-content";
import { getMediaStreamUrl } from "@/lib/media-utils";
import { HomePageClient } from "@/components/home-page-client";

const siteUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  title: siteContent.seo.title,
  description: siteContent.seo.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteContent.seo.ogTitle,
    description: siteContent.seo.ogDescription,
    url: siteUrl,
    siteName: siteContent.seo.siteName,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: siteContent.seo.twitterCard,
    title: siteContent.seo.twitterTitle,
    description: siteContent.seo.twitterDescription,
  },
};

function mapAreaServedType(area: string): "City" | "State" | "Country" {
  const lower = area.trim().toLowerCase();
  if (lower === "india") return "Country";
  if (lower === "tamil nadu") return "State";
  return "City";
}

export default function Page() {
  const areas = siteContent.seo.business?.areaServed || [
    "Thoothukudi",
    "Tuticorin",
    "Tirunelveli",
    "Tamil Nadu",
    "India",
  ];
  const leadPerson = siteContent.people?.[0];
  const heroVideoPath = siteContent.hero?.videoSrc
    ? getMediaStreamUrl(siteContent.hero.videoSrc)
    : "";
  const heroVideoUrl = heroVideoPath.startsWith("http")
    ? heroVideoPath
    : heroVideoPath
      ? `${siteUrl}${heroVideoPath}`
      : "";
  const heroPosterUrl =
    siteContent.hero?.posterSrc || `${siteUrl}/images/og-preview.png`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: siteContent.seo.siteName || "27 Creative Studio",
      alternateName: [
        "27 Studio",
        "27 Creative Studio",
        "27CreativeStudio",
        "27 Creative Studio Thoothukudi",
      ],
      description: siteContent.seo.description,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-IN",
    },
    {
      "@type": ["LocalBusiness", "ProfessionalService"],
      "@id": `${siteUrl}/#organization`,
      name: siteContent.seo.business?.name || "27 Creative Studio",
      alternateName: [
        "27 Studio",
        "27 Creative Studio",
        "27CreativeStudio",
        "27 Creative Studio Thoothukudi",
      ],
      url: siteUrl,
      logo: `${siteUrl}/images/27-studio-symbol.png`,
      image: `${siteUrl}/images/og-preview.png`,
      description:
        siteContent.seo.business?.description || siteContent.seo.description,
      telephone: siteContent.seo.business?.telephone || "+91 83004 78244",
      email: siteContent.seo.business?.email || "hello@27creativestudio.com",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, UPI, Bank Transfer",
      hasMap:
        "https://maps.google.com/?q=Polpettai,+Thoothukudi,+Tamil+Nadu+628002",
      founder: {
        "@id": `${siteUrl}/#founder`,
      },
      address: {
        "@type": "PostalAddress",
        ...(siteContent.seo.business?.address || {
          streetAddress: "Polpettai / Ettayapuram Road",
          addressLocality: "Thoothukudi",
          addressRegion: "Tamil Nadu",
          postalCode: "628002",
          addressCountry: "IN",
        }),
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 8.7642,
        longitude: 78.1348,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: siteContent.seo.business?.telephone || "+91 83004 78244",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Tamil"],
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          opens: "09:00",
          closes: "20:00",
        },
      ],
      areaServed: areas.map((area) => ({
        "@type": mapAreaServedType(area),
        name: area,
      })),
      sameAs: (siteContent.seo.business?.sameAs || [
        "https://instagram.com/27creativestudio",
      ]).filter((u) => !u.startsWith("https://wa.me/")),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Video Production & Instagram Growth Services",
        itemListElement: (siteContent.packages || []).map((pkg) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: pkg.name,
            description: pkg.tagline || pkg.description,
          },
        })),
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#founder`,
      name: leadPerson?.name || "Ram Kumar",
      jobTitle: leadPerson?.role || "Creative Lead",
      worksFor: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ];

  if (heroVideoUrl) {
    graph.push({
      "@type": "VideoObject",
      "@id": `${siteUrl}/#hero-reel`,
      name: `${siteContent.seo.siteName} Showreel — ${siteContent.hero.posterLabel || "Thoothukudi Reels"}`,
      description: siteContent.hero.body,
      thumbnailUrl: [heroPosterUrl],
      contentUrl: heroVideoUrl,
      uploadDate: "2026-11-19T06:00:00+05:30",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HomePageClient />
    </>
  );
}
