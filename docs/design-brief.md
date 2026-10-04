Project: single-page marketing site for a two-person video production studio that serves every type of business (hotels, showrooms, restaurants, clinics, real estate and more). Goal: visitors book a shoot through WhatsApp or the brief form. English only.

Look, called "rec mode": the page feels like looking through a camera viewfinder. Dark and cinematic. The footage is the hero; the interface is quiet camera chrome around it.

Stack: Next.js App Router, TypeScript, Tailwind. Use shadcn/ui primitives only where they help (Button, Dialog, Accordion, ToggleGroup, Input, Textarea, Label) and always restyle them with the tokens below. Never ship default shadcn styling or default shadcn spacing.

Tokens (CSS variables in globals.css, mapped into the Tailwind theme):
- ink #0B0B0F page background
- paper #F4F1EA main text
- muted #A9A7A0 secondary text
- line #2A2A30 hairlines and tracks
- accent #C6FF3D default (buttons, playhead, highlights)
- rec #FF3B30 ONLY for the recording dot
- Industry accents, applied with a data-industry attribute on <html>: hotels #F2B84B, showrooms #FF5A3D, restaurants #FF9A3D, clinics #2DD4BF, real-estate #6B9BFF. Text on an accent fill is always ink. Never use accent as text on a light surface.

Fonts via next/font/google: Big Shoulders Display (headlines, weight 700 to 800, sentence case), Figtree (body), Martian Mono (timecode only). Fluid type with clamp. Body line length under 70 characters.

Shape: 6px radius on controls, square corners on media frames, a larger radius only on the phone frames around reels. 12-column grid, max width 1280px.

Signature elements (use these, add no others): viewfinder corner brackets on the hero and the featured film; the HUD (blinking rec dot, ticking timecode, scroll playhead along the bottom edge); recolor and filter of the whole page by chosen industry.

Motion: one orchestrated moment only, a countdown preloader into the hero (once per session, skippable, at most 1.5 seconds). Functional motion that answers a user action is fine (150 to 250 ms). Two scroll-linked effects only: the bottom playhead and the speed timeline. No entrance animation on each section, no parallax, no film grain, no auto-scrolling marquee, no gradients, no glows. Respect prefers-reduced-motion everywhere.

Content: ALL copy, names, numbers, links and media references live in lib/site-content.ts. No literal copy inside components. Placeholders must look obviously fake (for example "Client name", "00 videos"). Never invent realistic client names, statistics, or testimonials. Mark every placeholder with a comment containing PLACEHOLDER.

Media: no external images or videos. Use a MediaSlot component that shows a generated flat-color poster (inline SVG or CSS, labeled) until a real source exists. Reserve aspect ratio so nothing shifts. Video is muted and lazy-loaded, and plays sound only after a user action.

Quality: design mobile first at 390px, 44px minimum tap targets, visible 2px accent focus ring, semantic landmarks, keyboard-usable everything, a skip link, strong contrast.

Copy voice: plain, confident, specific. Sentence case. The main button always says "Book a shoot". Navigation stays plain: Work, Packages, About, Contact. No tracked all-caps eyebrow labels above headings, no middle-dot meta strings, no arrow on every button, no identical rounded-card grids.