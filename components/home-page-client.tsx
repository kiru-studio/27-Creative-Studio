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
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
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
import { siteContent } from "@/lib/site-content";
import { getMediaStreamUrl } from "@/lib/media-utils";

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
  Packages: "#packages",
  About: "#about",
  "Q&A": "#faq",
  Questions: "#faq",
  FAQ: "#faq",
  Contact: "#contact",
};

const MOBILE_NAV_ITEMS = [
  { num: "01", name: "WORK", tag: "REELS", href: "#work" },
  { num: "02", name: "FILMS", tag: "CINEMATIC", href: "#films" },
  { num: "03", name: "PROCESS", tag: "4 STEPS", href: "#process" },
  { num: "04", name: "CASES", tag: "4 CLIENTS", href: "#cases" },
  { num: "05", name: "PACKAGES", tag: "WAYS TO WORK", href: "#packages" },
  { num: "06", name: "ABOUT", tag: "DIRECTORS", href: "#about" },
  { num: "07", name: "QUESTIONS", tag: "Q&A", href: "#faq" },
  { num: "08", name: "CONTACT", tag: "GET IN TOUCH", href: "#contact" },
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
              src={getMediaStreamUrl(item.videoSrc)}
              poster={item.posterSrc}
              controls
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
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
      {/* Upper Tier: Quote on Left, 27 Creative Studio on Right */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
        <div className="flex-1 max-w-xl">
          <p className="footer-line">{siteContent.footer.line}</p>
        </div>
        <div className="w-full md:w-[360px] flex items-center justify-start">
          <BrandLockup href="#top" className="footer-brand" />
        </div>
      </div>

      {/* Lower Tier: Address on Left, Navigation Grid on Right */}
      <div className="mt-8 flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12">
        <div className="flex-1 max-w-xl">
          <address className="not-italic text-xs font-mono text-[var(--muted)] max-w-sm leading-relaxed">
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

        <div className="w-full md:w-[360px] flex justify-start">
          <nav
            className="footer-nav !grid !grid-cols-3 !gap-x-6 !gap-y-3 w-full"
            aria-label={siteContent.ui.footerNavigationLabel}
          >
            {siteContent.footer.nav.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
          </nav>
        </div>
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

      <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-[var(--muted)] gap-3">
        <p>© {currentYear} 27 Creative Studio. All rights reserved.</p>
        <p className="footer-legal">
          Explore{" "}
          <a href="/services">Services</a>
          {" · "}
          <a href="/work">Case Studies</a>
          {" · "}
          <a href="/terms">Terms of Service</a>
          {" · "}
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
}

export function HomePageClient() {
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
  const [preloading, setPreloading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const viewerOpenerRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useHydratedReducedMotion();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrolledNavIndex, setScrolledNavIndex] = useState<number>(0);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const navHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  const handleNavPointerEnter = useCallback(() => {
    if (navHoverTimeoutRef.current) {
      clearTimeout(navHoverTimeoutRef.current);
      navHoverTimeoutRef.current = null;
    }
    setIsNavHovered(true);
  }, []);

  const handleNavPointerLeave = useCallback(() => {
    if (navHoverTimeoutRef.current) {
      clearTimeout(navHoverTimeoutRef.current);
    }
    navHoverTimeoutRef.current = setTimeout(() => {
      setIsNavHovered(false);
      resetNavWave();
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (navHoverTimeoutRef.current) {
        clearTimeout(navHoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY <= 40) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        setHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;

      // Track active section for sidebar ruler / scroll spy
      const sectionIds = ["work", "films", "process", "cases", "about", "faq", "contact"];
      
      // If near or at the bottom of the page, activate the last section (Contact)
      const isAtBottom =
        window.innerHeight + currentScrollY >=
        document.documentElement.scrollHeight - 80;
      if (isAtBottom) {
        setScrolledNavIndex(sectionIds.length - 1);
        return;
      }

      const scrollPosition = currentScrollY + window.innerHeight * 0.35;
      let matchedIndex = 0;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.getBoundingClientRect().top + currentScrollY;
          if (top <= scrollPosition) {
            matchedIndex = i;
            break;
          }
        }
      }
      setScrolledNavIndex(matchedIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
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
          element.style.setProperty("--nav-wave-width", `${baseWidth}px`);
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

  return (
    <main id="top">
      {preloading && <Preloader onDone={finishPreloader} />}
      <ViewfinderCursor />
      <a className="skip-link" href="#hero-heading">
        {siteContent.ui.skipLink}
      </a>
      {/* Desktop Screen Dimmer when Sidebar is hovered */}
      <div
        className="sidebar-dim-overlay hidden sm:block"
        data-active={isNavHovered}
        aria-hidden="true"
      />
      <header className="site-header pointer-events-none flex justify-end">
        <nav
          id="main-navigation"
          ref={navRef}
          className={`${menuOpen ? "nav-open " : ""}pointer-events-auto`}
          data-wave-active={activeNavIndex !== null}
          data-nav-hovered={isNavHovered}
          aria-label="Main navigation"
          onPointerEnter={handleNavPointerEnter}
          onPointerMove={(event) => {
            if (!isNavHovered) handleNavPointerEnter();
            updateNavWave(event.clientY - event.currentTarget.getBoundingClientRect().top);
          }}
          onPointerLeave={handleNavPointerLeave}
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

            const isItemActive =
              activeNavIndex !== null
                ? activeNavIndex === navIndex
                : scrolledNavIndex === navIndex;

            return (
              <a
                key={label}
                href={href}
                data-stagger-active={isItemActive}
                onMouseEnter={() => {
                  setActiveNavIndex(navIndex);
                }}
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
                onClick={(event) => {
                  if (href && href.startsWith("#")) {
                    event.preventDefault();
                    event.currentTarget.blur();
                    const targetId = href.slice(1);
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                      setActiveNavIndex(null);
                      setScrolledNavIndex(navIndex);
                      targetEl.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      window.history.pushState(null, "", href);
                    }
                  }
                  setMenuOpen(false);
                }}
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

      {/* Mobile Auto-Hide Unified Header Bar */}
      <header
        className={`sm:hidden fixed top-0 left-0 right-0 z-[1000] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          headerVisible || menuOpen ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled || menuOpen
            ? "bg-[color-mix(in_srgb,var(--ink,#0B0B0F)_95%,transparent)] backdrop-blur-md border-b border-[var(--line,#2A2A30)]"
            : "bg-transparent border-b border-transparent"
        } px-4 py-3`}
      >
        <div className="relative flex items-center justify-between w-full">
          <div className="flex items-center shrink-0">
            <BrandLockup href="#top" onClick={() => menuOpen && setMenuOpen(false)} />
          </div>

          {/* Center: Live Timecode Timer (Only shown on viewports with sufficient width to avoid colliding with brand mark) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 hidden min-[540px]:flex items-center justify-center font-mono text-xs text-[var(--muted,#A9A7A0)] tracking-widest tabular-nums select-none pointer-events-none"
            aria-live="off"
          >
            {timecode}
          </div>

          <button
            ref={menuToggleRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={
              menuOpen ? siteContent.ui.menuOpen : siteContent.ui.menuClosed
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="flex items-center gap-2 py-1 px-1 bg-transparent border-0 outline-none cursor-pointer text-[var(--paper,#F3F3F5)] hover:text-[var(--industry,#C6FF3D)] transition-colors select-none"
          >
            <span className="font-mono text-xs font-bold tracking-widest uppercase text-[var(--paper,#F3F3F5)]">
              {menuOpen ? "CLOSE" : "MENU"}
            </span>
            {menuOpen ? (
              <span className="font-mono text-sm text-[var(--industry,#C6FF3D)] leading-none" aria-hidden="true">✕</span>
            ) : (
              <div className="flex flex-col items-end gap-[3px] w-3.5" aria-hidden="true">
                <span className="w-3.5 h-[1.5px] bg-[var(--industry,#C6FF3D)] rounded-full" />
                <span className="w-2.5 h-[1.5px] bg-[var(--industry,#C6FF3D)] rounded-full" />
                <span className="w-3.5 h-[1.5px] bg-[var(--industry,#C6FF3D)] rounded-full" />
              </div>
            )}
          </button>
        </div>
      </header>

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

          {/* Nav List with Big Shoulders typography & Scene tags */}
          <nav className="mobile-drawer-nav">
            {MOBILE_NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="mobile-drawer-item group"
                onClick={(event) => {
                  if (item.href.startsWith("#")) {
                    event.preventDefault();
                    const targetId = item.href.slice(1);
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                      targetEl.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      window.history.pushState(null, "", item.href);
                    }
                  }
                  setMenuOpen(false);
                }}
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
              <span className="mobile-drawer-loc-label">LOCATION // 24FPS</span>
              <span className="mobile-drawer-loc-val">THOOTHUKUDI, TN • {timecode}</span>
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
