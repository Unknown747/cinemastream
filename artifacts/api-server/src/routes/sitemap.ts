import { Router, type IRouter } from "express";
import { db, channelsTable } from "@workspace/db";
import { fetchChannelVideosCached } from "../lib/youtube";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function siteOrigin(req: { protocol: string; get: (h: string) => string | undefined }): string {
  const forwardedHost = req.get("x-forwarded-host");
  const forwardedProto = req.get("x-forwarded-proto");
  const host = forwardedHost ?? req.get("host") ?? "";
  const proto = forwardedProto ?? req.protocol ?? "https";
  return `${proto}://${host}`;
}

router.get("/sitemap-drama.xml", async (req, res) => {
  try {
    const origin = siteOrigin(req);
    const channels = await db.select().from(channelsTable);
    const allVideos = (
      await Promise.all(channels.map((c) => fetchChannelVideosCached(c.channelId)))
    ).flat();

    const urls: { loc: string; lastmod?: string }[] = [
      { loc: `${origin}/drama` },
    ];
    for (const v of allVideos) {
      urls.push({
        loc: `${origin}/drama/${v.videoId}`,
        lastmod: v.publishedAt,
      });
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (u) =>
            `  <url><loc>${escapeXml(u.loc)}</loc>${
              u.lastmod ? `<lastmod>${escapeXml(u.lastmod)}</lastmod>` : ""
            }</url>`,
        )
        .join("\n") +
      `\n</urlset>\n`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(xml);
  } catch (err) {
    logger.error({ err }, "sitemap failed");
    res.status(500).type("text/plain").send("sitemap error");
  }
});

export default router;
