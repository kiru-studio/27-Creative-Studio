"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowUpRight,
  Clapperboard,
  FileText,
  Menu,
  Scissors,
  Send,
  VolumeX,
  X,
} from "lucide-react";
import { MediaSlot } from "@/components/media-slot";
import { BrandLockup } from "@/components/brand-lockup";
import { Hero, ViewfinderCursor } from "@/components/hero";
import { FilmSection } from "@/components/film-section";
import { ProcessSection } from "@/components/process";
import { AboutSection } from "@/components/about-section";
import { CasesSection } from "@/components/cases-section";
import { FilmStripStaggerTestimonials as TestimonialsSection } from "@/components/FilmStripStaggerTestimonials";
import { PackagesSection } from "@/components/packages-section";
import { FaqSection } from "@/components/faq-section";
import { ReelsSection } from "@/components/reels-section";
import { ContactSection as ContactSectionComponent } from "@/components/contact";
import { StickyMobileCta } from "@/components/ui/sticky-mobile-cta";
import {
  siteContent,
  whatsappHref,
  getSiteBaseUrl,
} from "@/lib/site-content";

const NAV_TICK_BASE_TOKENS = {
  medium: "--nav-tick-medium",
  long: "--nav-tick-long",
} as const;
const NAV_TICK_COUNT = 48;
const NAV_LINK_TICK_INDEXES = [2, 9, 16, 23, 30, 37, 44];

const NAV_ITEM_HREFS: Record<string, string> = {
  Work: "#work",
  Films: "#films",
  Process: "#process",
  Cases: "#cases",
  About: "#about",
  "Q&A": "#faq",
  Contact: "#contact",
};

const MOBILE_NAV_ITEMS = [
  { num: "01", name: "WORK", tag: "REELS", href: "#work" },
  { num: "02", name: "FILMS", tag: "CINEMATIC", href: "#films" },
  { num: "03", name: "PROCESS", tag: "4 STEPS", href: "#process" },
  { num: "04", name: "CASES", tag: "4 CLIENTS", href: "#cases" },
  { num: "05", name: "PACKAGES", tag: "WAYS TO WORK", href: "#packages" },
  { num: "06", name: "ABOUT", tag: "DIRECTORS", href: "#about" },
  { num: "07", name: "CONTACT", tag: "GET IN TOUCH", href: "#contact" },
];

function CornerBrackets() {
  return (
    <span className="corner-brackets" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {}
    if (reduced) {
      onDone();
      return;
    }
    let current = 3;
    const finish = () => {
      window.clearInterval(timer);
      onDone();
    };
    const timer = window.setInterval(() => {
      current -= 1;
      setCount(current);
      if (current <= 0) finish();
    }, 350);
    return () => window.clearInterval(timer);
  }, [onDone]);
  return (
    <div
      className="preloader"
      role="status"
      aria-label={siteContent.ui.preloaderLabel}
    >
      <span className="preloader-count" aria-hidden="true">
        {count}
      </span>
      <button type="button" onClick={onDone}>
        {siteContent.ui.skipIntro}
      </button>
    </div>
  );
}

