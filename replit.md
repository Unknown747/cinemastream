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

## Visual style

Home page, header, footer, and drama card adopt an **AnimeSail-inspired**
layout (per user request, April 2026):

- Dark theme retuned to neutral cool gray (`hsl(220 10% 6%)`) with cyan accent
  (`hsl(205 95% 55%)`) replacing the previous warm amber.
- Header is a single sticky bar: small sail logo + dominant dark search input
  + hamburger menu that toggles a vertical nav drawer.
- Home is a single max-w 1100px column with: brick-red welcome banner,
  centered "Episode Terbaru" title + Semua/Drama/Movie tab pill, 2-/3-/4-col
  poster grid (3:4 aspect, title + year-cyan · type · time-ago), Next button
  pagination, latest-article CTA, KOMUNITAS gradient banner, "Lagi Rame"
  channel list (round avatars + user-online count), "Update Tontonan" pinned
  bar with Sync button, "Movie Terbaru" with SEMUA MOVIE button, then
  Berita & Artikel list.
- Footer is a slim two-row block: legal nav + disclaimer.

Drama detail / channel / blog pages still use the original component styles
underneath the new theme tokens.

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

## Unified `/film/:slug` URLs + SEO upgrade

- Movies and dramas share the canonical URL pattern `/film/<slug>` where the
  trailing 11 characters are the YouTube video id (helpers in
  `src/lib/slug.ts`). `/movie/*` and `/drama/*` issue 301 redirects via
  `vite-plugin-legacy-redirects.ts` (dev + preview servers). `robots.txt`
  disallows the legacy paths and allows `/film`.
- `src/components/seo.tsx` enforces ≤60-char titles and ≤160-char descriptions
  through `src/lib/seo-text.ts` (`truncateTitle`, `truncateDescription`,
  `buildVideoSeoTitle`, `buildVideoSeoDescription`).
- Drama and movie detail pages render a long-form synopsis (≥200 words) when
  the source description is short, plus a collapsible "Transkrip & ringkasan
  video" section (≥500 words) generated from metadata — non-spammy, factual,
  per-video unique.
- `src/components/share-bar.tsx` provides 44×44 tap-target social share
  buttons (WhatsApp / Telegram / Facebook / X / Copy link) replacing the
  single share button on detail pages.
- The vite legacy-redirects plugin also injects `Cache-Control` headers for
  static images, fonts, and `/assets/*` to improve mobile performance.

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
