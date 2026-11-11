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
  Moon,
  Sun,
  X,
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { Hero } from "@/components/hero";
import { FilmSection } from "@/components/film-section";
import { ProcessSection } from "@/components/process";
import { AboutSection } from "@/components/about-section";
import { CasesSection } from "@/components/cases-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { PackagesSection } from "@/components/packages-section";
import { FaqSection } from "@/components/faq-section";
import { ReelsSection } from "@/components/reels-section";
import { ContactSection as ContactSectionComponent } from "@/components/contact";
import {
  siteContent,
  whatsappHref,
} from "@/lib/site-content";

const NAV_ITEM_HREFS: Record<string, string> = {
  Home: "#hero",
  Work: "#work",
  Films: "#films",
  Process: "#process",
  Cases: "#cases",
  About: "#about",
  "Q&A": "#faq",
  Contact: "#contact",
};

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
            <VideoPlayer
              src={item.videoSrc}
              poster={item.posterSrc}
              title={item.title}
              subtitle={item.client}
              aspectRatio="reel"
              autoPlay={true}
              muted={!soundOn}
              compact={true}
              className="w-full h-full border-0"
            />
          ) : item.posterSrc ? (
            <img className="poster-image" src={item.posterSrc} alt="" />
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
  return (
    <footer className="footer" aria-label={siteContent.ui.footerLabel}>
      <div className="footer-top">
        <div>
          <p className="footer-line">{siteContent.footer.line}</p>
          <div className="footer-brand font-mono uppercase mt-2 select-none">
            <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-[var(--paper)] block leading-none">
              {siteContent.brand.name}
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[var(--muted)] font-semibold block mt-1">
              {siteContent.brand.descriptor}
            </span>
          </div>
        </div>
        <nav className="footer-nav" aria-label={siteContent.ui.footerNavigationLabel}>
          {siteContent.footer.nav.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
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
    </footer>
  );
}

export default function Page() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeTransition, setThemeTransition] = useState<{
    phase: "cover" | "reveal";
    target: "dark" | "light";
  } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerOpenerRef = useRef<HTMLElement | null>(null);
  const [showFab, setShowFab] = useState(false);
  const updateTheme = (nextTheme: "dark" | "light") => {
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    try {
      window.localStorage.setItem("rec-mode-theme", nextTheme);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }
  };
  const finishThemeTransition = () => {
    if (themeTransition?.phase === "cover") {
      updateTheme(themeTransition.target);
      setThemeTransition({ ...themeTransition, phase: "reveal" });
      return;
    }
    delete document.documentElement.dataset.themeTransitionTarget;
    setThemeTransition(null);
  };
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      // Reveal floating WhatsApp action button after scrolling past hero section
      setShowFab(window.scrollY > 280);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: siteContent.seo.business.name,
            description: siteContent.seo.business.description,
            url: siteContent.seo.url,
            email: siteContent.seo.business.email,
            telephone: siteContent.seo.business.telephone,
            areaServed: siteContent.seo.business.areaServed,
            address: {
              "@type": "PostalAddress",
              ...siteContent.seo.business.address,
            },
            sameAs: siteContent.seo.business.sameAs,
          }),
        }}
      />
      <a className="skip-link" href="#hero-heading">
        {siteContent.ui.skipLink}
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <a
            className="wordmark"
            href="#hero"
            aria-label={siteContent.ui.homeLabel}
          >
            <span>{siteContent.brand.name}</span>
            <small>{siteContent.brand.descriptor}</small>
          </a>
          <div className="site-header-actions">
            <nav
              className="site-navigation"
              aria-label={siteContent.ui.headerNavigationLabel}
            >
              {siteContent.nav.map((label) => {
                const href = NAV_ITEM_HREFS[label];
                return href ? (
                  <a key={label} href={href}>
                    {label}
                  </a>
                ) : null;
              })}
            </nav>
            <details className="mobile-navigation">
              <summary aria-label={siteContent.ui.menuClosed}>
                <span className="mobile-menu-icon" aria-hidden="true">
                  <i />
                  <i />
                </span>
                <span>{siteContent.ui.mobileMenuLabel}</span>
              </summary>
              <nav
                aria-label={siteContent.ui.headerNavigationLabel}
                onClick={(event) => {
                  if (event.target instanceof HTMLAnchorElement) {
                    event.currentTarget.closest("details")?.removeAttribute("open");
                  }
                }}
              >
                {siteContent.nav.map((label) => {
                  const href = NAV_ITEM_HREFS[label];
                  return href ? (
                    <a key={label} href={href}>
                      {label}
                    </a>
                  ) : null;
                })}
                <a className="header-cta" href={whatsappHref}>
                  {siteContent.contact.bookOnWhatsApp}
                </a>
              </nav>
            </details>
            <a className="header-cta" href={whatsappHref}>
              {siteContent.contact.bookOnWhatsApp}
            </a>
            <button
              type="button"
              className="theme-toggle"
              disabled={themeTransition !== null}
              aria-label={
                theme === "dark"
                  ? siteContent.ui.switchToLightTheme
                  : siteContent.ui.switchToDarkTheme
              }
              aria-pressed={theme === "light"}
              onClick={() => {
                const nextTheme = theme === "dark" ? "light" : "dark";
                const reduceMotion = window.matchMedia(
                  "(prefers-reduced-motion: reduce)",
                ).matches;
                if (reduceMotion) {
                  updateTheme(nextTheme);
                } else {
                  document.documentElement.dataset.themeTransitionTarget =
                    nextTheme;
                  setThemeTransition({ phase: "cover", target: nextTheme });
                }
              }}
            >
              {theme === "dark" ? (
                <Sun size={18} aria-hidden="true" />
              ) : (
                <Moon size={18} aria-hidden="true" />
              )}
              <span className="theme-toggle-label">
                {siteContent.ui.themeToggleLabel}
              </span>
            </button>
          </div>
        </div>
      </header>
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
      {showFab && (
        <a
          className="whatsapp-fab"
          href={whatsappHref}
          aria-label={siteContent.ui.whatsappAriaLabel}
        >
          <span className="hidden sm:inline">{siteContent.contact.whatsappLabel}</span>
          <span className="sm:hidden font-mono font-bold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
            WHATSAPP
          </span>
          <ArrowUpRight size={15} />
        </a>
      )}
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
      {themeTransition && (
        <div
          className="theme-aperture-transition"
          data-phase={themeTransition.phase}
          aria-hidden="true"
          onAnimationEnd={finishThemeTransition}
        />
      )}
    </main>
  );
}