function ReelViewer({
  items,
  initialIndex,
  onClose,
  returnFocusTo,
}: {
  items: typeof siteContent.reels;
  initialIndex: number;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [soundOn, setSoundOn] = useState(false);
  const startX = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const moveRef = useRef<(delta: number) => void>(() => {});
  const openerRef = useRef(returnFocusTo);
  const item = items[index];
  const move = useCallback(
    (delta: number) =>
      setIndex((current) => (current + delta + items.length) % items.length),
    [items.length],
  );
  onCloseRef.current = onClose;
  moveRef.current = move;
  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        moveRef.current(1);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        moveRef.current(-1);
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, []);
  return (
    <div
      className="lightbox reel-viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
      aria-describedby="viewer-details"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        className="viewer-panel"
        ref={panelRef}
        onTouchStart={(event) => {
          startX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (startX.current === null) return;
          const delta = event.changedTouches[0].clientX - startX.current;
          if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
          startX.current = null;
        }}
      >
        <button
          className="lightbox-close"
          ref={closeRef}
          onClick={() => onCloseRef.current()}
          aria-label={siteContent.ui.closeViewer}
        >
          <X size={18} />
        </button>
        <button
          className="viewer-arrow viewer-prev"
          onClick={() => move(-1)}
          aria-label={siteContent.ui.previousReel}
        >
          ‹
        </button>
        <div className={`reel-poster reel-poster-${index % 4}`}>
          {item.videoSrc ? (
            <video
              ref={videoRef}
              className="viewer-video"
              src={item.videoSrc}
              poster={item.posterSrc}
              controls
              muted={!soundOn}
              playsInline
              preload="none"
              aria-label={item.title}
            />
          ) : item.posterSrc ? (
            <img
              className="poster-image"
              src={item.posterSrc}
              alt={`${item.client || "Client"} — ${item.title}`}
            />
          ) : null}
          {!item.videoSrc && <span className="poster-play">{item.label}</span>}
        </div>
        <button
          className="viewer-arrow viewer-next"
          onClick={() => move(1)}
          aria-label={siteContent.ui.nextReel}
        >
          ›
        </button>
        <div className="viewer-copy">
          <p className="viewer-kicker" aria-live="polite" aria-atomic="true">
            {item.label} · {index + 1} / {items.length}
          </p>
          <h2 id="viewer-title">{item.title}</h2>
          <p id="viewer-details">
            {item.client ?? siteContent.ui.clientPlaceholder} ·{" "}
            {item.industries.filter((id) => id !== "everything").join(" / ") ||
              siteContent.ui.everyIndustry}
          </p>
          <p>
            {item.delivered ?? item.type} · {item.meta}
          </p>
          {item.videoSrc && (
            <button
              className="sound-toggle"
              onClick={() => setSoundOn((value) => !value)}
              aria-pressed={soundOn}
            >
              {soundOn ? siteContent.ui.soundOn : siteContent.ui.turnSoundOn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function SpeedSection() {
  return (
    <ProcessSection
      kicker={siteContent.ui.processKicker}
      heading={siteContent.ui.processHeading}
    />
  );
}




function ContactSection() {
  return (
    <ContactSectionComponent
      kicker={siteContent.ui.contactKicker}
      heading={siteContent.contact.heading}
      subline={siteContent.contact.body}
      serviceAreaNote={siteContent.contact.serviceArea}
    />
  );
}

function FooterSection() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer" aria-label={siteContent.ui.footerLabel}>
      <div className="footer-top">
        <div>
          <p className="footer-line">{siteContent.footer.line}</p>
          <BrandLockup href="#top" className="footer-brand" />
          <address className="not-italic mt-3 text-xs font-mono text-[var(--muted)] max-w-sm leading-relaxed">
            <span className="text-[var(--paper)] font-bold">Studio:</span>{" "}
            Polpettai / Ettayapuram Road, Thoothukudi, Tamil Nadu 628002
            <br />
            <a
              href="https://maps.google.com/?q=Polpettai,+Thoothukudi,+Tamil+Nadu+628002"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--industry)] hover:underline inline-flex items-center gap-1 mt-1"
            >
              <span>View on Google Maps</span>
              <span>↗</span>
            </a>
          </address>
        </div>
        <nav className="footer-nav" aria-label={siteContent.ui.footerNavigationLabel}>
          {siteContent.footer.nav.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>

      <div className="footer-socials">
        {siteContent.footer.socials.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[var(--muted)] gap-3">
        <p>© {currentYear} 27 Creative Studio. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>Thoothukudi · Tamil Nadu</span>
          <span className="text-[var(--industry)]">●</span>
          <span>4K · 24fps Production</span>
        </p>
      </div>
    </footer>
  );
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const navWaveFrameRef = useRef<number | null>(null);
  const navWavePointerYRef = useRef(0);
  const navWaveMetricsRef = useRef<{
    height: number;
    radius: number;
    amplitude: number;
    expandedWidth: number;
    ticks: { element: HTMLElement; center: number; baseWidth: number }[];
  } | null>(null);
  const [timecode, setTimecode] = useState("00:00:00:00");
  const [preloading, setPreloading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const viewerOpenerRef = useRef<HTMLElement | null>(null);
  const finishPreloader = useCallback(() => {
    try {
      if (sessionStorage.getItem("rec-mode-preloader-seen")) {
        setPreloading(false);
        return;
      }
      sessionStorage.setItem("rec-mode-preloader-seen", "1");
    } catch {}
    setPreloading(false);
  }, []);
  useEffect(() => {
    try {
      if (sessionStorage.getItem("rec-mode-preloader-seen"))
        setPreloading(false);
    } catch {}
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuToggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const frames = Math.floor((Date.now() - start) / 40);
      setTimecode(
        `00:00:${String(Math.floor(frames / 25) % 60).padStart(2, "0")}:${String(frames % 25).padStart(2, "0")}`,
      );
    }, 40);
    return () => window.clearInterval(id);
  }, []);

  const updateNavWave = (pointerY: number) => {
    const nav = navRef.current;
    if (!nav) return;

    navWavePointerYRef.current = pointerY;
    if (navWaveFrameRef.current !== null) return;

    const animateWave = () => {
      navWaveFrameRef.current = null;
      if (!nav.isConnected) return;
      const bounds = nav.getBoundingClientRect();
      let metrics = navWaveMetricsRef.current;
      if (!metrics || metrics.height !== bounds.height) {
        const navStyle = getComputedStyle(nav);
        const rootStyle = getComputedStyle(document.documentElement);
        const rootFontSize = Number.parseFloat(rootStyle.fontSize);
        const resolveLength = (value: string) => {
          const amount = Number.parseFloat(value);
          return value.trim().endsWith("rem") ? amount * rootFontSize : amount;
        };
        metrics = {
          height: bounds.height,
          radius: resolveLength(
            navStyle.getPropertyValue("--nav-wave-radius"),
          ),
          amplitude:
            Number.parseFloat(
              navStyle.getPropertyValue("--nav-wave-amplitude"),
            ) / 100,
          expandedWidth: resolveLength(
            navStyle.getPropertyValue("--nav-line-expanded"),
          ),
          ticks: [...nav.querySelectorAll<HTMLElement>("[data-nav-tick]")]
            .map((tick) => {
              const size = tick.dataset.navTickSize;
              const baseToken =
                size === "medium"
                  ? NAV_TICK_BASE_TOKENS.medium
                  : size === "long"
                    ? NAV_TICK_BASE_TOKENS.long
                    : null;
              if (!baseToken) return null;
              const rect = tick.getBoundingClientRect();
              const baseValue = rootStyle.getPropertyValue(baseToken);
              const baseAmount = Number.parseFloat(baseValue);
              const baseWidth = baseValue.trim().endsWith("rem")
                ? baseAmount * rootFontSize
                : baseAmount;
              return {
                element: tick,
                center: rect.top + rect.height / 2 - bounds.top,
                baseWidth,
              };
            })
            .filter(
              (
                tick,
              ): tick is {
                element: HTMLElement;
                center: number;
                baseWidth: number;
              } => tick !== null,
            ),
        };
        navWaveMetricsRef.current = metrics;
      }

      const targetY = Math.max(
        0,
        Math.min(navWavePointerYRef.current, metrics.height),
      );
      const waveY = targetY;
      const shortWaveTriggered = metrics.ticks.some(
        ({ element, center }) =>
          element.dataset.navLinkIndex === undefined &&
          metrics.amplitude *
            Math.exp(-0.5 * ((center - waveY) / metrics.radius) ** 2) >=
            0.16,
      );

      for (const { element, center, baseWidth } of metrics.ticks) {
        if (element.dataset.navLinkIndex !== undefined) {
          element.style.setProperty(
            "--nav-wave-width",
            `${shortWaveTriggered ? metrics.expandedWidth : baseWidth}px`,
          );
          element.style.setProperty("--nav-wave-strength", "0%");
          continue;
        }
        const distance = Math.abs(center - waveY);
        const falloff =
          metrics.amplitude *
          Math.exp(-0.5 * (distance / metrics.radius) ** 2);
        element.style.setProperty(
          "--nav-wave-width",
          `${baseWidth + (metrics.expandedWidth - baseWidth) * falloff}px`,
        );
        element.style.setProperty("--nav-wave-strength", `${falloff * 100}%`);
      }

      const activeLink = metrics.ticks
        .filter(({ element }) => element.dataset.navLinkIndex !== undefined)
        .reduce<{ index: number; distance: number } | null>(
          (nearest, { element, center }) => {
            const distance = Math.abs(center - waveY);
            return !nearest || distance < nearest.distance
              ? { index: Number(element.dataset.navLinkIndex), distance }
              : nearest;
          },
          null,
        );
      setActiveNavIndex((currentIndex) =>
        currentIndex === (activeLink?.index ?? null)
          ? currentIndex
          : (activeLink?.index ?? null),
      );
    };
    navWaveFrameRef.current = window.requestAnimationFrame(animateWave);
  };
  const resetNavWave = () => {
    const nav = navRef.current;
    if (navWaveFrameRef.current !== null) {
      window.cancelAnimationFrame(navWaveFrameRef.current);
      navWaveFrameRef.current = null;
    }
    navWaveMetricsRef.current?.ticks.forEach(({ element }) => {
      element.style.removeProperty("--nav-wave-width");
      element.style.removeProperty("--nav-wave-strength");
    });
    navWaveMetricsRef.current = null;
    setActiveNavIndex(null);
  };

  const resolvedSiteUrl = getSiteBaseUrl();
  const structuredDataGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${resolvedSiteUrl}/#website`,
        url: resolvedSiteUrl,
        name: siteContent.seo.siteName,
        description: siteContent.seo.description,
        publisher: {
          "@id": `${resolvedSiteUrl}/#organization`,
        },
        inLanguage: "en-IN",
      },
      {
        "@type": ["LocalBusiness", "ProfessionalService"],
        "@id": `${resolvedSiteUrl}/#organization`,
        name: siteContent.seo.business.name,
        alternateName: ["27 Studio", "27 Creative Studio Thoothukudi"],
        url: resolvedSiteUrl,
        logo: `${resolvedSiteUrl}/images/27-studio-symbol.png`,
        image: `${resolvedSiteUrl}/images/og-preview.png`,
        description: siteContent.seo.business.description,
        telephone: siteContent.seo.business.telephone,
        email: siteContent.seo.business.email,
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, UPI, Bank Transfer",
        address: {
          "@type": "PostalAddress",
          ...siteContent.seo.business.address,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 8.7642,
          longitude: 78.1348,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "09:00",
            closes: "20:00",
          },
        ],
        areaServed: siteContent.seo.business.areaServed.map((area) => ({
          "@type": "City",
          name: area,
        })),
        sameAs: siteContent.seo.business.sameAs,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Video Production & Instagram Growth Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Short-Form Vertical Reels (9:16)",
                description:
                  "High-velocity vertical video production tailored for Instagram algorithm distribution and local business conversion in Thoothukudi.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Cinematic Brand Films (16:9)",
                description:
                  "Commercial ad films, showroom walkthroughs, hotel cinematic showcases, and documentary brand stories.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "End-to-End Instagram Growth Management",
                description:
                  "Content calendar planning, shoot-to-publish execution, analytics tracking, and community engagement.",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredDataGraph),
        }}
      />
      {preloading && <Preloader onDone={finishPreloader} />}
      <ViewfinderCursor />
      <a className="skip-link" href="#hero-heading">
        {siteContent.ui.skipLink}
      </a>
      <header className="site-header pointer-events-none flex justify-end">
        <nav
          id="main-navigation"
          ref={navRef}
          className={`${menuOpen ? "nav-open " : ""}pointer-events-auto`}
          data-wave-active={activeNavIndex !== null}
          aria-label="Main navigation"
          onPointerMove={(event) => {
            updateNavWave(event.clientY - event.currentTarget.getBoundingClientRect().top);
          }}
          onPointerLeave={resetNavWave}
        >
          {Array.from({ length: NAV_TICK_COUNT }, (_, tick) => {
            const navIndex = NAV_LINK_TICK_INDEXES.indexOf(tick);
            const label = siteContent.nav[navIndex];
            const href = label ? (NAV_ITEM_HREFS[label] || `#${label.toLowerCase()}`) : undefined;
            const tickSize = label ? "long" : "medium";
            const rulerTick = (
              <span
                className="nav-stagger-line"
                data-nav-tick
                data-nav-tick-size={label ? "long" : tickSize}
                data-nav-link-index={label ? navIndex : undefined}
                aria-hidden="true"
              />
            );

            if (!label || !href) {
              return (
                <span className="nav-ruler-tick" key={`tick-${tick}`}>
                  {rulerTick}
                </span>
              );
            }

            return (
              <a
                key={label}
                href={href}
                data-stagger-active={activeNavIndex === navIndex}
                onFocus={(event) => {
                  const navBounds = navRef.current?.getBoundingClientRect();
                  if (navBounds) {
                    const linkBounds = event.currentTarget.getBoundingClientRect();
                    updateNavWave(
                      linkBounds.top + linkBounds.height / 2 - navBounds.top,
                    );
                  }
                }}
                onBlur={resetNavWave}
                onClick={() => setMenuOpen(false)}
              >
                {rulerTick}
                <span className="nav-stagger-label">{label}</span>
              </a>
            );
          })}
        </nav>
        <button
          className="menu-toggle pointer-events-auto !ml-auto"
          style={{ marginLeft: "auto" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={
            menuOpen ? siteContent.ui.menuOpen : siteContent.ui.menuClosed
          }
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Cinematic HUD Navigation Trigger */}
      <button
        className="mobile-nav-trigger pointer-events-auto"
        ref={menuToggleRef}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={
          menuOpen ? siteContent.ui.menuOpen : siteContent.ui.menuClosed
        }
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
      >
        <span className="mobile-nav-trigger-label">
          {menuOpen ? "CLOSE" : "MENU"}
        </span>
        {menuOpen ? (
          <span className="mobile-nav-close-icon" aria-hidden="true">✕</span>
        ) : (
          <div className="mobile-nav-ticks" aria-hidden="true">
            <span className="mobile-nav-tick-1" />
            <span className="mobile-nav-tick-2" />
            <span className="mobile-nav-tick-3" />
          </div>
        )}
      </button>

      {/* Mobile Full-Screen Director's Slate Drawer */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Director site navigation"
          className="mobile-nav-drawer"
        >
          {/* Viewfinder Corner Brackets */}
          <div className="mobile-drawer-brackets" aria-hidden="true">
            <span className="mobile-drawer-bracket-tl" />
            <span className="mobile-drawer-bracket-tr" />
            <span className="mobile-drawer-bracket-bl" />
            <span className="mobile-drawer-bracket-br" />
          </div>

          {/* Top HUD Header */}
          <div className="mobile-drawer-header">
            <BrandLockup
              href="#top"
              className="mobile-drawer-brand"
              onClick={() => setMenuOpen(false)}
            />
            <div className="flex items-center gap-3">
              <span className="mobile-drawer-timecode">{timecode}</span>
              <button
                className="mobile-drawer-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
              >
                <span>CLOSE</span>
                <span aria-hidden="true">✕</span>
              </button>
            </div>
          </div>

          {/* Nav List with Big Shoulders typography & Scene tags */}
          <nav className="mobile-drawer-nav">
            {MOBILE_NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="mobile-drawer-item group"
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex items-baseline">
                  <span className="mobile-drawer-num">{item.num} //</span>
                  <span className="mobile-drawer-title">{item.name}</span>
                </div>
                <div className="mobile-drawer-tag">
                  <span>{item.tag}</span>
                  <span className="text-[var(--industry)]">↗</span>
                </div>
              </a>
            ))}
          </nav>

          {/* Bottom HUD Footer Bar */}
          <div className="mobile-drawer-footer">
            <div className="flex flex-col">
              <span className="mobile-drawer-loc-label">LOCATION</span>
              <span className="mobile-drawer-loc-val">THOOTHUKUDI, TN</span>
            </div>
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="mobile-drawer-cta"
            >
              GROW YOUR BRAND ↗
            </a>
          </div>
        </div>
      )}
      <Hero />
      <ReelsSection
        onOpenViewer={(index, opener) => {
          viewerOpenerRef.current = opener;
          setViewerIndex(index);
        }}
      />
      <FilmSection />
      <SpeedSection />
      <CasesSection />
      <AboutSection />
      <TestimonialsSection />
      <PackagesSection />
      <FaqSection />
      <ContactSection />
      <FooterSection />
      <a
        className="whatsapp-fab hidden sm:flex"
        href={whatsappHref}
        aria-label={siteContent.ui.whatsappAriaLabel}
      >
        <span>{siteContent.contact.whatsappLabel}</span>
        <ArrowUpRight size={15} />
      </a>
      <StickyMobileCta />
      {lightboxOpen && (
        <ReelViewer
          items={siteContent.reels}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
          returnFocusTo={viewerOpenerRef.current}
        />
      )}
      {viewerIndex !== null && siteContent.reels[viewerIndex] && (
        <ReelViewer
          items={siteContent.reels}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          returnFocusTo={viewerOpenerRef.current}
        />
      )}
    </main>
  );
}
