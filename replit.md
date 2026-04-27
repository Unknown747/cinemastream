# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the CinemaStream movie streaming web app.

## Artifacts

- **cinemastream** (`/`) — Movie streaming web app (React + Vite, frontend-only).
  Plays films via YouTube embeds, no video storage.
  Features: home, browse, movie detail w/ player, genre pages, about, 404.
  SEO: react-helmet-async, JSON-LD (Movie + VideoObject), robots.txt, sitemap.xml.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **Frontend**: React 19, Vite, Wouter, Tailwind v4, shadcn/ui, Framer Motion
- **SEO**: react-helmet-async + JSON-LD structured data
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)

## Key Commands

- `pnpm run typecheck` — full typecheck
- `pnpm run build` — typecheck + build
- `pnpm --filter @workspace/cinemastream run dev` — run cinemastream locally
- `cd artifacts/cinemastream && node scripts/generate-sitemap.mjs` — regenerate sitemap.xml after adding/removing movies

## Adding new movies

Edit `artifacts/cinemastream/src/data/movies.ts`, add a new entry with the
official YouTube video ID, then re-run the sitemap generator script.
