# Workspace

## Overview

pnpm monorepo hosting CinemaStream — a movie & drama streaming web app that
embeds YouTube videos (no video storage), plus an API server that auto-fetches
videos from configured YouTube channels.

## Artifacts

- **cinemastream** (`/`) — React + Vite frontend.
  Pages: home, browse, movie detail, genre, drama list, drama detail, channel,
  blog list, blog detail, admin, about, 404.
  SEO: react-helmet-async, JSON-LD (Movie + VideoObject + Article + Breadcrumb),
  robots.txt, sitemap.xml.
- **api-server** (`/api`) — Express + Drizzle.
  Routes: `/api/healthz`, `/api/channels` (CRUD), `/api/channels/:id/videos`,
  `/api/videos`, `/api/overrides/:videoId` (PUT/DELETE),
  `/api/translate` (AI Chinese→Indonesian), `/api/sitemap-drama.xml` (dynamic sitemap),
  `/api/articles` (CRUD), `/api/articles/:slug` (GET), `/api/feed.xml` (RSS).
  Pulls latest videos from YouTube via the public RSS feed
  (`/feeds/videos.xml?channel_id=…`) — no API key required, in-memory cache 5 min.
  AI translation uses gpt-5-mini via Replit AI Integrations (no key required).
- **mockup-sandbox** (`/__mockup`) — design canvas (unused for product features).

## Database

PostgreSQL via Replit (Drizzle ORM). Schema in `lib/db/src/schema/`:
- `channels` — YouTube channels added by the admin.
- `video_overrides` — per-video custom title/description (e.g. Indonesian
  translations of Chinese drama titles). Joined into the API response so
  visitors always see the localized version when present.
- `articles` — editorial blog posts (markdown content, draft/published status,
  optional cover image, optional related channel). Used for SEO/AdSense
  approval and to give the site original written content.

Push schema changes: `pnpm --filter @workspace/db run push`.

## API codegen

OpenAPI spec at `lib/api-spec/openapi.yaml`. After editing, run
`pnpm --filter @workspace/api-spec run codegen` to regenerate
`@workspace/api-zod` (server validation) and `@workspace/api-client-react`
(typed React Query hooks consumed by cinemastream).

## Stack

- React 19, Vite 7, Wouter, Tailwind v4, shadcn/ui, Framer Motion
- Express 5, Pino, Drizzle ORM 0.45, Zod 3
- Orval for OpenAPI → Zod + React Query codegen

## Key commands

- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/cinemastream run dev` — frontend
- `pnpm --filter @workspace/api-server run dev` — backend
- `pnpm --filter @workspace/db run push` — sync schema
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API clients
- `cd artifacts/cinemastream && node scripts/generate-sitemap.mjs` — regenerate sitemap

## Adding new movies

Edit `artifacts/cinemastream/src/data/movies.ts`, add a new entry with the
official YouTube video ID, then re-run the sitemap generator script.

## Adding YouTube channels for auto-update Drama section

Visit `/admin` in the running app. Paste a channel handle (e.g. `@miniseries_magic`)
or a full channel URL. The server resolves the channel ID via the channel
page, persists it, and starts pulling its latest videos. To localize a
title, click "Edit Judul" on any video in the admin list.

## Anti-AGC + SEO safeguards

To avoid Google penalties for thin/auto-generated content:
- Each drama detail page shows a `YouTubeAttribution` block with the original
  YouTube source link and an AI translation disclosure.
- Footer permanently displays the embed/translation disclosure.
- Legal pages live under `/privacy`, `/terms`, `/dmca`, `/contact`.
- Every page has Breadcrumb JSON-LD, original VideoObject schema points to the
  YouTube source, and rel="external" is used on YouTube links.
- Sitemap (`/api/sitemap-drama.xml`) only lists URLs that resolve to real
  content (channels with videos).

## Google AdSense (monetization)

Ad infrastructure is configurable via Vite env vars (set in Deployments →
Environment, **prefixed `VITE_`** so they're inlined at build time):

| Variable | Purpose |
| --- | --- |
| `VITE_ADSENSE_CLIENT` | Your AdSense client ID, e.g. `ca-pub-1234567890123456` |
| `VITE_ADSENSE_SLOT_HOME_TOP` | Slot ID for the home page mid-section banner |
| `VITE_ADSENSE_SLOT_IN_ARTICLE` | In-article slot below the player |
| `VITE_ADSENSE_SLOT_SIDEBAR` | Sidebar slot on drama detail pages |
| `VITE_ADSENSE_SLOT_CHANNEL_BOTTOM` | Bottom-of-grid slot on channel pages |

If `VITE_ADSENSE_CLIENT` is unset, ads render nothing in production (and
show a placeholder in dev). Update `public/ads.txt` with your real publisher
ID before submitting the site to AdSense for review.

## Editorial blog & RSS feed

The site has a built-in editorial system to publish original written content
(important for AdSense approval and site quality signals):

- **Public pages**: `/blog` (list of published articles) and `/blog/:slug`
  (full article with markdown rendering, Article + Breadcrumb JSON-LD,
  reading time, optional cover image, optional related channel link).
- **Home page**: latest 3 published articles appear in a "Berita & artikel
  terbaru" section under the latest episodes grid.
- **Admin**: `/admin` has an "Artikel & Berita" panel for create/edit/delete
  with a markdown textarea, slug auto-generation, draft/published toggle,
  and optional related-channel selector.
- **RSS feed**: `/api/feed.xml` (RSS 2.0) combines the latest 25 episodes
  with all published articles. Discoverable via `<link rel="alternate">`
  in `index.html` and listed in `public/robots.txt`.
- **Sitemap**: static sitemap (`public/sitemap.xml`) includes `/blog`;
  dynamic sitemap (`/api/sitemap-drama.xml`) lists all published article URLs.

Write articles directly via `/admin` — content is stored as Markdown in
the `articles` table and rendered with the `marked` library on the client.
