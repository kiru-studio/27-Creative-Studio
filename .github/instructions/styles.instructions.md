---
applyTo: '**/*.css'
---
- Define colors, fonts, spacing, and radii as tokens; never hardcode hex values outside the token definitions.
- Industry accents are overridden with [data-industry="..."] on <html>.
- Text on an accent fill is ink. Accent is never used as text on a light surface.
- Keep selector specificity flat to avoid classes cancelling each other.