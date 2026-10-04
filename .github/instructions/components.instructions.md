---
applyTo: 'components/**/*.tsx,app/**/*.tsx'
---
- Use semantic HTML first; add ARIA only when needed.
- Dialogs, lightboxes, and viewers trap focus, close on Esc, and return focus to the trigger.
- Interactive controls are at least 44px, with a visible focus ring from the token.
- Videos never autoplay with sound. Gate sound behind a user action.
- Animations use CSS where possible and have a reduced-motion fallback that shows the final state.
- No literal copy: read from lib/site-content.ts.
- Use client components only where interaction needs them.