---
name: rec-mode-design
description: Design system and rules for the rec mode studio site. Use whenever building or changing UI, styles, copy, motion, or components in this project.
---

# Rec mode design system

Concept: the site feels like looking through a camera viewfinder. The interface is camera chrome around the footage. The footage is always the hero.

## Colors (the brief's values win if they change)
- ink #0B0B0F: page background
- paper #F4F1EA: main text on dark
- muted #A9A7A0: secondary text
- line #2A2A30: hairlines and tracks
- accent, default lime #C6FF3D: buttons, playhead, highlights
- rec #FF3B30: the recording dot only, nowhere else

Industry accents, applied with `[data-industry="..."]` on `<html>`:
hotels #F2B84B, showrooms #FF5A3D, restaurants #FF9A3D, clinics #2DD4BF, real-estate #6B9BFF. "Everything" and "other" use the default lime. Text on an accent fill is always ink. Accent never appears as text on paper or light surfaces.

## Type
- Display: Big Shoulders Display, 700 to 800, sentence case. Alternatives if it does not suit: Anton, Unbounded.
- Body: Figtree.
- Mono: Martian Mono, only for the timecode and HUD numbers.
Load with `next/font`, with system fallbacks and `display: swap`. Use a fluid scale with `clamp`. Keep body line length under 70 characters.

## Shape and layout
12-column grid, max width 1280px, generous vertical rhythm. Controls use a 6px radius. Media frames are square-cornered and get viewfinder corner brackets on the hero and the featured film only. The phone frames around reels are the one place for a large radius.

## Signature elements (use these, do not add more)
1. Viewfinder corner brackets on the hero and the featured film.
2. The HUD: blinking rec dot, ticking timecode, and a scroll playhead bar along the bottom edge. The HUD never covers content or buttons. Hide the timecode on narrow screens if it crowds anything.
3. Industry recolor: choosing an industry changes the accent and filters the work.

## Motion budget
- One orchestrated moment: the countdown preloader into the hero reveal. Once per session, skippable, at most 1.5 seconds total.
- Functional motion that answers a person's action: picker change, lightbox open and close, accordion, hover and focus states. 150 to 250 ms.
- Two scroll-linked effects only: the bottom playhead and the speed-section timeline.
- No entrance animation on each section. No parallax. No film grain over text. No auto-scrolling marquee.
- Every animation has a `prefers-reduced-motion` fallback that shows the final state instantly.

## Copy voice
Plain, confident, specific. Sentence case. Active verbs. The main call to action is always "Book a shoot". Navigation stays plain: Work, Packages, About, Contact. Film language lives in microcopy only: the preloader, the footer line "That's a wrap", empty states. No tracked all-caps eyebrow labels above headings, no middle-dot meta strings, no arrow added to every button.

## Components
- Primary button: accent fill, ink text. Secondary: paper outline. Minimum 44px tap target. Visible 2px accent focus ring with offset.
- MediaSlot: poster first, lazy video, muted and looping for ambient use, plays sound only on explicit user action, reserves its aspect ratio so nothing shifts.
- Do not chop everything into identical rounded cards. Vary structure: full-bleed media, split layouts, lists, and one table-like packages layout.

## Before finishing any task
Screenshot at 390, 768, and 1440 wide. Compare against these rules. Remove one decoration.