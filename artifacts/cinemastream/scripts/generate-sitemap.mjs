import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = resolve(__dirname, "..", "public", "sitemap.xml");

const today = new Date().toISOString().slice(0, 10);
const base = process.env.SITE_URL || "https://cinemastream.app";

// Drama-focused static URLs only. Per-episode URLs are served dynamically by
// the API at /api/sitemap-drama.xml because they change as channels upload.
const urls = [
  { loc: `${base}/`, changefreq: "daily", priority: "1.0" },
  { loc: `${base}/drama`, changefreq: "hourly", priority: "0.9" },
  { loc: `${base}/about`, changefreq: "monthly", priority: "0.5" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(sitemapPath, xml);
console.log(`Wrote sitemap with ${urls.length} URLs to ${sitemapPath}`);
