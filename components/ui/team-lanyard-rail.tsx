"use client";

import * as React from "react";
import { siteContent } from "@/lib/site-content";

export interface LanyardLink {
  label: string;
  href: string;
}

export interface LanyardMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  portrait?: string;
  image?: string;
  bio?: string;
  signatureGear?: string;
  signatureAesthetic?: string;
  featuredWork?: string;
  tagline?: string;
  team?: string;
  tags?: string[];
  links?: LanyardLink[];
  tone?: 1 | 2 | 3 | 4 | 5;
  drop?: number;
  gear?: string;
  focalLength?: string;
  passId?: string;
  access?: string;
  stats?: string;
  instagram?: string;
}

export interface TeamLanyardRailLabels {
  flip: string;
  back: string;
  show: string;
}

export interface TeamLanyardRailProps extends React.ComponentProps<"section"> {
  items: LanyardMember[];
  eyebrow?: string;
  heading?: string;
  caption?: string;
  action?: React.ReactNode;
  autoplay?: boolean;
  interval?: number;
  active?: number | null;
  onActiveChange?: (index: number | null) => void;
  flipped?: number | null;
  onFlippedChange?: (index: number | null) => void;
  labels?: TeamLanyardRailLabels;
}

const RATIO = 1004 / 591; // Exactly matches Canva template aspect ratio 591x1004 (~1.6988)
const MAX_W = 224;
const MIN_RAIL_W = 120;
const EM = 11.2;
const RAIL_PITCH_MIN = 1.18;
const CAROUSEL_PITCH = 1.25;
const GAP = 0.08;
const PERSPECTIVE = 1000;
const MAX_STRETCH = 64;
const FIRST_DELAY = 1200;
const FLIP_DELAY = 700;
const SWING_K = 28;
const SWING_DAMP = 2.2;
const LAG = 0.12;
const REEL_K = 220;
const REEL_ZETA = 0.5;
const REST_Y = [5, -6, 4, -5, 6, -4];
const REST_Z = [-1.4, 1.2, -1.8, 1.5, -1.2, 1.6];
const RHYTHMIC_DROPS = [38, 82, 18, 68, 44, 88, 28];

export function getMemberDrop(index: number, count: number, customDrop?: number): number {
  if (typeof customDrop === "number" && !isNaN(customDrop)) return customDrop;
  if (count === 1) return 46;
  if (count === 2) return index === 0 ? 36 : 74;
  if (count === 3) return [38, 82, 18][index] ?? 42;
  if (count === 4) return [36, 80, 20, 66][index] ?? 42;
  return RHYTHMIC_DROPS[index % RHYTHMIC_DROPS.length] ?? 42;
}

const DEFAULT_LABELS: TeamLanyardRailLabels = {
  flip: siteContent.ui.teamRailFlipHint,
  back: siteContent.ui.teamRailBackHint,
  show: siteContent.ui.teamRailShowLabel,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function soft(distance: number, max: number) {
  const knee = max * 0.75;
  if (distance <= knee) return distance;
  return knee + (max - knee) * (1 - Math.exp(-(distance - knee) / (max - knee)));
}

function geometry(W: number, items: LanyardMember[]) {
  const u = W / 196;
  const H = W * RATIO;
  const railR = Math.max(3.2, 4.2 * u);
  const railY = 16 + railR;
  const ring = 9 * u;
  const pivotY = railY + ring * 0.8;
  const strapW = Math.max(14, 17 * u);
  const crimp = 7 * u;
  const reel = 20 * u;
  const cordRest = 10 * u;
  const clipH = 22 * u;
  const clipW = 28 * u;
  const base = 42 * u;
  const count = items.length;
  const straps = items.map(
    (item, i) =>
      base + Math.max(0, getMemberDrop(i, count, item.drop)) * u
  );
  const reelTops = straps.map((len) => pivotY + len + crimp * 0.6);
  const clipTops = reelTops.map((top) => top + reel * 0.82 + cordRest);
  const cardTops = clipTops.map((top) => top + clipH * 0.65);
  const pendulum = cardTops.map((top) => top + H / 2 - pivotY);
  const restLength =
    pivotY +
    base +
    crimp * 0.6 +
    reel * 0.82 +
    cordRest +
    clipH * 0.65 +
    H / 2 -
    pivotY;
  const bottom = Math.max(0, ...cardTops.map((top) => top + H));
  // Safe physics buffer with 1.25x flip zoom clearance: 72 * u + 56px clearance
  const height = Math.ceil(bottom + 72 * u + 56);
  return {
    W,
    H,
    u,
    railR,
    railY,
    ring,
    pivotY,
    strapW,
    crimp,
    reel,
    cordRest,
    clipH,
    clipW,
    straps,
    reelTops,
    clipTops,
    cardTops,
    pendulum,
    swingK: pendulum.map((len) => (SWING_K * restLength) / len),
    couple: pendulum.map((len) => (0.25 * 57.3) / len),
    maxStretch: Math.round(MAX_STRETCH * Math.min(1, W / 118)),
    height,
  };
}

function layoutTargets(
  width: number,
  W: number,
  carousel: boolean,
  center: number | null,
  count: number
) {
  if (!carousel) {
    if (count <= 1) {
      return { xs: [width / 2], total: 0 };
    }
    if (count === 2) {
      const gap = Math.min(W * 1.6, Math.max(W * 1.1, (width - W * 2) * 0.45));
      const span = W + gap;
      return { xs: [width / 2 - span / 2, width / 2 + span / 2], total: 0 };
    }
    const idealPitch = Math.min(W * 1.5, Math.max(W * 1.18, 260));
    const totalSpan = idealPitch * (count - 1);
    const maxSpan = Math.max(0, width - W - 80);
    const span = Math.min(totalSpan, maxSpan);
    const pitch = span / (count - 1);
    const first = width / 2 - (pitch * (count - 1)) / 2;
    const xs = Array.from({ length: count }, (_, i) => first + i * pitch);
    return { xs, total: 0 };
  }
  const pitch = W * CAROUSEL_PITCH;
  const total = pitch * count;
  const cyclic = count > 2 && total >= width + W * 2;
  const c = center ?? 0;
  const xs = Array.from({ length: count }, (_, i) => {
    let k = i - c;
    if (cyclic) {
      k = ((k % count) + count) % count;
      if (k >= count / 2) k -= count;
    }
    return width / 2 + k * pitch;
  });
  return { xs, total: cyclic ? total : 0 };
}

type Sim = {
  x: number[];
  vx: number[];
  px: number[];
  tx: number[];
  sw: number[];
  vsw: number[];
  beta: number[];
  ry: number[];
  vry: number[];
  tr: number[];
  rz: number[];
  vrz: number[];
  tz: number[];
  lift: number[];
  vlift: number[];
  tl: number[];
  pop: number[];
  vpop: number[];
  tp: number[];
  st: number[];
  vst: number[];
  drag: number;
  grab: number;
  pull: number;
  free: number;
  last: number;
  raf: number;
  carousel: boolean | null;
};

function emptySim(): Sim {
  return {
    x: [],
    vx: [],
    px: [],
    tx: [],
    sw: [],
    vsw: [],
    beta: [],
    ry: [],
    vry: [],
    tr: [],
    rz: [],
    vrz: [],
    tz: [],
    lift: [],
    vlift: [],
    tl: [],
    pop: [],
    vpop: [],
    tp: [],
    st: [],
    vst: [],
    drag: -1,
    grab: 0,
    pull: -1,
    free: 0,
    last: 0,
    raf: 0,
    carousel: null,
  };
}

function spring(
  value: number[],
  velocity: number[],
  target: number,
  i: number,
  k: number,
  zeta: number,
  h: number
) {
  const v = velocity[i] ?? 0;
  const x = value[i] ?? 0;
  const next = v + (-k * (x - target) - 2 * zeta * Math.sqrt(k) * v) * h;
  velocity[i] = next;
  value[i] = x + next * h;
}

function badgeWidth(s: Sim, W: number, i: number) {
  return W * (1 + 0.08 * (s.pop[i] ?? 0));
}

function minGap(s: Sim, W: number, a: number, b: number) {
  return (badgeWidth(s, W, a) + badgeWidth(s, W, b)) / 2 + W * GAP;
}

function stops(s: Sim, W: number, width: number, count: number) {
  const edge = Math.max(W / 2 + 16, width * 0.05);
  const left = Math.max(edge, badgeWidth(s, W, 0) / 2 + 16);
  const right = Math.min(
    width - edge,
    width - badgeWidth(s, W, count - 1) / 2 - 16
  );
  return [left, right] as const;
}

type EdgeGeometry = {
  W: number;
  H: number;
  pivotY: number;
  clipTops: number[];
  cardTops: number[];
};

function cardEdge(s: Sim, g: EdgeGeometry, i: number, side: 1 | -1) {
  const theta = ((s.sw[i] ?? 0) * Math.PI) / 180;
  const psi = (((s.beta[i] ?? 0) + (s.rz[i] ?? 0)) * Math.PI) / 180;
  const scale = 1 + 0.08 * (s.pop[i] ?? 0);
  const clipDepth =
    (g.clipTops[i] ?? 0) + (s.st[i] ?? 0) - 4 * (s.lift[i] ?? 0) - g.pivotY;
  const offset = (g.cardTops[i] ?? 0) - (g.clipTops[i] ?? 0);
  const cx = (s.x[i] ?? 0) - clipDepth * Math.sin(theta);
  const half = (g.W / 2) * scale * Math.cos(psi) * side;
  return [
    cx + half - offset * scale * Math.sin(psi),
    cx + half - (offset + g.H) * scale * Math.sin(psi),
    clipDepth + offset * scale,
    clipDepth + (offset + g.H) * scale,
  ] as const;
}

function LinkIcon({ label }: { label: string }) {
  if (/whatsapp|chat|wa/i.test(label)) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-[1.1em] shrink-0 fill-current"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-[1.05em] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11 11 5M6.2 5H11v4.8" />
    </svg>
  );
}

function InstagramIcon({
  className = "size-3.5",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Hole() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
      style={{
        top: "calc(14 * var(--p, 0.1692cqw))",
        width: "calc(64 * var(--p, 0.1692cqw))",
        height: "calc(16 * var(--p, 0.1692cqw))",
      }}
    >
      <div
        className="w-full h-full rounded-full bg-[#0a0a0f] border border-white/20"
        style={{
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.85), 0 1px 1px rgba(255,255,255,0.45)",
        }}
      />
    </div>
  );
}

function HoloFoil() {
  return (
    <div
      aria-hidden="true"
      className="relative size-5 shrink-0 rounded-[2.5px] overflow-hidden border border-white/40 shadow-[0_2px_6px_rgba(0,0,0,0.85)] select-none pointer-events-none"
      style={{
        background:
          "linear-gradient(135deg, #ff0055 0%, #ff7700 20%, #ffee00 40%, #00ff88 60%, #00d4ff 80%, #8800ff 100%)",
        backgroundSize: "200% 200%",
      }}
    >
      <div
        className="absolute inset-0 opacity-85 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.95), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-black/95 leading-none">
        <span className="font-mono text-[7px] font-black tracking-tight">27</span>
        <span className="font-mono text-[3.5px] font-extrabold tracking-widest uppercase opacity-90">
          SECURE
        </span>
      </div>
    </div>
  );
}

