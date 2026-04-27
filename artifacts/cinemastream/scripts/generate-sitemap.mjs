import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = resolve(__dirname, "..", "public", "sitemap.xml");

const today = new Date().toISOString().slice(0, 10);
const base = process.env.SITE_URL || "https://cinemastream.app";

// Static URLs only. Per-channel and per-episode URLs are served dynamically
// by the API at /api/sitemap-drama.xml because they change as channels add
// content.
const urls = [
  { loc: `${base}/`, changefreq: "daily", priority: "1.0" },
  { loc: `${base}/drama`, changefreq: "hourly", priority: "0.9" },
  { loc: `${base}/blog`, changefreq: "daily", priority: "0.8" },
  { loc: `${base}/about`, changefreq: "monthly", priority: "0.6" },
  { loc: `${base}/contact`, changefreq: "monthly", priority: "0.4" },
  { loc: `${base}/privacy`, changefreq: "yearly", priority: "0.3" },
  { loc: `${base}/terms`, changefreq: "yearly", priority: "0.3" },
  { loc: `${base}/dmca`, changefreq: "yearly", priority: "0.3" },
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
