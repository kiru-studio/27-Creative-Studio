# Rec mode studio site

Single-page marketing site for a two-person video production studio serving every type of business. Visitors book a shoot through WhatsApp or a brief form. English only. Look: dark cinematic "rec mode", camera-viewfinder chrome around the footage. The footage is the hero.

## Stack
Next.js App Router, TypeScript, Tailwind, shadcn/ui primitives restyled with tokens. Keep dependencies minimal; justify every new one.

## Rules
- Colors, fonts, spacing, and radii come from the tokens in globals.css. Never hardcode them in components.
- All copy, names, numbers, links, and media references live in lib/site-content.ts. No literal copy in components.
- Placeholders must look obviously fake and carry a PLACEHOLDER comment. Never invent realistic client names, statistics, or testimonials.
- All video and images go through MediaSlot: poster first, lazy, muted, reserved aspect ratio, sound only after a user action.
- One accent at a time, switched by data-industry on <html>. rec red only on the recording dot.
- No gradients, glows, identical card grids, entrance animations on every section, parallax, or auto-scrolling marquees.
- Respect prefers-reduced-motion everywhere.
- Mobile first at 390px. 44px tap targets. Visible focus ring. Semantic landmarks. Keyboard-usable everything.

## Workflow
- Make small, reviewable changes. Run lint, typecheck, and build before saying a task is done.
- If a rule here seems wrong or missing, say so instead of silently working around it.
- Tell me what you could not verify.