function MiniQR() {
  return (
    <svg
      viewBox="0 0 25 25"
      className="size-5.5 shrink-0 text-[#F4F1EA] bg-[#0A0A0E] p-0.5 rounded-[2.5px] border border-white/25 shadow-sm"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="7" height="7" fill="currentColor" />
      <rect x="2" y="2" width="5" height="5" fill="#0A0A0E" />
      <rect x="3" y="3" width="3" height="3" fill="currentColor" />
      <rect x="17" y="1" width="7" height="7" fill="currentColor" />
      <rect x="18" y="2" width="5" height="5" fill="#0A0A0E" />
      <rect x="19" y="3" width="3" height="3" fill="currentColor" />
      <rect x="1" y="17" width="7" height="7" fill="currentColor" />
      <rect x="2" y="18" width="5" height="5" fill="#0A0A0E" />
      <rect x="3" y="19" width="3" height="3" fill="currentColor" />
      <rect x="10" y="2" width="2" height="1" fill="currentColor" />
      <rect x="13" y="1" width="1" height="2" fill="currentColor" />
      <rect x="10" y="5" width="2" height="2" fill="currentColor" />
      <rect x="14" y="4" width="1" height="3" fill="currentColor" />
      <rect x="2" y="10" width="1" height="2" fill="currentColor" />
      <rect x="5" y="10" width="2" height="1" fill="currentColor" />
      <rect x="3" y="13" width="2" height="2" fill="currentColor" />
      <rect x="7" y="12" width="1" height="3" fill="currentColor" />
      <rect x="10" y="9" width="2" height="2" fill="currentColor" />
      <rect x="13" y="10" width="3" height="1" fill="currentColor" />
      <rect x="11" y="13" width="2" height="2" fill="currentColor" />
      <rect x="14" y="14" width="2" height="2" fill="currentColor" />
      <rect x="17" y="10" width="2" height="1" fill="currentColor" />
      <rect x="20" y="11" width="1" height="3" fill="currentColor" />
      <rect x="22" y="9" width="2" height="2" fill="currentColor" />
      <rect x="18" y="14" width="3" height="1" fill="currentColor" />
      <rect x="21" y="14" width="2" height="2" fill="currentColor" />
      <rect x="10" y="17" width="1" height="3" fill="currentColor" />
      <rect x="12" y="19" width="3" height="1" fill="currentColor" />
      <rect x="11" y="22" width="2" height="2" fill="currentColor" />
      <rect x="15" y="18" width="2" height="2" fill="currentColor" />
      <rect x="18" y="18" width="2" height="2" fill="currentColor" />
      <rect x="17" y="22" width="3" height="1" fill="currentColor" />
      <rect x="21" y="20" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

function MetallicLobsterClasp({ u }: { u: number }) {
  const w = 24 * u;
  const h = 30 * u;
  return (
    <svg
      aria-hidden="true"
      className="absolute overflow-visible pointer-events-none z-30"
      style={{
        left: "50%",
        top: 2 * u,
        transform: "translateX(-50%)",
        width: w,
        height: h,
      }}
      viewBox="0 0 24 30"
      fill="none"
    >
      <defs>
        <linearGradient id="clasp-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3E3E48" />
          <stop offset="25%" stopColor="#8A8A9E" />
          <stop offset="50%" stopColor="#EEEEF6" />
          <stop offset="75%" stopColor="#6C6C7C" />
          <stop offset="100%" stopColor="#25252E" />
        </linearGradient>
        <linearGradient id="clasp-dark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#18181E" />
          <stop offset="50%" stopColor="#444452" />
          <stop offset="100%" stopColor="#18181E" />
        </linearGradient>
        <filter id="clasp-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.85" />
        </filter>
      </defs>
      {/* 1. Swivel Eye Ring */}
      <rect
        x="6"
        y="1"
        width="12"
        height="5"
        rx="2.5"
        fill="url(#clasp-metal)"
        stroke="#16161C"
        strokeWidth="0.8"
        filter="url(#clasp-shadow)"
      />
      <circle cx="12" cy="3.5" r="1.8" fill="#0B0B0F" />
      {/* 2. Swivel Pin Cylinder */}
      <rect
        x="9"
        y="5"
        width="6"
        height="4"
        rx="1"
        fill="url(#clasp-dark)"
        stroke="#4E4E5A"
        strokeWidth="0.6"
      />
      {/* 3. Lobster Hook Claws that pass through the card slot */}
      <path
        d="M 12 8.5 C 7.5 8.5 5 12 5 17 C 5 23 8.5 27.5 12 29 C 13.5 29.6 15 29 15 27.5 C 15 26 13.5 25.5 12 24.5 C 9.5 23.5 7.5 20.5 7.5 17 C 7.5 13.5 9.5 11 12 11 C 14.5 11 16.5 13.5 16.5 17 L 16.5 21 C 16.5 22 17.5 22.8 18.5 22.8 C 19.5 22.8 20.5 22 20.5 21 L 20.5 16 C 20.5 12 16.5 8.5 12 8.5 Z"
        fill="url(#clasp-metal)"
        stroke="#1E1E26"
        strokeWidth="0.8"
        filter="url(#clasp-shadow)"
      />
      {/* 4. Spring Trigger Lever */}
      <path
        d="M 16.5 14.5 L 19 13.5 C 19.8 13.1 20.5 13.9 20.2 14.7 L 18 17.5"
        fill="none"
        stroke="url(#clasp-metal)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Specular Highlight Glint */}
      <circle cx="8.5" cy="14" r="0.7" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

function getCanvaCardData(item: LanyardMember) {
  const rawName = (item.name || "").trim();
  const rawRole = (item.role || "").trim();

  // Strip leading "27 " brand prefix if present (e.g. "27 Growth Strategist" -> "Growth Strategist")
  const cleanName = rawName.replace(/^27\s+/i, "");

  // 1. Dynamic Name splitting (Handles 1 word, 2 words, or multi-word admin names)
  let firstName = "";
  let lastName = "";
  if (cleanName) {
    const parts = cleanName.split(/\s+/);
    if (parts.length === 1) {
      firstName = parts[0].toUpperCase();
      lastName = "";
    } else {
      firstName = parts[0].toUpperCase();
      lastName = parts.slice(1).join(" ").toUpperCase();
    }
  } else {
    firstName = "CREW";
    lastName = "MEMBER";
  }

  // 2. Intelligent Role parsing: Primary discipline header + specific specialty subtitle
  let roleBig = "";
  let roleSmall = "";
  if (rawRole) {
    const roleLower = rawRole.toLowerCase();
    if (roleLower.includes("growth") || roleLower.includes("strateg")) {
      roleBig = "GROWTH";
      roleSmall = "STRATEGY & LOCAL SEO";
    } else if (roleLower.includes("post") || roleLower.includes("edit") || roleLower.includes("motion")) {
      roleBig = "POST-PROD";
      roleSmall = "SOUND DESIGN & COLOR";
    } else if (roleLower.includes("direct") || roleLower.includes("cinema")) {
      roleBig = "DIRECTION";
      roleSmall = "CINEMATOGRAPHY";
    } else {
      // General dynamic fallback for arbitrary admin roles:
      if (rawRole.includes("&")) {
        const parts = rawRole.split("&");
        const leftWords = parts[0].trim().split(/\s+/);
        roleBig = leftWords[0].toUpperCase();
        roleSmall = (leftWords.slice(1).join(" ") + (leftWords.length > 1 ? " & " : "") + parts.slice(1).join("&").trim()).trim().toUpperCase();
      } else if (rawRole.includes(",")) {
        const parts = rawRole.split(",");
        roleBig = parts[0].trim().toUpperCase();
        roleSmall = parts.slice(1).join(", ").trim().toUpperCase();
      } else if (rawRole.includes("/")) {
        const parts = rawRole.split("/");
        roleBig = parts[0].trim().toUpperCase();
        roleSmall = parts.slice(1).join("/").trim().toUpperCase();
      } else {
        const words = rawRole.split(/\s+/);
        if (words.length > 1) {
          roleBig = words[0].toUpperCase();
          roleSmall = words.slice(1).join(" ").toUpperCase();
        } else {
          roleBig = rawRole.toUpperCase();
          roleSmall = "27 CREATIVE STUDIO";
        }
      }
    }
  } else {
    roleBig = "CREW";
    roleSmall = "CINEMA SPECIALIST";
  }

  // 3. Team header for back face
  const teamBig = roleBig;
  const teamSmall = roleSmall || "DIRECTION & CAMERA";

  // 4. Pass ID
  const passId = item.passId || "27-CREW-01";

  // 5. Dynamic Tags (Strictly max 3 tags, split composite tags cleanly)
  let tags: string[] = [];
  if (item.tags && item.tags.length > 0) {
    const rawList: string[] = [];
    item.tags.forEach((t) => {
      const str = String(t).trim();
      if (/[·•|]|,\s+[a-zA-Z]/.test(str)) {
        str.split(/\s*[·•|]\s*|,\s+(?=[a-zA-Z])/).forEach((part) => {
          const clean = part.trim();
          if (clean) rawList.push(clean);
        });
      } else if (str) {
        rawList.push(str);
      }
    });
    tags = rawList.slice(0, 3);
  }
  if (tags.length === 0) {
    tags = ["Direction", "Story PD", "Camera"];
  }

  return {
    roleBig,
    roleSmall,
    firstName,
    lastName,
    passId,
    teamBig,
    teamSmall,
    tags,
  };
}

const BadgeFaces = React.memo(function BadgeFaces({
  item,
}: {
  item: LanyardMember;
}) {
  const portraitSrc = item.portrait || item.image;
  const canva = getCanvaCardData(item);

  const instaLink = (item.links ?? []).find((l) => /instagram|insta/i.test(l.label));
  const rawInsta =
    item.instagram ??
    (instaLink && instaLink.href.includes("instagram.com/")
      ? `@${instaLink.href.split("instagram.com/")[1]?.replace(/\/.*$/, "")}`
      : "@27creativestudio");
  const instaHandle = rawInsta.startsWith("@") ? rawInsta : `@${rawInsta}`;
  const instaHref = `https://instagram.com/${instaHandle.replace(/^@/, "")}`;

  const bioText =
    (item.bio ?? "").trim() ||
    "Directs and shoots high engagement reels across Thoothukudi. Capturing chef craft, customer handovers, and showroom energy on prime cinema glass.";
  const bioClamp = bioText.length > 250 ? 9 : bioText.length > 180 ? 8 : 7;
  const bioSize =
    bioText.length > 250
      ? "calc(13.8 * var(--p))"
      : bioText.length > 180
      ? "calc(15.2 * var(--p))"
      : bioText.length > 110
      ? "calc(16.8 * var(--p))"
      : "calc(18.5 * var(--p))";
  const bioLineHeight = bioText.length > 250 ? 1.36 : 1.44;

  const cardVars = {
    "--p": "0.1692cqw",
    "--card-bg": "linear-gradient(175deg, #222530 0%, #161822 45%, #0e1015 100%)",
    "--hex-back": "rgba(255, 255, 255, 0.035)",
    "--hex-front": "rgba(255, 255, 255, 0.065)",
    "--strip": "linear-gradient(180deg, #0e0f14 0%, #07080b 100%)",
    "--panel": "linear-gradient(180deg, #242735 0%, #191b24 50%, #111218 100%)",
    "--panel-hex": "rgba(255, 255, 255, 0.025)",
    "--ink": "#FFFFFF",
    "--grey": "#9CA3AF",
    "--name-grey": "#FFFFFF",
    "--accent": "#C6FF3D",
    "--display": '"Bebas Neue", Impact, sans-serif',
    "--sans": '"Poppins", "Helvetica Neue", Arial, sans-serif',
  } as React.CSSProperties;

  return (
    <>
      {/* ================= FRONT FACE (Dark Cinema Titanium Architecture) ================= */}
      <div
        data-face="front"
        className="absolute inset-0 overflow-hidden select-none [backface-visibility:hidden]"
        style={{
          ...cardVars,
          containerType: "inline-size",
          transform: "translateZ(1px)",
          background: "var(--card-bg)",
          boxShadow: "0 28px 70px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* Fine Brushed Metal Texture Simulation */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)",
          }}
        />

        {/* Background Hex Watermarks */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: "calc(235 * var(--p))",
            top: "calc(42 * var(--p))",
            width: "calc(550 * var(--p))",
            height: "calc(636 * var(--p))",
            background: "var(--hex-back)",
            clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            left: "calc(331 * var(--p))",
            top: "calc(235 * var(--p))",
            width: "calc(338 * var(--p))",
            height: "calc(390 * var(--p))",
            background: "var(--hex-front)",
            clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
        />

        {/* Left Dark Vertical Brand Strip */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: 0,
            top: 0,
            width: "calc(177 * var(--p))",
            height: "100%",
            background: "var(--strip)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            zIndex: 10,
          }}
        />

        {/* Brand Mark in Strip */}
        <svg
          viewBox="0 0 120 110"
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: "calc(57 * var(--p))",
            top: "calc(40 * var(--p))",
            width: "calc(63 * var(--p))",
            height: "calc(72 * var(--p))",
            zIndex: 25,
          }}
        >
          <polygon points="10,18 62,10 62,25 10,33" fill="#ffffff" />
          <polygon points="68,9 112,2 112,17 68,24" fill="#ffffff" />
          <path d="M10,45 L60,37 L60,55 L28,82 L62,77 L62,95 L8,103 L8,85 L40,58 L10,62 Z" fill="#ffffff" />
          <polygon points="68,35 112,28 112,46 84,105 65,108 92,48 68,52" fill="#ffffff" />
        </svg>

        {/* Vertical Brand Name */}
        <p
          className="pointer-events-none absolute font-bold whitespace-nowrap text-[#9CA3AF]"
          style={{
            left: "calc(88 * var(--p))",
            top: "calc(365 * var(--p))",
            transform: "translate(-50%, -50%) rotate(180deg)",
            writingMode: "vertical-rl",
            fontFamily: "var(--sans)",
            fontSize: "calc(40 * var(--p))",
            lineHeight: 1,
            letterSpacing: "0.18em",
            zIndex: 25,
          }}
        >
          CREATIVE STUDIO
        </p>

        {/* Lower Spine Brand Mark (Replaces plain 27 text with official logo) */}
        <svg
          viewBox="0 0 120 110"
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: "calc(57 * var(--p))",
            top: "calc(600 * var(--p))",
            width: "calc(63 * var(--p))",
            height: "calc(72 * var(--p))",
            zIndex: 25,
          }}
        >
          <polygon points="10,18 62,10 62,25 10,33" fill="#ffffff" />
          <polygon points="68,9 112,2 112,17 68,24" fill="#ffffff" />
          <path d="M10,45 L60,37 L60,55 L28,82 L62,77 L62,95 L8,103 L8,85 L40,58 L10,62 Z" fill="#ffffff" />
          <polygon points="68,35 112,28 112,46 84,105 65,108 92,48 68,52" fill="#ffffff" />
        </svg>

        {/* Slot Punch Hole */}
        <Hole />

        {/* Top-Right Department Role Title (Bounded: wide 320px clearance, perfectly sized fonts) */}
        <div
          className="pointer-events-none absolute flex flex-col items-end text-right"
          style={{
            right: "calc(44 * var(--p))",
            top: "calc(50 * var(--p))",
            maxWidth: "calc(325 * var(--p))",
            zIndex: 25,
          }}
        >
          <p
            className="w-full text-right font-display leading-none tracking-[0.04em] text-white truncate"
            style={{
              fontFamily: "var(--display)",
              fontSize:
                canva.roleBig.length > 14
                  ? "calc(56 * var(--p))"
                  : canva.roleBig.length > 9
                  ? "calc(70 * var(--p))"
                  : "calc(82 * var(--p))",
              lineHeight: 1,
            }}
            title={canva.roleBig}
          >
            {canva.roleBig}
          </p>
          <p
            className="w-full text-right font-bold text-[#9CA3AF]"
            style={{
              marginTop: "calc(6 * var(--p))",
              fontFamily: "var(--sans)",
              fontSize:
                canva.roleSmall.length > 22
                  ? "calc(19 * var(--p))"
                  : "calc(23 * var(--p))",
              lineHeight: 1.2,
              letterSpacing: "0.06em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
            title={canva.roleSmall}
          >
            {canva.roleSmall}
          </p>
        </div>

        {/* Behind-Portrait Cinema Viewfinder Frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: "calc(200 * var(--p))",
            top: "calc(195 * var(--p))",
            width: "calc(355 * var(--p))",
            height: "calc(445 * var(--p))",
            background: "rgba(10, 11, 16, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "calc(8 * var(--p))",
            zIndex: 12,
          }}
        >
          {/* Viewfinder Corner Crosshairs */}
          <span
            className="absolute border-t-2 border-l-2 border-[#C6FF3D]/60"
            style={{
              top: "calc(10 * var(--p))",
              left: "calc(10 * var(--p))",
              width: "calc(14 * var(--p))",
              height: "calc(14 * var(--p))",
            }}
          />
          <span
            className="absolute border-t-2 border-r-2 border-[#C6FF3D]/60"
            style={{
              top: "calc(10 * var(--p))",
              right: "calc(10 * var(--p))",
              width: "calc(14 * var(--p))",
              height: "calc(14 * var(--p))",
            }}
          />
          <span
            className="absolute border-b-2 border-l-2 border-[#C6FF3D]/60"
            style={{
              bottom: "calc(10 * var(--p))",
              left: "calc(10 * var(--p))",
              width: "calc(14 * var(--p))",
              height: "calc(14 * var(--p))",
            }}
          />
          <span
            className="absolute border-b-2 border-r-2 border-[#C6FF3D]/60"
            style={{
              bottom: "calc(10 * var(--p))",
              right: "calc(10 * var(--p))",
              width: "calc(14 * var(--p))",
              height: "calc(14 * var(--p))",
            }}
          />
          {/* Subtle Grid Dots */}
          <div
            className="absolute inset-[15%] opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "calc(24 * var(--p)) calc(24 * var(--p))",
            }}
          />
        </div>

        {/* Center Crew Member Cutout Portrait (Strictly bounded so it never clips top header) */}
        {portraitSrc ? (
          <div
            className="pointer-events-none absolute overflow-hidden"
            style={{
              left: "calc(120 * var(--p))",
              top: "calc(175 * var(--p))",
              width: "calc(460 * var(--p))",
              height: "calc(485 * var(--p))",
              zIndex: 15,
            }}
          >
            <img
              src={portraitSrc}
              alt={item.name}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="pointer-events-none select-none w-full h-full"
              style={{
                objectFit: "contain",
                objectPosition: "bottom center",
                transform: "scale(1.12)",
                transformOrigin: "bottom center",
                filter: "contrast(1.08) brightness(1.02)",
              }}
            />
          </div>
        ) : null}

        {/* Lower Stepped Angled Panel */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: 0,
            top: "calc(648 * var(--p))",
            width: "100%",
            height: "calc(356 * var(--p))",
            background: "var(--panel)",
            clipPath:
              "polygon(0% 30.6%, 5.75% 18%, 7.1% 16.7%, 8.8% 16%, 48.4% 16%, 50.4% 14.9%, 52.1% 11.2%, 53.5% 5.1%, 54.8% 1.4%, 57.2% 0%, 100% 0%, 100% 100%, 0% 100%)",
            zIndex: 20,
          }}
        >
          {/* Inner Panel Hex Watermarks */}
          <i
            className="pointer-events-none absolute"
            style={{
              left: 0,
              top: "calc(87 * var(--p))",
              width: "calc(320 * var(--p))",
              height: "calc(370 * var(--p))",
              background: "var(--panel-hex)",
              clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            }}
          />
          <i
            className="pointer-events-none absolute"
            style={{
              left: "calc(174 * var(--p))",
              top: "calc(282 * var(--p))",
              width: "calc(312 * var(--p))",
              height: "calc(360 * var(--p))",
              background: "var(--panel-hex)",
              clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            }}
          />
        </div>

        {/* Member Name on Lower Panel (Bounded: maxWidth 340, dynamic scaling, zero collision with ID) */}
        <div
          className="pointer-events-none absolute flex flex-col justify-end"
          style={{
            left: "calc(64 * var(--p))",
            top: "calc(730 * var(--p))",
            maxWidth: "calc(340 * var(--p))",
            height: "calc(190 * var(--p))",
            zIndex: 30,
          }}
        >
          <h3
            className="w-full font-display leading-none tracking-[0.02em] text-white truncate"
            style={{
              fontFamily: "var(--display)",
              fontSize:
                canva.firstName.length > 14
                  ? "calc(64 * var(--p))"
                  : canva.firstName.length > 10
                  ? "calc(80 * var(--p))"
                  : canva.firstName.length > 7
                  ? "calc(96 * var(--p))"
                  : "calc(112 * var(--p))",
              lineHeight: 0.95,
            }}
            title={canva.firstName}
          >
            {canva.firstName}
          </h3>
          {canva.lastName ? (
            <p
              className="w-full font-bold italic text-[#9CA3AF] truncate"
              style={{
                marginTop: "calc(6 * var(--p))",
                fontFamily: "var(--sans)",
                fontSize:
                  canva.lastName.length > 16
                    ? "calc(28 * var(--p))"
                    : canva.lastName.length > 12
                    ? "calc(36 * var(--p))"
                    : "calc(44 * var(--p))",
                lineHeight: 1,
              }}
              title={canva.lastName}
            >
              {canva.lastName}
            </p>
          ) : null}
        </div>

        {/* Tally Indicator Ticks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute flex items-center gap-[3px]"
          style={{
            right: "calc(44 * var(--p))",
            top: "calc(880 * var(--p))",
            zIndex: 30,
          }}
        >
          <span
            className="inline-block transform -skew-x-[20deg]"
            style={{
              width: "calc(4 * var(--p))",
              height: "calc(12 * var(--p))",
              background: "var(--accent)",
            }}
          />
          <span
            className="inline-block transform -skew-x-[20deg]"
            style={{
              width: "calc(4 * var(--p))",
              height: "calc(12 * var(--p))",
              background: "var(--accent)",
            }}
          />
          <span
            className="inline-block transform -skew-x-[20deg]"
            style={{
              width: "calc(4 * var(--p))",
              height: "calc(12 * var(--p))",
              background: "var(--accent)",
            }}
          />
        </div>

        {/* Pass ID on Lower Panel (Roomy 160px width, fits all IDs) */}
        <div
          className="pointer-events-none absolute flex flex-col items-end text-right"
          style={{
            right: "calc(44 * var(--p))",
            top: "calc(915 * var(--p))",
            maxWidth: "calc(160 * var(--p))",
            zIndex: 30,
          }}
        >
          <p
            className="w-full font-sans uppercase tracking-[0.12em] text-white/45 truncate"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "calc(13 * var(--p))",
              lineHeight: 1,
            }}
          >
            ID NUMBER:
          </p>
          <p
            className="w-full font-sans font-bold tracking-[0.04em] text-white truncate"
            style={{
              marginTop: "calc(4 * var(--p))",
              fontFamily: "var(--sans)",
              fontSize:
                canva.passId.length > 12
                  ? "calc(20 * var(--p))"
                  : "calc(24 * var(--p))",
              lineHeight: 1,
            }}
            title={canva.passId}
          >
            {canva.passId}
          </p>
        </div>

        {/* Neon Lime Chamfer Corner Accents & Accent Bars */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            top: 0,
            right: 0,
            width: "calc(120 * var(--p))",
            height: "calc(6 * var(--p))",
            background: "var(--accent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            top: 0,
            right: 0,
            width: "calc(6 * var(--p))",
            height: "calc(34 * var(--p))",
            background: "var(--accent)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            bottom: 0,
            left: 0,
            width: "calc(100 * var(--p))",
            height: "calc(6 * var(--p))",
            background: "var(--accent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            bottom: 0,
            left: 0,
            width: "calc(6 * var(--p))",
            height: "calc(34 * var(--p))",
            background: "var(--accent)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            bottom: 0,
            left: "calc(230 * var(--p))",
            width: "calc(140 * var(--p))",
            height: "calc(5 * var(--p))",
            background: "var(--accent)",
            borderRadius: "calc(2 * var(--p)) calc(2 * var(--p)) 0 0",
          }}
        />

        {/* Sleeve Gloss Border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40"
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <div
            className="absolute inset-[2px]"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        </div>
      </div>

      {/* ================= BACK FACE (Dark Cinema Titanium Architecture) ================= */}
      <div
        data-face="back"
        className="absolute inset-0 overflow-hidden select-none [backface-visibility:hidden]"
        style={{
          ...cardVars,
          containerType: "inline-size",
          transform: "rotateY(180deg) translateZ(1px)",
          background: "var(--card-bg)",
          boxShadow: "0 28px 70px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* Fine Brushed Metal Texture Simulation */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)",
          }}
        />

        {/* Background Hex Watermarks */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: "calc(235 * var(--p))",
            top: "calc(42 * var(--p))",
            width: "calc(550 * var(--p))",
            height: "calc(636 * var(--p))",
            background: "var(--hex-back)",
            clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            left: "calc(331 * var(--p))",
            top: "calc(235 * var(--p))",
            width: "calc(338 * var(--p))",
            height: "calc(390 * var(--p))",
            background: "var(--hex-front)",
            clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
        />

        {/* Left Dark Vertical Brand Strip */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: 0,
            top: 0,
            width: "calc(177 * var(--p))",
            height: "100%",
            background: "var(--strip)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            zIndex: 10,
          }}
        />

        {/* Brand Mark in Strip */}
        <svg
          viewBox="0 0 120 110"
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: "calc(57 * var(--p))",
            top: "calc(40 * var(--p))",
            width: "calc(63 * var(--p))",
            height: "calc(72 * var(--p))",
            zIndex: 25,
          }}
        >
          <polygon points="10,18 62,10 62,25 10,33" fill="#ffffff" />
          <polygon points="68,9 112,2 112,17 68,24" fill="#ffffff" />
          <path d="M10,45 L60,37 L60,55 L28,82 L62,77 L62,95 L8,103 L8,85 L40,58 L10,62 Z" fill="#ffffff" />
          <polygon points="68,35 112,28 112,46 84,105 65,108 92,48 68,52" fill="#ffffff" />
        </svg>

        {/* Vertical Brand Name */}
        <p
          className="pointer-events-none absolute font-bold whitespace-nowrap text-[#9CA3AF]"
          style={{
            left: "calc(88 * var(--p))",
            top: "calc(365 * var(--p))",
            transform: "translate(-50%, -50%) rotate(180deg)",
            writingMode: "vertical-rl",
            fontFamily: "var(--sans)",
            fontSize: "calc(40 * var(--p))",
            lineHeight: 1,
            letterSpacing: "0.18em",
            zIndex: 25,
          }}
        >
          CREATIVE STUDIO
        </p>

        {/* Lower Spine Brand Mark (Replaces plain 27 text with official logo) */}
        <svg
          viewBox="0 0 120 110"
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: "calc(57 * var(--p))",
            top: "calc(600 * var(--p))",
            width: "calc(63 * var(--p))",
            height: "calc(72 * var(--p))",
            zIndex: 25,
          }}
        >
          <polygon points="10,18 62,10 62,25 10,33" fill="#ffffff" />
          <polygon points="68,9 112,2 112,17 68,24" fill="#ffffff" />
          <path d="M10,45 L60,37 L60,55 L28,82 L62,77 L62,95 L8,103 L8,85 L40,58 L10,62 Z" fill="#ffffff" />
          <polygon points="68,35 112,28 112,46 84,105 65,108 92,48 68,52" fill="#ffffff" />
        </svg>

        {/* Slot Punch Hole */}
        <Hole />

        {/* Top-Right Department Role Title (Bounded: wide clearance) */}
        <div
          className="pointer-events-none absolute flex flex-col items-end text-right"
          style={{
            right: "calc(44 * var(--p))",
            top: "calc(50 * var(--p))",
            maxWidth: "calc(325 * var(--p))",
            zIndex: 25,
          }}
        >
          <p
            className="w-full text-right font-display leading-none tracking-[0.04em] text-white truncate"
            style={{
              fontFamily: "var(--display)",
              fontSize:
                canva.teamBig.length > 14
                  ? "calc(56 * var(--p))"
                  : canva.teamBig.length > 9
                  ? "calc(70 * var(--p))"
                  : "calc(82 * var(--p))",
              lineHeight: 1,
            }}
            title={canva.teamBig}
          >
            {canva.teamBig}
          </p>
          <p
            className="w-full text-right font-bold text-[#9CA3AF]"
            style={{
              marginTop: "calc(6 * var(--p))",
              fontFamily: "var(--sans)",
              fontSize:
                canva.teamSmall.length > 22
                  ? "calc(19 * var(--p))"
                  : "calc(23 * var(--p))",
              lineHeight: 1.2,
              letterSpacing: "0.06em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
            title={canva.teamSmall}
          >
            {canva.teamSmall}
          </p>
        </div>

        {/* High-Tech Dossier Container ("WHAT I DO") */}
        <div
          className="pointer-events-none absolute flex flex-col justify-between overflow-hidden"
          style={{
            left: "calc(200 * var(--p))",
            top: "calc(205 * var(--p))",
            width: "calc(355 * var(--p))",
            height: "calc(430 * var(--p))",
            background: "rgba(10, 11, 16, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "calc(10 * var(--p))",
            padding: "calc(18 * var(--p))",
            zIndex: 25,
          }}
        >
          {/* Tech Box Corner Crosshairs */}
          <span
            className="absolute border-t-2 border-l-2 border-[#C6FF3D]/60"
            style={{
              top: "-1px",
              left: "-1px",
              width: "calc(12 * var(--p))",
              height: "calc(12 * var(--p))",
            }}
          />
          <span
            className="absolute border-t-2 border-r-2 border-[#C6FF3D]/60"
            style={{
              top: "-1px",
              right: "-1px",
              width: "calc(12 * var(--p))",
              height: "calc(12 * var(--p))",
            }}
          />
          <span
            className="absolute border-b-2 border-l-2 border-[#C6FF3D]/60"
            style={{
              bottom: "-1px",
              left: "-1px",
              width: "calc(12 * var(--p))",
              height: "calc(12 * var(--p))",
            }}
          />
          <span
            className="absolute border-b-2 border-r-2 border-[#C6FF3D]/60"
            style={{
              bottom: "-1px",
              right: "-1px",
              width: "calc(12 * var(--p))",
              height: "calc(12 * var(--p))",
            }}
          />

          {/* Bio text area */}
          <div className="w-full flex-1 min-h-0 overflow-hidden flex flex-col justify-start">
            <h2
              className="shrink-0 tracking-[0.04em] text-[#C6FF3D]"
              style={{
                margin: 0,
                fontFamily: "var(--display)",
                fontSize: "calc(46 * var(--p))",
                lineHeight: 1,
              }}
            >
              WHAT I DO
            </h2>
            <p
              className="w-full text-[#E5E7EB]"
              style={{
                marginTop: "calc(10 * var(--p))",
                fontFamily: "var(--sans)",
                fontSize: bioSize,
                lineHeight: bioLineHeight,
                display: "-webkit-box",
                WebkitLineClamp: bioClamp,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
              }}
              title={bioText}
            >
              {bioText}
            </p>
          </div>

          {/* Bottom Tags & Tally (Structured 3-Box Reference Layout) */}
          <div className="shrink-0 w-full flex flex-col gap-[calc(6*var(--p))] pt-[calc(6*var(--p))]">
            {/* Row 1: Chip 1 (left) & Chip 2 (right) */}
            <div className="flex items-center gap-[calc(6*var(--p))] w-full">
              {canva.tags[0] && (
                <span
                  className="truncate font-sans font-semibold text-white tracking-wide text-center"
                  style={{
                    flex: "1 1 0",
                    minWidth: 0,
                    padding: "calc(5 * var(--p)) calc(8 * var(--p))",
                    borderRadius: "calc(6 * var(--p))",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    fontSize: "calc(14 * var(--p))",
                    lineHeight: 1.2,
                  }}
                  title={canva.tags[0]}
                >
                  {canva.tags[0]}
                </span>
              )}
              {canva.tags[1] && (
                <span
                  className="truncate font-sans font-semibold text-white tracking-wide text-center"
                  style={{
                    flex: "1 1 0",
                    minWidth: 0,
                    padding: "calc(5 * var(--p)) calc(8 * var(--p))",
                    borderRadius: "calc(6 * var(--p))",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    fontSize: "calc(14 * var(--p))",
                    lineHeight: 1.2,
                  }}
                  title={canva.tags[1]}
                >
                  {canva.tags[1]}
                </span>
              )}
            </div>

            {/* Row 2: Chip 3 (left) + Neon Lime Tally Marks (right) */}
            <div className="flex items-center justify-between gap-[calc(6*var(--p))] w-full">
              {canva.tags[2] ? (
                <span
                  className="truncate font-sans font-semibold text-white tracking-wide text-center"
                  style={{
                    maxWidth: "calc(250 * var(--p))",
                    minWidth: 0,
                    padding: "calc(5 * var(--p)) calc(10 * var(--p))",
                    borderRadius: "calc(6 * var(--p))",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    fontSize: "calc(14 * var(--p))",
                    lineHeight: 1.2,
                  }}
                  title={canva.tags[2]}
                >
                  {canva.tags[2]}
                </span>
              ) : (
                <div />
              )}

              {/* Neon Lime Tally Marks */}
              <div className="flex items-center gap-[3px] shrink-0 pb-[calc(1*var(--p))]">
                <span
                  className="inline-block transform -skew-x-[20deg]"
                  style={{
                    width: "calc(3 * var(--p))",
                    height: "calc(10 * var(--p))",
                    background: "var(--accent)",
                  }}
                />
                <span
                  className="inline-block transform -skew-x-[20deg]"
                  style={{
                    width: "calc(3 * var(--p))",
                    height: "calc(10 * var(--p))",
                    background: "var(--accent)",
                  }}
                />
                <span
                  className="inline-block transform -skew-x-[20deg]"
                  style={{
                    width: "calc(3 * var(--p))",
                    height: "calc(10 * var(--p))",
                    background: "var(--accent)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lower Stepped Angled Panel */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: 0,
            top: "calc(648 * var(--p))",
            width: "100%",
            height: "calc(356 * var(--p))",
            background: "var(--panel)",
            clipPath:
              "polygon(0% 30.6%, 5.75% 18%, 7.1% 16.7%, 8.8% 16%, 48.4% 16%, 50.4% 14.9%, 52.1% 11.2%, 53.5% 5.1%, 54.8% 1.4%, 57.2% 0%, 100% 0%, 100% 100%, 0% 100%)",
            zIndex: 20,
          }}
        >
          {/* Inner Panel Hex Watermarks */}
          <i
            className="pointer-events-none absolute"
            style={{
              left: 0,
              top: "calc(87 * var(--p))",
              width: "calc(320 * var(--p))",
              height: "calc(370 * var(--p))",
              background: "var(--panel-hex)",
              clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            }}
          />
          <i
            className="pointer-events-none absolute"
            style={{
              left: "calc(174 * var(--p))",
              top: "calc(282 * var(--p))",
              width: "calc(312 * var(--p))",
              height: "calc(360 * var(--p))",
              background: "var(--panel-hex)",
              clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            }}
          />
        </div>

        {/* Instagram Header on Lower Panel */}
        <h2
          className="pointer-events-none absolute whitespace-nowrap text-[#9CA3AF] tracking-[0.04em]"
          style={{
            left: "calc(64 * var(--p))",
            top: "calc(748 * var(--p))",
            maxWidth: "calc(320 * var(--p))",
            fontFamily: "var(--display)",
            fontSize: "calc(54 * var(--p))",
            lineHeight: 1,
            zIndex: 30,
          }}
        >
          FIND ME ON INSTAGRAM
        </h2>

        {/* Instagram Button (Optimized sizing: fits handle cleanly, never overlaps Pass ID) */}
        <a
          href={instaHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="group absolute flex items-center pointer-events-auto transition-all duration-300 hover:border-[#C6FF3D] hover:shadow-[0_0_15px_rgba(198,255,61,0.25)]"
          style={{
            left: "calc(64 * var(--p))",
            top: "calc(818 * var(--p))",
            maxWidth: "calc(355 * var(--p))",
            gap: "calc(8 * var(--p))",
            padding: "calc(8 * var(--p)) calc(12 * var(--p))",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(198, 255, 61, 0.35)",
            borderRadius: "calc(10 * var(--p))",
            textDecoration: "none",
            color: "#FFFFFF",
            zIndex: 30,
          }}
          title={instaHandle}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              width: "calc(32 * var(--p))",
              height: "calc(32 * var(--p))",
              color: "#FFFFFF",
            }}
          >
            <rect x="3" y="3" width="18" height="18" rx="5.2" />
            <circle cx="12" cy="12" r="4.2" />
            <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
          </svg>
          <span
            className="font-bold transition-opacity group-hover:opacity-90 flex items-center gap-1 min-w-0"
            style={{
              fontFamily: "var(--sans)",
              fontSize:
                instaHandle.length > 22
                  ? "calc(16.5 * var(--p))"
                  : instaHandle.length > 17
                  ? "calc(18 * var(--p))"
                  : "calc(20.5 * var(--p))",
              lineHeight: 1,
              color: "#FFFFFF",
            }}
          >
            <span className="truncate">{instaHandle}</span>
            <span className="shrink-0" style={{ color: "var(--accent)" }}>↗</span>
          </span>
        </a>

        {/* Pass ID on Lower Panel (Roomy 160px width) */}
        <div
          className="pointer-events-none absolute flex flex-col items-end text-right"
          style={{
            right: "calc(44 * var(--p))",
            top: "calc(915 * var(--p))",
            maxWidth: "calc(160 * var(--p))",
            zIndex: 30,
          }}
        >
          <p
            className="w-full font-sans uppercase tracking-[0.12em] text-white/45 truncate"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "calc(13 * var(--p))",
              lineHeight: 1,
            }}
          >
            ID NUMBER:
          </p>
          <p
            className="w-full font-sans font-bold tracking-[0.04em] text-white truncate"
            style={{
              marginTop: "calc(4 * var(--p))",
              fontFamily: "var(--sans)",
              fontSize:
                canva.passId.length > 12
                  ? "calc(20 * var(--p))"
                  : "calc(24 * var(--p))",
              lineHeight: 1,
            }}
            title={canva.passId}
          >
            {canva.passId}
          </p>
        </div>

        {/* Neon Lime Chamfer Corner Accents & Accent Bars */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            top: 0,
            right: 0,
            width: "calc(120 * var(--p))",
            height: "calc(6 * var(--p))",
            background: "var(--accent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            top: 0,
            right: 0,
            width: "calc(6 * var(--p))",
            height: "calc(34 * var(--p))",
            background: "var(--accent)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            bottom: 0,
            left: 0,
            width: "calc(100 * var(--p))",
            height: "calc(6 * var(--p))",
            background: "var(--accent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            bottom: 0,
            left: 0,
            width: "calc(6 * var(--p))",
            height: "calc(34 * var(--p))",
            background: "var(--accent)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-35"
          style={{
            bottom: 0,
            left: "calc(230 * var(--p))",
            width: "calc(140 * var(--p))",
            height: "calc(5 * var(--p))",
            background: "var(--accent)",
            borderRadius: "calc(2 * var(--p)) calc(2 * var(--p)) 0 0",
          }}
        />

        {/* Sleeve Gloss Border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40"
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <div
            className="absolute inset-[2px]"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        </div>
      </div>

      {/* 3D Depth Card Thickness Edges */}
      {[0, 1].map((side) => (
        <span
          key={side}
          aria-hidden="true"
          className="absolute inset-y-0 block w-[2px] bg-white/20"
          style={{
            [side ? "right" : "left"]: 0,
            transform: `translateX(${side ? 1 : -1}px) rotateY(90deg)`,
          }}
        />
      ))}
    </>
  );
});

