import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, channelsTable, articlesTable } from "@workspace/db";
import { fetchChannelVideosCached } from "../lib/youtube";
import { logger } from "../lib/logger";
import { filmPathForVideo } from "../lib/slug";

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

router.get("/sitemap-videos.xml", async (req, res) => {
  try {
    const origin = siteOrigin(req);
    const channels = await db.select().from(channelsTable);
    const allVideos = (
      await Promise.all(channels.map((c) => fetchChannelVideosCached(c.channelId)))
    ).flat();

    const items = allVideos
      .map((v) => {
        const pageUrl = `${origin}${filmPathForVideo(v.title, v.videoId)}`;
        const embedUrl = `https://www.youtube.com/embed/${v.videoId}`;
        const watchUrl = `https://www.youtube.com/watch?v=${v.videoId}`;
        const desc = (v.description ?? `Tonton ${v.title} di CinemaStream.`).slice(
          0,
          1900,
        );
        return [
          `  <url>`,
          `    <loc>${escapeXml(pageUrl)}</loc>`,
          `    <video:video>`,
          `      <video:thumbnail_loc>${escapeXml(v.thumbnailUrl)}</video:thumbnail_loc>`,
          `      <video:title>${escapeXml(v.title)}</video:title>`,
          `      <video:description>${escapeXml(desc)}</video:description>`,
          `      <video:player_loc allow_embed="yes" autoplay="ap=1">${escapeXml(embedUrl)}</video:player_loc>`,
          `      <video:content_loc>${escapeXml(watchUrl)}</video:content_loc>`,
          `      <video:publication_date>${escapeXml(v.publishedAt)}</video:publication_date>`,
          `      <video:family_friendly>yes</video:family_friendly>`,
          `      <video:live>no</video:live>`,
          `      <video:requires_subscription>no</video:requires_subscription>`,
          `      <video:platform relationship="allow">web mobile tv</video:platform>`,
          `    </video:video>`,
          `  </url>`,
        ].join("\n");
      })
      .join("\n");

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
      `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n` +
      items +
      `\n</urlset>\n`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=600");
    res.send(xml);
  } catch (err) {
    logger.error({ err }, "video sitemap failed");
    res.status(500).type("text/plain").send("video sitemap error");
  }
});

router.get("/sitemap-drama.xml", async (req, res) => {
  try {
    const origin = siteOrigin(req);
    const channels = await db.select().from(channelsTable);
    const allVideos = (
      await Promise.all(channels.map((c) => fetchChannelVideosCached(c.channelId)))
    ).flat();

    const articles = await db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.status, "published"))
      .orderBy(desc(articlesTable.publishedAt));

    const urls: { loc: string; lastmod?: string }[] = [
      { loc: `${origin}/drama` },
      { loc: `${origin}/blog` },
    ];
    for (const c of channels) {
      urls.push({ loc: `${origin}/channel/${c.channelId}` });
    }
    for (const v of allVideos) {
      urls.push({
        loc: `${origin}${filmPathForVideo(v.title, v.videoId)}`,
        lastmod: v.publishedAt,
      });
    }
    for (const a of articles) {
      urls.push({
        loc: `${origin}/blog/${a.slug}`,
        lastmod: (a.publishedAt ?? a.updatedAt).toISOString(),
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
