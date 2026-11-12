# 27 Creative Studio

A footage-led marketing site for 27 Creative Studio (27 Studio), a two-person
video and local-growth studio based in Thoothukudi, Tamil Nadu. Visitors can
explore selected work and contact the studio through WhatsApp or the project
brief form.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Framer Motion

## Getting started

Use Node.js 20.9 or later and pnpm 12.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks and production

```bash
pnpm typecheck
pnpm build
pnpm start
```

There is no configured lint or maintained automated test suite yet. The
exploratory Playwright scripts in `scripts/` include historical audits, so check
their selectors before relying on them. They expect the development server at
`http://localhost:3000` and write screenshots under the ignored `scratch/`
folder.

## Content and media

- Edit site copy, links, project details, and media paths in
  `content/site-content.json`.
- The shared `27 / Creative Studio` lockup uses the supplied mark in
  `public/images/` and the brand values in that file.
- The content shape is typed in `lib/site-content.ts`.
- Store bundled photos and posters in `public/images/`, and videos in
  `public/videos/`. Reference them with root-relative paths such as
  `/images/hero-poster.jpg`.
- The public content editor is at `/admin`. See
  [docs/admin-setup.md](docs/admin-setup.md) for authentication, uploads, and
  publishing setup.

## Deployment

The site can be deployed to Vercel. Set the admin and media environment
variables documented in [docs/admin-setup.md](docs/admin-setup.md) before
enabling the editor or media uploads.