export function TeamLanyardRail({
  items,
  eyebrow,
  heading,
  caption,
  action,
  autoplay = false,
  interval = 3200,
  active: activeProp,
  onActiveChange,
  flipped: flippedProp,
  onFlippedChange,
  labels = DEFAULT_LABELS,
  className,
  ...rest
}: TeamLanyardRailProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const slots = React.useRef<(HTMLDivElement | null)[]>([]);
  const swings = React.useRef<(HTMLSpanElement | null)[]>([]);
  const straps = React.useRef<(HTMLSpanElement | null)[]>([]);
  const cords = React.useRef<(HTMLSpanElement | null)[]>([]);
  const hangs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([]);
  const flips = React.useRef<(HTMLSpanElement | null)[]>([]);
  const shadows = React.useRef<(HTMLSpanElement | null)[]>([]);
  const sim = React.useRef(emptySim());
  const [size, setSize] = React.useState({ width: 0, W: MAX_W, carousel: false });
  const [innerActive, setInnerActive] = React.useState<number | null>(null);
  const [innerFlipped, setInnerFlipped] = React.useState<number | null>(null);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplay);
  const pendingOpen = React.useRef(-1);
  const pointer = React.useRef({
    id: -1,
    index: -1,
    x: 0,
    y: 0,
    mode: "",
    kind: "",
    lastX: 0,
    lastY: 0,
    lastT: 0,
    v: 0,
    swipe: 0,
    hoverX: 0,
    hoverT: 0,
    hoverHit: -1,
  });

  const valid = (value: number | null | undefined) =>
    value === null || value === undefined || value < 0 || value >= count
      ? null
      : value;
  const active = valid(activeProp !== undefined ? activeProp : innerActive);
  const flipped = valid(flippedProp !== undefined ? flippedProp : innerFlipped);
  const geo = React.useMemo(() => geometry(size.W, items), [size.W, items]);
  const live = React.useRef({
    active,
    flipped,
    size,
    geo,
    reduced,
    count,
    carouselIndex: 0,
    cyclic: false,
    activeControlled: false,
    flippedControlled: false,
  });
  live.current = {
    ...live.current,
    active,
    flipped,
    size,
    geo,
    reduced,
    count,
    activeControlled: activeProp !== undefined,
    flippedControlled: flippedProp !== undefined,
  };
  const callbacks = React.useRef({ onActiveChange, onFlippedChange });
  callbacks.current = { onActiveChange, onFlippedChange };

  const setActive = React.useCallback((index: number | null) => {
    const L = live.current;
    if (L.active === index) return;
    L.active = index;
    if (index !== null) L.carouselIndex = index;
    if (!L.activeControlled) setInnerActive(index);
    callbacks.current.onActiveChange?.(index);
  }, []);

  const setFlipped = React.useCallback((index: number | null) => {
    const L = live.current;
    if (L.flipped === index) return;
    L.flipped = index;
    if (!L.flippedControlled) setInnerFlipped(index);
    callbacks.current.onFlippedChange?.(index);
  }, []);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    setPlaying(autoplay);
  }, [autoplay]);

  // Keyboard accessibility: Escape closes open dossier or clears selection
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (live.current.flipped !== null) {
          setFlipped(null);
        }
        if (live.current.active !== null) {
          setActive(null);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setFlipped, setActive]);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = (width: number) => {
      const n = Math.max(1, live.current.count);
      const isMobile = width < 768;

      if (isMobile) {
        // Keep cards readable on mobile (never tiny 120px)
        const W = Math.round(clamp(width * 0.65, 210, 240));
        setSize((old) =>
          Math.abs(old.width - width) < 0.5 && old.carousel === true && old.W === W
            ? old
            : { width, W, carousel: true }
        );
        return;
      }

      // Desktop / Tablet
      const MIN_READABLE_W = 196;
      const MAX_CARD_W = n === 1 ? 256 : n === 2 ? 240 : 225;

      const availableWidth = width - 80;
      const pitchEstimate = n > 1 ? availableWidth / (n - 1) : availableWidth;
      const fittedW = Math.min(MAX_CARD_W, pitchEstimate / 1.3);

      const carousel = fittedW < MIN_READABLE_W && n > 2;
      const W = carousel
        ? 216
        : Math.round(clamp(fittedW, MIN_READABLE_W, MAX_CARD_W));

      setSize((old) =>
        Math.abs(old.width - width) < 0.5 &&
        old.carousel === carousel &&
        old.W === W
          ? old
          : { width, W, carousel }
      );
    };
    measure(stage.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const box = entries[0];
      if (box) measure(box.contentRect.width);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count]);

  const railSag = Math.min(24, Math.max(14, size.width * 0.02));

  const paint = React.useCallback(
    (i: number) => {
      const s = sim.current;
      const g = live.current.geo;
      const slot = slots.current[i];
      if (!slot) return;

      const posX = s.x[i] ?? 0;
      const normX = clamp(posX / Math.max(1, live.current.size.width), 0, 1);
      const catenaryY = 4 * railSag * normX * (1 - normX);

      slot.style.transform = `translate3d(${(posX - g.W / 2).toFixed(
        2
      )}px, ${catenaryY.toFixed(2)}px, 0)`;

      const sw = s.sw[i] ?? 0;
      const swing = swings.current[i];
      if (swing) swing.style.transform = `rotate(${sw.toFixed(3)}deg)`;

      const st = s.st[i] ?? 0;
      straps.current[i]?.style.setProperty("--stretch", `${st.toFixed(2)}px`);

      const cord = cords.current[i];
      if (cord)
        cord.style.transform = `scaleY(${Math.max(
          0.12,
          (g.cordRest + st) / g.cordRest
        ).toFixed(4)})`;

      const lift = s.lift[i] ?? 0;
      const pop = s.pop[i] ?? 0;
      const hang = hangs.current[i];
      if (hang)
        hang.style.transform = `translate3d(0,${(st - 4 * lift).toFixed(
          2
        )}px,0) rotate(${((s.beta[i] ?? 0) - sw + (s.rz[i] ?? 0)).toFixed(
          3
        )}deg) scale(${(1 + 0.08 * pop).toFixed(4)})`;

      const ry = s.ry[i] ?? 0;
      const flip = flips.current[i];
      const facing = Math.abs(Math.cos((ry * Math.PI) / 180));
      if (flip) {
        flip.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${ry.toFixed(
          2
        )}deg)`;
        flip.style.setProperty("--shade", ((1 - facing) * 0.45).toFixed(3));
        const phi = ((((ry + 90) % 180) + 180) % 180) - 90;
        flip.style.setProperty("--gx", `${(phi * 0.9).toFixed(1)}%`);
      }

      const shadow = shadows.current[i];
      if (shadow) {
        shadow.style.transform = `translate3d(${(
          g.W * 0.045 +
          lift * 3 * g.u
        ).toFixed(2)}px,${(g.H * 0.03 + lift * 7 * g.u).toFixed(2)}px,0) scale(${(
          Math.max(0.12, facing) *
          (1 + 0.03 * lift + 0.05 * pop)
        ).toFixed(3)},${(1 + 0.03 * lift + 0.05 * pop).toFixed(3)})`;
        shadow.style.opacity = (0.72 + 0.28 * lift).toFixed(3);
      }
    },
    [railSag]
  );

  const step = React.useCallback(
    (now: number) => {
      const s = sim.current;
      const L = live.current;
      const n = L.count;
      const g = L.geo;
      const { width, carousel } = L.size;
      const dt = s.last ? Math.min(0.1, (now - s.last) / 1000) : 1 / 60;
      s.last = now;
      const sub = Math.max(3, Math.ceil(dt / 0.006));
      const h = dt / sub;
      let busy = false;

      for (let k = 0; k < sub; k++) {
        for (let i = 0; i < n; i++) {
          const before = s.vx[i] ?? 0;
          if (i !== s.drag) {
            const restoring = now > s.free;
            const ax = restoring
              ? -130 * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) -
                2 * Math.sqrt(130) * 0.86 * before
              : -3.2 * before;
            s.vx[i] = before + ax * h;
            s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * h;
          }
        }
        if (!carousel && n > 0) {
          const [left, right] = stops(s, g.W, width, n);
          if (s.drag >= 0) {
            const d = s.drag;
            for (let j = d - 1; j >= 0; j--) {
              const limit = (s.x[j + 1] ?? 0) - minGap(s, g.W, j, j + 1);
              if ((s.x[j] ?? 0) > limit) {
                s.x[j] = limit;
                s.vx[j] = Math.min(s.vx[j] ?? 0, s.vx[j + 1] ?? 0);
              }
            }
            for (let j = d + 1; j < n; j++) {
              const limit = (s.x[j - 1] ?? 0) + minGap(s, g.W, j - 1, j);
              if ((s.x[j] ?? 0) < limit) {
                s.x[j] = limit;
                s.vx[j] = Math.max(s.vx[j] ?? 0, s.vx[j - 1] ?? 0);
              }
            }
          } else {
            for (let pass = 0; pass < 3; pass++) {
              for (let j = 0; j < n - 1; j++) {
                const a = s.x[j] ?? 0;
                const b = s.x[j + 1] ?? 0;
                const overlap = minGap(s, g.W, j, j + 1) - (b - a);
                if (overlap <= 0) continue;
                s.x[j] = a - overlap / 2;
                s.x[j + 1] = b + overlap / 2;
                const va = s.vx[j] ?? 0;
                const vb = s.vx[j + 1] ?? 0;
                if (va > vb) {
                  const shared = (va + vb) / 2;
                  s.vx[j] = shared;
                  s.vx[j + 1] = shared;
                }
              }
            }
            if ((s.x[0] ?? 0) < left) {
              s.x[0] = left;
              s.vx[0] = Math.abs(s.vx[0] ?? 0) * 0.3;
            }
            for (let j = 1; j < n; j++)
              s.x[j] = Math.max(
                s.x[j] ?? 0,
                (s.x[j - 1] ?? 0) + minGap(s, g.W, j - 1, j)
              );
            if ((s.x[n - 1] ?? 0) > right) {
              s.x[n - 1] = right;
              s.vx[n - 1] = -Math.abs(s.vx[n - 1] ?? 0) * 0.3;
            }
            for (let j = n - 2; j >= 0; j--)
              s.x[j] = Math.min(
                s.x[j] ?? 0,
                (s.x[j + 1] ?? 0) - minGap(s, g.W, j, j + 1)
              );
          }
        }
        for (let i = 0; i < n; i++) {
          const dv = (s.vx[i] ?? 0) - (s.px[i] ?? 0);
          s.px[i] = s.vx[i] ?? 0;
          if (i !== s.pull) {
            const sw = s.sw[i] ?? 0;
            const vsw = clamp(
              (s.vsw[i] ?? 0) + (g.couple[i] ?? 0.07) * clamp(dv, -900, 900),
              -90,
              90
            );
            const next =
              vsw + (-(g.swingK[i] ?? SWING_K) * sw - SWING_DAMP * vsw) * h;
            s.vsw[i] = next;
            s.sw[i] = clamp(sw + next * h, -20, 20);
          }
          s.beta[i] =
            (s.beta[i] ?? 0) +
            ((s.sw[i] ?? 0) - (s.beta[i] ?? 0)) * Math.min(1, h / LAG);
          spring(s.ry, s.vry, s.tr[i] ?? 0, i, 170, 0.62, h);
          spring(s.rz, s.vrz, s.tz[i] ?? 0, i, 120, 0.8, h);
          spring(s.lift, s.vlift, s.tl[i] ?? 0, i, 200, 0.75, h);
          spring(s.pop, s.vpop, s.tp[i] ?? 0, i, 160, 0.55, h);
          if (i !== s.pull) {
            spring(s.st, s.vst, 0, i, REEL_K, REEL_ZETA, h);
            s.st[i] = Math.max(-g.cordRest * 0.85, s.st[i] ?? 0);
          }
        }
        for (let a = 0; a < n - 1; a++) {
          const b = a + 1;
          if ((s.x[b] ?? 0) <= (s.x[a] ?? 0)) continue;
          const [aTop, aBottom, aArmTop, aArmBottom] = cardEdge(s, g, a, 1);
          const [bTop, bBottom, bArmTop, bArmBottom] = cardEdge(s, g, b, -1);
          const topExcess = aTop - bTop + 2;
          const bottomExcess = aBottom - bBottom + 2;
          const excess = Math.max(topExcess, bottomExcess);
          if (excess <= 0) continue;
          const arm = Math.max(
            40,
            topExcess > bottomExcess
              ? (aArmTop + bArmTop) / 2
              : (aArmBottom + bArmBottom) / 2
          );
          const push = (Math.asin(clamp(excess / arm, 0, 1)) * 180) / Math.PI;
          const share = a === s.pull ? 0 : b === s.pull ? 1 : 0.5;
          s.sw[a] = clamp((s.sw[a] ?? 0) + push * share, -20, 20);
          s.beta[a] = (s.beta[a] ?? 0) + push * share;
          s.sw[b] = clamp((s.sw[b] ?? 0) - push * (1 - share), -20, 20);
          s.beta[b] = (s.beta[b] ?? 0) - push * (1 - share);
        }
      }

      for (let i = 0; i < n; i++) {
        paint(i);
        if (
          Math.abs(s.vx[i] ?? 0) > 0.4 ||
          (now > s.free && Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25) ||
          Math.abs((s.ry[i] ?? 0) - (s.tr[i] ?? 0)) > 0.05 ||
          Math.abs(s.vry[i] ?? 0) > 0.05 ||
          Math.abs((s.rz[i] ?? 0) - (s.tz[i] ?? 0)) > 0.02 ||
          Math.abs(s.vrz[i] ?? 0) > 0.05 ||
          Math.abs((s.lift[i] ?? 0) - (s.tl[i] ?? 0)) > 0.002 ||
          Math.abs(s.vlift[i] ?? 0) > 0.01 ||
          Math.abs((s.pop[i] ?? 0) - (s.tp[i] ?? 0)) > 0.002 ||
          Math.abs(s.vpop[i] ?? 0) > 0.01 ||
          Math.abs(s.sw[i] ?? 0) > 0.02 ||
          Math.abs(s.vsw[i] ?? 0) > 0.05 ||
          Math.abs((s.beta[i] ?? 0) - (s.sw[i] ?? 0)) > 0.01 ||
          Math.abs(s.st[i] ?? 0) > 0.05 ||
          Math.abs(s.vst[i] ?? 0) > 0.1
        )
          busy = true;
      }
      if (s.drag >= 0 || s.pull >= 0 || now < s.free) busy = true;
      if (busy) s.raf = requestAnimationFrame(step);
      else {
        s.raf = 0;
        s.last = 0;
        for (let i = 0; i < n; i++) {
          if (now > s.free) {
            s.x[i] = s.tx[i] ?? 0;
            s.vx[i] = 0;
            s.px[i] = 0;
          }
          s.sw[i] = 0;
          s.vsw[i] = 0;
          s.beta[i] = 0;
          s.st[i] = 0;
          s.vst[i] = 0;
          s.ry[i] = s.tr[i] ?? 0;
          s.vry[i] = 0;
          s.rz[i] = s.tz[i] ?? 0;
          s.vrz[i] = 0;
          s.lift[i] = s.tl[i] ?? 0;
          s.vlift[i] = 0;
          s.pop[i] = s.tp[i] ?? 0;
          s.vpop[i] = 0;
          paint(i);
        }
      }
    },
    [paint]
  );

  const snap = React.useCallback(() => {
    const s = sim.current;
    for (let i = 0; i < live.current.count; i++) {
      s.x[i] = s.tx[i] ?? 0;
      s.vx[i] = 0;
      s.px[i] = 0;
      s.sw[i] = 0;
      s.vsw[i] = 0;
      s.beta[i] = 0;
      if (i !== s.pull) {
        s.st[i] = 0;
        s.vst[i] = 0;
      }
      s.ry[i] = s.tr[i] ?? 0;
      s.vry[i] = 0;
      s.rz[i] = s.tz[i] ?? 0;
      s.vrz[i] = 0;
      s.lift[i] = s.tl[i] ?? 0;
      s.vlift[i] = 0;
      s.pop[i] = s.tp[i] ?? 0;
      s.vpop[i] = 0;
      paint(i);
    }
  }, [paint]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (live.current.reduced) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      snap();
      return;
    }
    if (!s.raf) {
      s.last = 0;
      s.raf = requestAnimationFrame(step);
    }
  }, [snap, step]);

  const impulse = React.useCallback(
    (i: number, amount: number) => {
      const s = sim.current;
      if (live.current.reduced || i < 0 || i >= live.current.count) return;
      s.vsw[i] = (s.vsw[i] ?? 0) + amount;
      kick();
    },
    [kick]
  );

  const tug = React.useCallback(
    (i: number, amount: number) => {
      const s = sim.current;
      if (live.current.reduced || i < 0 || i >= live.current.count) return;
      s.vst[i] = (s.vst[i] ?? 0) + amount;
      kick();
    },
    [kick]
  );

  React.useLayoutEffect(() => {
    if (!size.width) return;
    const s = sim.current;
    const L = live.current;
    const center = size.carousel ? active ?? L.carouselIndex : null;
    const { xs, total } = layoutTargets(
      size.width,
      size.W,
      size.carousel,
      center,
      count
    );
    L.cyclic = total > 0;
    const fresh = s.x.length !== count || s.carousel !== size.carousel;
    s.carousel = size.carousel;

    for (let i = 0; i < count; i++) {
      const tx = (xs[i] ?? 0) + (size.carousel ? pointer.current.swipe : 0);
      if (!fresh && total > 0) {
        const shift = Math.round((tx - (s.tx[i] ?? tx)) / total) * total;
        if (shift) s.x[i] = (s.x[i] ?? 0) + shift;
      }
      s.tx[i] = tx;
      const front = flipped === i || active === i;
      s.tr[i] =
        flipped === i
          ? 180
          : active === i
          ? 0
          : REST_Y[i % REST_Y.length] ?? 0;
      s.tz[i] = front ? 0 : REST_Z[i % REST_Z.length] ?? 0;
      s.tl[i] = front ? 1 : 0;
      s.tp[i] = flipped === i ? 1 : 0;
      if (fresh) {
        s.x[i] = tx;
        s.vx[i] = 0;
        s.px[i] = 0;
        s.sw[i] = 0;
        s.vsw[i] = 0;
        s.beta[i] = 0;
        s.st[i] = 0;
        s.vst[i] = 0;
        s.ry[i] = s.tr[i] ?? 0;
        s.vry[i] = 0;
        s.rz[i] = s.tz[i] ?? 0;
        s.vrz[i] = 0;
        s.lift[i] = s.tl[i] ?? 0;
        s.vlift[i] = 0;
        s.pop[i] = s.tp[i] ?? 0;
        s.vpop[i] = 0;
      }
    }
    for (const key of [
      "x",
      "vx",
      "px",
      "tx",
      "sw",
      "vsw",
      "beta",
      "ry",
      "vry",
      "tr",
      "rz",
      "vrz",
      "tz",
      "lift",
      "vlift",
      "tl",
      "pop",
      "vpop",
      "tp",
      "st",
      "vst",
    ] as const)
      s[key].length = count;

    if (fresh) for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [size, active, flipped, count, paint, kick]);

  React.useEffect(() => {
    if (reduced) kick();
  }, [reduced, kick]);

  const swayed = React.useRef(false);
  const ready = size.width > 0;
  React.useEffect(() => {
    if (!ready || reduced || swayed.current) return;
    const timers = Array.from({ length: count }, (_, i) =>
      window.setTimeout(
        () => impulse(i, (i % 2 ? -1 : 1) * (26 - (i % 3) * 4)),
        80 + i * 80
      )
    );
    const done = window.setTimeout(() => {
      swayed.current = true;
    }, 100 + count * 80);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(done);
    };
  }, [ready, reduced, count, impulse]);

  // Subtle physical pendulum jiggle & sway when scrolling past the section
  React.useEffect(() => {
    if (reduced || !ready || count === 0) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        ticking = false;
        const stage = stageRef.current;
        if (!stage) return;

        const rect = stage.getBoundingClientRect();
        const vh = window.innerHeight;

        // Active only when the lanyard rail is in or entering the viewport
        if (rect.bottom > -80 && rect.top < vh + 80) {
          const currentScrollY = window.scrollY;
          const deltaY = currentScrollY - lastScrollY;
          lastScrollY = currentScrollY;

          // Only react to intentional scroll movement (ignoring micro-jitter)
          if (Math.abs(deltaY) > 0.4) {
            const s = sim.current;
            // Cap speed for smooth, gentle, organic pendulum motion
            const speed = clamp(deltaY, -30, 30);

            for (let i = 0; i < count; i++) {
              // Don't disturb a card currently being dragged or pulled
              if (i === s.drag || i === s.pull) continue;

              // Alternating phase so neighboring cards sway naturally relative to each other
              const phase = i % 2 === 0 ? 1 : -0.75;
              const swingKick = -speed * 0.22 * phase;
              const stretchKick = Math.abs(speed) * 0.12;

              s.vsw[i] = clamp((s.vsw[i] ?? 0) + swingKick, -16, 16);
              s.vst[i] = clamp((s.vst[i] ?? 0) + stretchKick, -20, 20);
            }
            kick();
          }
        } else {
          lastScrollY = window.scrollY;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced, ready, count, kick]);

  React.useEffect(
    () => () => {
      cancelAnimationFrame(sim.current.raf);
      sim.current.raf = 0;
    },
    []
  );

  const previous = React.useRef({
    active: null as number | null,
    flipped: null as number | null,
  });
  React.useEffect(() => {
    const old = previous.current;
    const wrap = (i: number) =>
      live.current.cyclic ? ((i % count) + count) % count : i;
    if (old.active !== active) {
      if (active !== null) {
        impulse(wrap(active - 1), 14);
        impulse(wrap(active + 1), -14);
      }
      if (old.active !== null) {
        impulse(wrap(old.active - 1), -6);
        impulse(wrap(old.active + 1), 6);
      }
    }
    if (old.flipped !== flipped) {
      if (flipped !== null) {
        impulse(flipped, flipped % 2 ? 8 : -8);
        tug(flipped, 65);
      }
      if (old.flipped !== null) tug(old.flipped, 35);
    }
    previous.current = { active, flipped };
  }, [active, flipped, count, impulse, tug]);

  const stop = React.useCallback(() => setPlaying(false), []);

  React.useEffect(() => {
    if (!playing || reduced || count === 0 || !ready) return;
    let timer = 0;
    function front(index: number) {
      setActive(index);
      timer = window.setTimeout(() => flip(index), FLIP_DELAY);
    }
    function flip(index: number) {
      setFlipped(index);
      timer = window.setTimeout(() => {
        setFlipped(null);
        front((index + 1) % Math.max(1, live.current.count));
      }, interval);
    }
    const current = live.current.active;
    timer =
      current === null
        ? window.setTimeout(() => front(0), FIRST_DELAY)
        : window.setTimeout(() => flip(current), FLIP_DELAY);
    return () => window.clearTimeout(timer);
  }, [playing, reduced, count, ready, interval, setActive, setFlipped]);

  React.useEffect(() => {
    if (flipped === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const stage = stageRef.current;
      if (stage && event.target instanceof Node && stage.contains(event.target))
        return;
      setFlipped(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [flipped, setFlipped]);

  const toggle = React.useCallback(
    (index: number) => {
      stop();
      const next = live.current.flipped === index ? null : index;
      if (next !== null) setActive(index);
      setFlipped(next);
    },
    [stop, setActive, setFlipped]
  );

  const retarget = () => {
    const s = sim.current;
    const L = live.current;
    const { xs } = layoutTargets(
      L.size.width,
      L.size.W,
      L.size.carousel,
      L.size.carousel ? L.active ?? L.carouselIndex : null,
      L.count
    );
    for (let i = 0; i < L.count; i++)
      s.tx[i] =
        (xs[i] ?? 0) + (L.size.carousel ? pointer.current.swipe : 0);
    if (L.reduced) snap();
    else kick();
  };

  const feasible = (d: number) => {
    const s = sim.current;
    const L = live.current;
    const W = L.geo.W;
    const n = L.count;
    let [lo, hi] = stops(s, W, L.size.width, n);
    for (let k = 0; k < d; k++) lo += minGap(s, W, k, k + 1);
    for (let k = n - 1; k > d; k--) hi -= minGap(s, W, k - 1, k);
    return [lo, Math.max(lo, hi)] as const;
  };

  const nearest = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const box = stage.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    const g = live.current.geo;
    const s = sim.current;
    let best = null as number | null;
    let distance = Infinity;
    for (let i = 0; i < live.current.count; i++) {
      const top = (g.cardTops[i] ?? 0) + Math.max(0, s.st[i] ?? 0);
      const bottom = top + g.H;
      // Mouse must be strictly within the vertical bounds of the card
      if (y < top || y > bottom) continue;
      const d = Math.abs(x - (s.x[i] ?? 0));
      // Mouse must be strictly within the horizontal bounds of the card
      if (d <= g.W / 2 && d < distance) {
        best = i;
        distance = d;
      }
    }
    return best;
  };

  const setBadgeTilt = (index: number, clientX: number, clientY: number) => {
    if (live.current.reduced) return;
    const button = buttons.current[index];
    const bounds = button?.getBoundingClientRect();
    if (!button || !bounds?.width || !bounds.height) return;
    const x = clamp((clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
    const y = clamp((clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
    button.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${(-y * 8).toFixed(
      2
    )}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
    const flip = flips.current[index];
    if (flip) {
      flip.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
      flip.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
    }
  };

  const resetBadgeTilt = (index: number) => {
    const button = buttons.current[index];
    if (button) button.style.transform = "";
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pointer.current;
    const s = sim.current;
    const L = live.current;
    const stage = stageRef.current;
    const now = performance.now();

    if (p.id === event.pointerId && stage) {
      const dx = event.clientX - p.x;
      const dy = event.clientY - p.y;
      if (!p.mode && Math.hypot(dx, dy) > 8) {
        if (Math.abs(dy) > Math.abs(dx))
          p.mode = dy > 0 && p.index >= 0 ? "pull" : "none";
        else
          p.mode = L.size.carousel
            ? "swipe"
            : p.index >= 0 && !L.reduced
            ? "drag"
            : "none";
        if (p.mode !== "none") {
          stop();
          if (stage.isConnected) stage.setPointerCapture(event.pointerId);
        }
        if (p.mode === "pull") s.pull = p.index;
        if (p.mode === "drag") {
          s.drag = p.index;
          s.grab =
            event.clientX -
            stage.getBoundingClientRect().left -
            (s.x[p.index] ?? 0);
        }
      }
      const elapsed = Math.max(1, now - p.lastT);
      p.v = p.v * 0.6 + ((event.clientX - p.lastX) / elapsed) * 0.4;
      p.lastX = event.clientX;
      p.lastY = event.clientY;
      p.lastT = now;
      if (p.mode === "pull") {
        const i = p.index;
        s.st[i] = soft(Math.max(0, dy), L.geo.maxStretch);
        s.vst[i] = 0;
        const angle = clamp(
          (-Math.atan2(dx, (L.geo.pendulum[i] ?? 200) + (s.st[i] ?? 0)) *
            180) /
            Math.PI,
          -18,
          18
        );
        s.vsw[i] = ((angle - (s.sw[i] ?? 0)) / elapsed) * 1000 * 0.5;
        s.sw[i] = angle;
        if (L.reduced) paint(i);
        else kick();
      } else if (p.mode === "drag" && s.drag >= 0) {
        const [lo, hi] = feasible(s.drag);
        s.x[s.drag] = clamp(
          event.clientX - stage.getBoundingClientRect().left - s.grab,
          lo,
          hi
        );
        s.vx[s.drag] = p.v * 1000;
        s.free = now + 900;
        kick();
      } else if (p.mode === "swipe") {
        p.swipe = dx;
        retarget();
      }
      return;
    }

    if (event.pointerType !== "mouse" || p.id >= 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const hoverV = (event.clientX - p.hoverX) / Math.max(1, now - p.hoverT);
    p.hoverX = event.clientX;
    p.hoverT = now;

    if (L.size.carousel) {
      const center = L.active ?? L.carouselIndex;
      if (hit !== null && hit === center && L.active !== hit) {
        stop();
        setActive(hit);
      }
      return;
    }

    if (p.hoverHit >= 0 && p.hoverHit !== hit) resetBadgeTilt(p.hoverHit);
    if (hit !== null) setBadgeTilt(hit, event.clientX, event.clientY);
    if (hit !== null && hit !== p.hoverHit) {
      const swing =
        Math.abs(hoverV) < 0.01
          ? hit % 2 === 0
            ? -12
            : 12
          : clamp(-hoverV * 20, -22, 22);
      impulse(hit, swing);
    }
    p.hoverHit = hit ?? -1;
    if (hit !== L.active) {
      if (hit !== null) stop();
      setActive(hit);
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const now = performance.now();
    pendingOpen.current = -1;
    pointer.current = {
      ...pointer.current,
      id: event.pointerId,
      index: hit ?? -1,
      x: event.clientX,
      y: event.clientY,
      mode: "",
      kind: event.pointerType,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: now,
      v: 0,
      swipe: 0,
      hoverX: event.clientX,
      hoverT: now,
      hoverHit: hit ?? -1,
    };
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const L = live.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId))
      stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };

    if (p.mode === "pull") {
      const i = s.pull;
      s.pull = -1;
      if (L.reduced) {
        s.st[i] = 0;
        s.vst[i] = 0;
        s.sw[i] = 0;
        s.vsw[i] = 0;
        s.beta[i] = 0;
        paint(i);
      } else kick();
      return;
    }

    if (p.mode === "drag") {
      s.drag = -1;
      s.free = performance.now() + 700;
      kick();
      return;
    }

    if (p.mode === "swipe") {
      const dx = event.clientX - p.x;
      const n = L.count;
      const current = L.active ?? L.carouselIndex;
      const by =
        Math.abs(dx) > 40 || Math.abs(p.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0;
      pointer.current.swipe = 0;
      const next = L.cyclic
        ? (((current + by) % n) + n) % n
        : clamp(current + by, 0, n - 1);
      if (next === L.active) retarget();
      else setActive(next);
      return;
    }

    if (cancelled || p.mode || p.index < 0) return;
    stop();
    if ((p.kind !== "mouse" || L.size.carousel) && L.active !== p.index)
      setActive(p.index);
    else pendingOpen.current = p.index;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const L = live.current;
    if (event.key === "Escape") {
      if (L.flipped !== null) {
        event.preventDefault();
        setFlipped(null);
      }
      return;
    }
    const target = event.target instanceof HTMLElement ? event.target : null;
    const badge = target?.dataset.badge;
    if (event.key === "ArrowDown") {
      if (badge === undefined) return;
      event.preventDefault();
      stop();
      tug(Number(badge), 300);
      return;
    }
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    stop();
    const from = L.active ?? focusIndex;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
        ? L.count - 1
        : clamp(from + (event.key === "ArrowRight" ? 1 : -1), 0, L.count - 1);
    setFocusIndex(next);
    setActive(next);
    buttons.current[next]?.focus({ preventScroll: true });
  };

  const g = geo;
  const W = g.W;
  const railWidth = Math.max(8, size.width);
  const base = W / EM;
  const current = active ?? flipped;
  const person = current === null ? null : items[current] ?? null;
  const showingBack = current !== null && current === flipped;
  const centerIndex = size.carousel
    ? active ?? live.current.carouselIndex
    : null;
  const line1 = person ? `${person.name} — ${person.role}` : caption;
  const line2 = person ? (showingBack ? labels.back : labels.flip) : "";

  // Selected state: card is flipped / opened into dossier
  const selectedIndex = flipped;
  const selectedPerson = selectedIndex !== null ? items[selectedIndex] ?? null : null;

  // Hovered state: mouse is hovering over a card that isn't already the selected one
  const hoveredIndex = active !== null && active !== flipped ? active : null;
  const hoveredPerson = hoveredIndex !== null ? items[hoveredIndex] ?? null : null;

  // Active display person: hover preview takes temporary priority, then selected card
  const displayPerson = hoveredPerson ?? selectedPerson ?? null;
  const isHoverState = hoveredPerson !== null;
  const isSelectedState = !isHoverState && selectedPerson !== null;

  return (
    <section
      {...rest}
      data-slot="team-lanyard-rail"
      data-mode={size.carousel ? "carousel" : "rail"}
      data-active={active ?? ""}
      data-flipped={flipped ?? ""}
      className={`team-lanyard-rail relative isolate w-full overflow-hidden bg-transparent text-foreground ${
        className ?? ""
      }`}
    >
      {(eyebrow || heading) && (
        <header className="relative z-10 flex flex-col items-center gap-2 px-6 pt-7 text-center">
          {eyebrow && (
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.28em] text-[#C6FF3D]">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="text-balance text-2xl font-black tracking-tight sm:text-3xl md:text-4xl text-[#F4F1EA]">
              {heading}
            </h2>
          )}
        </header>
      )}

      <div
        ref={stageRef}
        data-stage
        role="group"
        aria-label={heading ?? siteContent.ui.teamRailLabel}
        aria-roledescription={siteContent.ui.teamRailRoleDescription}
        className="relative mt-4 w-full touch-pan-y select-none"
        style={{ height: g.height, overflowX: "clip" }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse" && pointer.current.hoverHit >= 0) {
            resetBadgeTilt(pointer.current.hoverHit);
          }
          pointer.current.hoverHit = -1;
          if (
            event.pointerType === "mouse" &&
            pointer.current.id < 0 &&
            !size.carousel &&
            !document.activeElement?.matches("[data-badge]:focus-visible")
          )
            setActive(null);
        }}
        onKeyDown={onKeyDown}
      >
        {/* ================= CATENARY SAGGING STUDIO RAIL ================= */}
        <svg
          aria-hidden="true"
          data-rail
          className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full overflow-visible"
          style={{ height: g.railY + g.railR + railSag }}
          viewBox={`0 0 ${railWidth} ${g.railY + g.railR + railSag}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`${uid}-rail`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2A2A34" />
              <stop offset="15%" stopColor="#4A4A58" />
              <stop offset="50%" stopColor="#7E7E94" />
              <stop offset="85%" stopColor="#4A4A58" />
              <stop offset="100%" stopColor="#2A2A34" />
            </linearGradient>
            <filter
              id={`${uid}-wire-shadow`}
              x="-10%"
              y="-10%"
              width="120%"
              height="150%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="1.5"
                floodColor="#000000"
                floodOpacity="0.8"
              />
            </filter>
          </defs>

          {/* Natural Catenary Sag Curve */}
          <path
            d={`M 14 ${g.railY} Q ${railWidth / 2} ${g.railY + railSag} ${
              railWidth - 14
            } ${g.railY}`}
            fill="none"
            stroke={`url(#${uid}-rail)`}
            strokeWidth={Math.max(2, g.railR * 0.55)}
            strokeLinecap="round"
            filter={`url(#${uid}-wire-shadow)`}
          />

          {/* Left Rig Mount Peg */}
          <circle
            cx="14"
            cy={g.railY}
            r={g.railR * 1.15}
            fill="#121218"
            stroke="#3E3E4C"
            strokeWidth="1.8"
          />
          <circle cx="14" cy={g.railY} r={g.railR * 0.45} fill="#C6FF3D" />

          {/* Right Rig Mount Peg */}
          <circle
            cx={railWidth - 14}
            cy={g.railY}
            r={g.railR * 1.15}
            fill="#121218"
            stroke="#3E3E4C"
            strokeWidth="1.8"
          />
          <circle
            cx={railWidth - 14}
            cy={g.railY}
            r={g.railR * 0.45}
            fill="#C6FF3D"
          />
        </svg>

        {/* ================= BADGE ITEMS ================= */}
        {items.map((item, i) => {
          const isActive = active === i;
          const isFlipped = flipped === i;
          const isSelected = isActive || isFlipped;
          const hasSelection = active !== null || flipped !== null;
          const isInactive = hasSelection && !isSelected;
          const strap = g.straps[i] ?? 0;
          const reelTop = g.reelTops[i] ?? 0;
          const clipTop = g.clipTops[i] ?? 0;
          const cardOffset = (g.cardTops[i] ?? 0) - clipTop;

          return (
            <div
              key={item.id}
              ref={(node) => {
                slots.current[i] = node;
              }}
              data-lanyard={i}
              className="pointer-events-none absolute left-0 top-0"
              style={{
                width: W,
                height: g.height,
                zIndex: isFlipped ? 60 : isActive ? 30 : 10 + i,
                transform: `translate3d(${((sim.current.x[i] ?? 0) - W / 2).toFixed(
                  2
                )}px,0,0)`,
              }}
            >
              {/* Top Rig Ring */}
              <span
                aria-hidden="true"
                className="absolute block rounded-full border-2 border-[#5E5E6E] bg-[#121218] shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                style={{
                  left: W / 2 - 4.5 * g.u,
                  top: g.railY - g.ring,
                  width: 9 * g.u,
                  height: g.ring * 2,
                }}
              />

              {/* Pendulum Swing Pivot Group */}
              <span
                ref={(node) => {
                  swings.current[i] = node;
                }}
                data-swing
                className="absolute inset-0 block"
                style={{ transformOrigin: `${W / 2}px ${g.pivotY}px` }}
              >
                {/* Lanyard Strap & Texture */}
                <span
                  ref={(node) => {
                    straps.current[i] = node;
                  }}
                  data-strap
                  aria-hidden="true"
                  className="absolute inset-0 block"
                  style={{ ["--stretch" as string]: "0px" }}
                >
                  {/* Woven Nylon Herringbone Strap with Studio Typography */}
                  <span
                    className="absolute block rounded-[1px] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
                    style={{
                      left: W / 2 - g.strapW / 2,
                      top: g.pivotY - 2,
                      width: g.strapW,
                      height: strap + 2,
                      backgroundImage: `
                        repeating-linear-gradient(45deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 4px),
                        repeating-linear-gradient(-45deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 4px),
                        linear-gradient(to right, #0A0A0E 0%, #1A1A24 35%, #222230 50%, #1A1A24 65%, #0A0A0E 100%)
                      `,
                    }}
                  >
                    {/* Lime Stitch Lines */}
                    <span className="absolute inset-y-0 left-[1px] right-[1px] block border-x border-dashed border-[#C6FF3D]/45" />

                    {/* Vertical Monospace Studio Typography */}
                    <svg
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full pointer-events-none"
                      preserveAspectRatio="none"
                    >
                      <text
                        x="50%"
                        y="50%"
                        fill="#C6FF3D"
                        opacity="0.85"
                        fontSize={Math.max(5.5, 6.2 * g.u)}
                        fontFamily="monospace"
                        fontWeight="bold"
                        letterSpacing="0.16em"
                        textAnchor="middle"
                        transform={`rotate(90, ${g.strapW / 2}, ${
                          (strap + 2) / 2
                        })`}
                      >
                        27 STUDIO
                      </text>
                    </svg>
                  </span>

                  {/* Steel Crimp Band at Strap Bottom */}
                  <span
                    className="absolute block rounded-[1px] shadow-[0_1px_3px_rgba(0,0,0,0.8)] border-y border-[#6E6E7E]"
                    style={{
                      left: W / 2 - g.strapW / 2 - 1,
                      top: g.pivotY + strap - g.crimp * 0.4,
                      width: g.strapW + 2,
                      height: g.crimp,
                      background:
                        "linear-gradient(90deg, #2A2A34, #666678 50%, #2A2A34)",
                    }}
                  />

                  {/* Badge Reel Cylinder */}
                  <span
                    className="absolute block rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.9)] border border-white/20"
                    style={{
                      left: W / 2 - g.reel / 2,
                      top: reelTop,
                      width: g.reel,
                      height: g.reel,
                      background:
                        "radial-gradient(circle at 35% 35%, #2E2E38, #111116 80%)",
                    }}
                  >
                    <span className="absolute inset-[15%] block rounded-full border border-white/15" />
                    <span
                      className="absolute left-1/2 top-1/2 block size-[35%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8E8E9E]"
                      style={{
                        background:
                          "linear-gradient(135deg, #7E7E90, #3E3E4C)",
                      }}
                    />
                  </span>

                  {/* Pull Cord */}
                  <span
                    ref={(node) => {
                      cords.current[i] = node;
                    }}
                    className="absolute block w-[2px] bg-white/70 shadow-sm"
                    style={{
                      left: W / 2 - 1,
                      top: reelTop + g.reel * 0.82,
                      height: g.cordRest,
                      transformOrigin: "50% 0",
                    }}
                  />
                </span>

                {/* Badge Hanging Group */}
                <span
                  ref={(node) => {
                    hangs.current[i] = node;
                  }}
                  data-hang
                  className="absolute left-0 block"
                  style={{
                    top: clipTop,
                    width: W,
                    height: cardOffset + g.H,
                    transformOrigin: `${W / 2}px 0px`,
                  }}
                >
                  {/* Dynamic Soft Drop Shadow */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 block pointer-events-none"
                    style={{
                      top: cardOffset,
                      width: W,
                      height: g.H,
                      filter: `blur(${Math.max(6, 10 * g.u).toFixed(1)}px)`,
                    }}
                  >
                    <span
                      ref={(node) => {
                        shadows.current[i] = node;
                      }}
                      data-shadow
                      className="absolute inset-0 block bg-black/60"
                    />
                  </span>

                  {/* Swivel Lobster Clasp Hook Hardware */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute block z-25"
                    style={{
                      left: 0,
                      top: cardOffset - 11 * g.u,
                      width: W,
                    }}
                  >
                    <MetallicLobsterClasp u={g.u} />
                  </div>

                  {/* Tactile Badge Button (Interactive 3D Card) */}
                  <button
                    ref={(node) => {
                      buttons.current[i] = node;
                    }}
                    type="button"
                    data-badge={i}
                    data-flipped={isFlipped ? "true" : "false"}
                    data-active={isActive || undefined}
                    tabIndex={i === (active ?? focusIndex) ? 0 : -1}
                    aria-label={`${item.name}, ${item.role}. Click to view dossier.`}
                    aria-describedby={`${uid}-caption`}
                    aria-pressed={isFlipped}
                    aria-expanded={isFlipped}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className={`pointer-events-auto absolute left-0 cursor-grab active:cursor-grabbing select-none rounded-none p-0 text-left outline-none transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-[#C6FF3D] shadow-[0_0_24px_rgba(198,255,61,0.22)] z-30"
                        : "hover:ring-1 hover:ring-white/30 z-20"
                    } focus-visible:ring-2 focus-visible:ring-[#C6FF3D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B0B0F]`}
                    style={
                      {
                        top: cardOffset,
                        width: W,
                        height: g.H,
                        fontSize: base,
                        opacity: isInactive ? 0.5 : 1,
                        transform: isFlipped
                          ? "scale(1.3) translateZ(50px)"
                          : isActive
                          ? "scale(1.04) translateZ(12px)"
                          : "scale(1) translateZ(0)",
                        transformOrigin: "center 25%",
                        boxShadow: isFlipped
                          ? "0 35px 85px rgba(0,0,0,0.95), 0 0 35px rgba(198,255,61,0.3)"
                          : undefined,
                        transition:
                          "transform 0.48s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, box-shadow 0.35s ease",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        WebkitUserDrag: "none",
                      } as React.CSSProperties
                    }
                    onFocus={() => {
                      setFocusIndex(i);
                      if (pointer.current.id < 0) {
                        stop();
                        setActive(i);
                      }
                    }}
                    onPointerEnter={() => {
                      if (pointer.current.id < 0) {
                        setActive(i);
                      }
                    }}
                    onPointerLeave={() => {
                      if (pointer.current.id < 0) {
                        setActive(null);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggle(i);
                      }
                    }}
                    onClick={(event) => {
                      const pending = pendingOpen.current;
                      pendingOpen.current = -1;
                      if (event.detail === 0 || pending === i) toggle(i);
                    }}
                  >
                    <span
                      ref={(node) => {
                        flips.current[i] = node;
                      }}
                      data-flip
                      className="absolute inset-0 block [transform-style:preserve-3d]"
                      style={{
                        transform: `perspective(${PERSPECTIVE}px) rotateY(${
                          REST_Y[i % REST_Y.length] ?? 0
                        }deg)`,
                      }}
                    >
                      <BadgeFaces item={item} />
                    </span>
                  </button>
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Carousel Dots for Mobile Screens */}
      {size.carousel && count > 1 && (
        <div
          className="relative z-10 mt-2 flex justify-center gap-2"
          role="group"
          aria-label={labels.show}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${labels.show} ${item.name}`}
              aria-current={centerIndex === i}
              onClick={() => {
                stop();
                setActive(i);
              }}
              className="group flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF3D]"
            >
              <span
                aria-hidden="true"
                className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                  centerIndex === i
                    ? "w-7 bg-[#C6FF3D]"
                    : "w-2 bg-white/30 group-hover:bg-white/50"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Bottom Status / Instruction HUD */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[5.5rem] px-6 text-center select-none mt-6 sm:mt-8">
        <div
          id={`${uid}-caption`}
          aria-live="polite"
          className="font-mono transition-all duration-300 max-w-xl mx-auto flex flex-col items-center"
        >
          {displayPerson ? (
            <>
              {/* Member Readout: Clean text without separate background container */}
              <div className="mb-1.5 animate-fadeIn">
                <span className="text-xs sm:text-sm font-bold text-[#F4F1EA] tracking-wider uppercase">
                  {displayPerson.name} — {displayPerson.role}
                </span>
              </div>

              {isHoverState ? (
                /* Hover state: Display prompt to select and open dossier */
                <p className="text-[10px] sm:text-[11px] text-[#A9A7A0] tracking-widest uppercase m-0 flex items-center justify-center gap-2 animate-fadeIn">
                  <span>SELECT TO OPEN DOSSIER</span>
                  <span>•</span>
                  <span>CLICK TO FLIP</span>
                </p>
              ) : isSelectedState && selectedIndex !== null ? (
                /* Selected state: Full controls with persistent CONNECT link */
                <p className="text-[11px] sm:text-xs text-[#A9A7A0] tracking-wider flex items-center justify-center flex-wrap gap-2 m-0 animate-fadeIn">
                  <span className="text-[#C6FF3D] font-bold">DOSSIER OPEN</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => toggle(selectedIndex)}
                    className="hover:text-white transition-colors cursor-pointer underline"
                  >
                    SELECT AGAIN TO CLOSE
                  </button>
                  {displayPerson.links && displayPerson.links.length > 0 && (
                    <>
                      <span>•</span>
                      <a
                        href={displayPerson.links[0].href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C6FF3D] hover:underline inline-flex items-center gap-1 font-bold pointer-events-auto"
                      >
                        CONNECT ↗
                      </a>
                    </>
                  )}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-[10px] sm:text-[11px] text-[#6E6E78] tracking-widest uppercase m-0">
              DRAG TO SWING • CLICK TO FLIP • TAB + ENTER FOR KEYBOARD
            </p>
          )}
        </div>
        {action}
      </div>
    </section>
  );
}

export default TeamLanyardRail;
