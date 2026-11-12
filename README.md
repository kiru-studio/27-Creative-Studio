# 27 Creative Studio 🎬

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-14.0-ff0055?style=flat&logo=framer)](https://www.framer.com/motion/)
[![Google OAuth 2.0](https://img.shields.io/badge/Google_Auth-OAuth_2.0-4285F4?style=flat&logo=google)](https://cloud.google.com/)
[![Deployment: Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://27-creative-studio.vercel.app)

> **Real Growth. Real Results.**  
> A high-performance, footage-led marketing engine and Cyber-Industrial Content Management System (CMS) built for **27 Creative Studio** — a premier video production and Instagram growth agency based in **Thoothukudi, Tamil Nadu, India**.

---

## 🌐 Live Deployments & Key Links

- **Production Website:** [https://27-creative-studio.vercel.app](https://27-creative-studio.vercel.app)
- **Cyber-Industrial Admin CMS:** [https://27-creative-studio.vercel.app/admin](https://27-creative-studio.vercel.app/admin)
- **GitHub Repository:** [https://github.com/kiru-studio/27-Creative-Studio](https://github.com/kiru-studio/27-Creative-Studio)

---

## 📑 Table of Contents

1. [Design Philosophy & "Rec Mode"](#-design-philosophy--rec-mode)
2. [Key Website Features](#-key-website-features)
3. [Cyber-Industrial Admin Control Room (`/admin`)](#-cyber-industrial-admin-control-room-admin)
4. [Publishing Engine Architecture](#-publishing-engine-architecture)
5. [Authentication & Security](#-authentication--security)
6. [Free-Tier Media Hub & Google Drive Workflow](#-free-tier-media-hub--google-drive-workflow)
7. [Google Drive Asset Hub (`27_STUDIO_DRIVE_ASSETS/`)](#-google-drive-asset-hub-27_studio_drive_assets)
8. [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
9. [Environment Variables Reference](#-environment-variables-reference)
10. [Local Development & Getting Started](#-local-development--getting-started)
11. [Testing & Quality Assurance](#-testing--quality-assurance)

---

## 🎥 Design Philosophy & "Rec Mode"

The site is built with a bespoke **"Rec Mode"** aesthetic — designed to make the client feel like they are peering through the precision viewfinder of an ARRI or RED cinema camera. High-framerate video footage takes center stage, framed by quiet, functional camera chrome.

### Color Tokens
- `ink` (`#0B0B0F`): Deep monitor obsidian background.
- `paper` (`#F4F1EA`): Crisp high-contrast readable text.
- `muted` (`#A9A7A0`): Secondary viewfinder telemetry and subtitles.
- `line` (`#2A2A30`): 1px precision hairlines, crosshairs, and tracking rails.
- `accent` (`#C6FF3D`): Electric viewfinder neon for primary interactions, buttons, and playheads.
- `rec` (`#FF3B30`): Dedicated blinking tally light indicator.

### Dynamic Industry Chromas
The interface dynamically re-chromas its accents based on the targeted client sector (`data-industry`):
- **Hotels & Resorts:** `#F2B84B` (Warm amber gold)
- **Showrooms & Retail:** `#FF5A3D` (Vibrant cinema orange)
- **Restaurants & Cafes:** `#FF9A3D` (Culinary apricot)
- **Clinics & Healthcare:** `#2DD4BF` (Clean medical cyan)
- **Real Estate & Architecture:** `#6B9BFF` (Structural cobalt)

### Typography
- **Headlines:** `Big Shoulders Display` (Weights 700–800, sentence-case, impactful cinematic scale).
- **Body & Controls:** `Figtree` (Clean, geometric, highly legible body copy).
- **Telemetry & Timecodes:** `Martian Mono` (Fixed-width broadcast timecodes, ISO data, frame rates).

---

## ⚡ Key Website Features

- **Skewed Viewfinder Hero:** Immersive opening sequence featuring live camera HUD brackets, ticking timecodes, instant video reel loops, and direct WhatsApp inquiry trigger.
- **Vertical Reels Showcase (9:16):** High-velocity shortform showcase optimized for mobile aspect ratios with seamless audio toggling, client metrics, and category filtering.
- **Cinematic Brand Films (16:9):** Wide-aspect commercial portfolio with custom player overlays and sound controls.
- **Dynamic Crew Pass Lanyard Rail:** Interactive team roster featuring physics-inspired lanyard passes, dual-sided flip dossiers, and member specialties.
- **SD Memory Card Pricing Packages:** Realistic camera SD card UI (64GB / 128GB / 256GB tiers) breaking down production deliverables, turnaround times, and pricing.
- **Case Studies & Proof Cards:** Concrete business outcomes (views, follower growth, revenue impact) for Thoothukudi and Tamil Nadu businesses.
- **Process Speedrun & Guarantees:** Transparent timeline showing 48-hour turnarounds, shoot-to-publish workflows, and zero-headache revisions.
- **Interactive Stagger Filmstrip Testimonials:** Authenticated quotes from local business owners and brand managers.
- **Full Legal & Utility Suite:** Custom 404 viewfinder page, Thank-You confirmation flow, and complete Privacy Policy & Terms of Service.

---

## 🎛️ Cyber-Industrial Admin Control Room (`/admin`)

The `/admin` dashboard is a studio control room designed with industrial precision, live telemetry gauges, and 8 dedicated content modules:

1. **Reels & Shortform (9:16):** Add, modify, reorder, or delete high-velocity vertical reels, view counts, and categories.
2. **Brand Films (16:9):** Manage horizontal flagship films, client tags, runtimes, and aspect ratios.
3. **Crew Passes:** Update team members, roles, bio dossiers, gear specialties, and avatar portraits.
4. **SD Memory Packages:** Adjust package tiers, pricing, features, turnarounds, and highlight badges.
5. **Case Studies:** Edit client success stories, key metrics, before/after statistics, and proof media.
6. **Speed & Process:** Configure workflow milestones and turnaround guarantees.
7. **FAQ & Reviews:** Manage accordion FAQs and client testimonial filmstrips.
8. **Studio & General Info:** Update WhatsApp booking numbers, studio coordinates, email, social handles, and SEO metadata.

---

## 🔄 Publishing Engine Architecture

The site uses a unified dual-mode publishing architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                   Admin Control Room (/admin)               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                [ Save & Publish Triggered ]
                               │
        ┌──────────────────────┴──────────────────────┐
        ▼                                             ▼
 [ Local Development ]                         [ Live Vercel ]
Writes directly to:                    Pushes via GitHub REST API:
content/site-content.json              origin/main (repo commit)
        │                                             │
Instant UI reload                      Automatic Vercel Build Triggered
                                       (Deploys in ~45 seconds)
```

- **Local Development:** Saves changes directly to `content/site-content.json` on disk.
- **Production (Vercel):** Connects securely to the GitHub REST API using a fine-grained token (`GITHUB_CONTENT_TOKEN`), committing the updated master file directly to `kiru-studio/27-Creative-Studio` (`main` branch). Vercel detects the commit and deploys the new content globally with zero downtime.

---

## 🔒 Authentication & Security

### 1. High-Security Google OAuth 2.0
- **One-Click Sign-In:** Authenticate seamlessly using your Google Account.
- **Strict Email Whitelist:** Enforced via `ADMIN_ALLOWED_EMAILS`. Only authorized Google accounts can log in; any other email receives an immediate access denial.
- **CSRF State Verification:** Cryptographically random `state` token verified via HTTP-only cookie to prevent cross-site request forgery.
- **Reverse-Proxy Resilient:** Dynamically constructs OAuth callback URLs by inspecting `x-forwarded-proto` and `x-forwarded-host`, preventing protocol mismatches between local dev and Vercel edge networks.

### 2. Studio Master Password Fallback
- Dual authentication fallback allows signing in with a master `ADMIN_PASSWORD`.
- Session tokens are cryptographically signed using HMAC-SHA256 (`ADMIN_SESSION_SECRET`) and stored in secure, `SameSite=Lax`, `HttpOnly` cookies.

---

## ☁️ Free-Tier Media Hub & Google Drive Workflow

Host high-resolution videos and posters with **$0 monthly infrastructure costs**:

### 1. Smart Media Input (`components/admin/smart-media-input.tsx`)
- **Google Drive Auto-Converter:** Paste any public Google Drive sharing link (`https://drive.google.com/file/d/FILE_ID/view`). The admin interface automatically detects it and converts it into a high-performance direct stream or thumbnail URL.
- **Cloudinary Integration:** Paste a `.mp4` video URL and click **Auto-Generate Poster** to instantly derive a `.jpg` poster frame from frame 0 of the video.
- **Direct Local Uploads:** Upload media directly to `public/uploads/` on local machines or to a Vercel Blob store in production.
- **Media Resolution Guide Modal:** Interactive guide with instant copy buttons for exact aspect ratios (9:16, 16:9, 3:4, 1:1, 1.91:1), recommended bitrates, and codecs.

---

## 📁 Google Drive Asset Hub (`27_STUDIO_DRIVE_ASSETS/`)

The repository includes a ready-to-upload master asset folder structure located in the project root:

```text
27_STUDIO_DRIVE_ASSETS/
├── 00_GOOGLE_DRIVE_SHARING_RULES.txt  # Instructions for setting public read access
├── 01_HERO_MEDIA/                     # 16:9, 1080p 24fps MP4 reel & poster frame
├── 02_REELS_SHORTFORM_9x16/
│   ├── VIDEOS/                        # 1080x1920 MP4 vertical reels (H.264, 8-12 Mbps)
│   └── POSTERS_COVERS/                # 1080x1920 JPG cover frames
├── 03_BRAND_FILMS_16x9/
│   ├── VIDEOS/                        # 1920x1080 / 2560x1440 MP4 brand films
│   └── POSTERS/                       # 16:9 JPG poster frames
├── 04_CREW_PORTRAITS_3x4/             # 900x1200 or 1200x1600 JPG crew badge portraits
├── 05_CASE_STUDIES/                   # Client campaign proof videos & stills
├── 06_BRAND_LOGOS_ICONS/              # 1:1 square transparent PNGs (512x512)
└── 07_SOCIAL_SHARE_CARDS_OG/          # 1200x630 OpenGraph social share card (1.91:1)
```

Each folder contains an individual `GUIDE_RESOLUTION.txt` detailing exact dimensions, aspect ratios, file size recommendations, and naming conventions.

---

## 🏗️ Project Architecture & Directory Structure

```text
├── 27_STUDIO_DRIVE_ASSETS/  # Master Google Drive structure with resolution guides
├── app/
│   ├── admin/               # Cyber-Industrial Admin Control Room (/admin)
│   ├── api/admin/
│   │   ├── auth/            # Google OAuth 2.0 & password login/logout endpoints
│   │   ├── content/         # Content publishing engine (GitHub API & local disk)
│   │   └── upload/          # Multipart file upload handler (local disk / Vercel Blob)
│   ├── privacy/             # Privacy Policy page
│   ├── terms/               # Terms of Service page
│   ├── thank-you/           # Post-inquiry Thank You page
│   ├── not-found.tsx        # Custom Viewfinder 404 page
│   ├── layout.tsx           # Root layout, fonts, and metadata
│   └── page.tsx             # Studio single-page flagship experience
├── components/
│   ├── admin/               # Admin CMS modules, Smart Media Input, Media Guide Modal
│   ├── ui/                  # Restyled camera-chrome primitives (dialogs, toggles, inputs)
│   ├── hero.tsx             # Skewed Viewfinder Hero & WhatsApp CTA
│   ├── reels-section.tsx    # 9:16 vertical reels grid & player
│   ├── brand-films.tsx      # 16:9 cinematic commercial showcase
│   ├── about-section.tsx    # Dynamic crew pass lanyard rail
│   ├── packages-section.tsx # Interactive SD memory card packages
│   ├── case-studies.tsx     # Client proof cards & statistics
│   ├── testimonials.tsx     # Filmstrip customer reviews
│   └── footer.tsx           # Contact details, address & social links
├── content/
│   └── site-content.json    # Master content database
├── docs/
│   ├── admin-setup.md       # Admin environment & authentication setup
│   └── design-brief.md      # Studio brand specifications, tokens, and rules
├── lib/
│   ├── admin-auth.ts        # Session token signing and verification
│   ├── media-utils.ts       # Google Drive & Cloudinary URL auto-converters
│   ├── site-content.ts      # TypeScript interfaces and default schema
│   └── utils.ts             # Tailwind class merging utility (cn)
├── public/
│   ├── images/              # Bundled image assets and logos
│   ├── uploads/             # Locally uploaded media files
│   └── videos/              # Bundled video footage
├── scripts/                 # Automated test & benchmark scripts
├── .env.example             # Template for local & production environment variables
└── README.md                # Project documentation
```

---

## 🔑 Environment Variables Reference

Create a `.env.local` file for local development, and configure these variables in **Vercel Project Settings → Environment Variables**:

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `ADMIN_PASSWORD` | Password for admin fallback login | Strong random password |
| `ADMIN_SESSION_SECRET` | 32+ character key for signing session cookies | Random hex / base64 string |
| `GITHUB_OWNER` | Owner of the GitHub repository | `kiru-studio` |
| `GITHUB_REPO` | Repository name | `27-Creative-Studio` |
| `GITHUB_BRANCH` | Target branch for publishing commits | `main` |
| `GITHUB_CONTENT_TOKEN` | Fine-grained GitHub PAT with **Contents: Read & Write** | `ghp_...` |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth 2.0 Web Client ID | `504500284573-...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth 2.0 Client Secret | `GOCSPX-...` |
| `ADMIN_ALLOWED_EMAILS` | Comma-separated list of authorized admin emails | `director@27studio.in,admin@gmail.com` |
| `BLOB_READ_WRITE_TOKEN` | (Optional) Token for Vercel Blob storage | Only if using Vercel Blob |

> [!TIP]
> In Google Cloud Console, ensure your **Authorized Redirect URIs** include:
> - Localhost: `http://localhost:3000/api/admin/auth/google/callback`
> - Production: `https://27-creative-studio.vercel.app/api/admin/auth/google/callback`

---

## 💻 Local Development & Getting Started

### Prerequisites
- **Node.js:** `20.9.0` or higher
- **Package Manager:** `pnpm` 10 or 12

### Installation

```bash
# Clone the repository
git clone https://github.com/kiru-studio/27-Creative-Studio.git
cd 27-Creative-Studio

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# (Edit .env.local with your credentials)

# Start the development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) for the main website or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

---

## 🧪 Testing & Quality Assurance

Run type checks, production builds, and UI validation scripts:

```bash
# TypeScript compilation check
pnpm typecheck

# Production Next.js build
pnpm build

# Run automated Playwright UI & contrast tests
node scripts/test-ui.mjs
```

---

## 📜 License & Studio Ownership

Copyright © 2026 **27 Creative Studio**. All rights reserved.  
All brand assets, video footage, photography, and marks are proprietary to 27 Creative Studio, Thoothukudi, Tamil Nadu, India.
