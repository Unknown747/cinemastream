import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const moviesPath = resolve(__dirname, "..", "src", "data", "movies.ts");
const sitemapPath = resolve(__dirname, "..", "public", "sitemap.xml");

const src = readFileSync(moviesPath, "utf8");
const ids = [...src.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
const genres = [
  "action", "adventure", "animation", "comedy", "crime", "drama",
  "history", "horror", "music", "romance", "sci-fi", "thriller",
];

const today = new Date().toISOString().slice(0, 10);
const base = "https://cinemastream.app";

const urls = [
  `${base}/`,
  `${base}/browse`,
  `${base}/drama`,
  `${base}/about`,
  ...genres.map((g) => `${base}/genre/${g}`),
  ...ids.map((id) => `${base}/movie/${id}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;

writeFileSync(sitemapPath, xml);
console.log(`Wrote sitemap with ${urls.length} URLs to ${sitemapPath}`);
