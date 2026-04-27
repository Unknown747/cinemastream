import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, channelsTable, articlesTable } from "@workspace/db";
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

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function siteOrigin(req: {
  protocol: string;
  get: (h: string) => string | undefined;
}): string {
  const forwardedHost = req.get("x-forwarded-host");
  const forwardedProto = req.get("x-forwarded-proto");
  const host = forwardedHost ?? req.get("host") ?? "";
  const proto = forwardedProto ?? req.protocol ?? "https";
  return `${proto}://${host}`;
}

router.get("/feed.xml", async (req, res) => {
  try {
    const origin = siteOrigin(req);
    const channels = await db.select().from(channelsTable);
    const allVideos = (
      await Promise.all(
        channels.map((c) => fetchChannelVideosCached(c.channelId)),
      )
    ).flat();

    const articles = await db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.status, "published"))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(20);

    type Item = {
      title: string;
      link: string;
      pubDate: string;
      guid: string;
      description: string;
      category: string;
    };

    const videoItems: Item[] = allVideos.slice(0, 30).map((v) => ({
      title: v.title,
      link: `${origin}/drama/${v.videoId}`,
      pubDate: new Date(v.publishedAt).toUTCString(),
      guid: `${origin}/drama/${v.videoId}`,
      description: `${v.channelName} — ${v.description.slice(0, 280)}`,
      category: "Drama",
    }));

    const articleItems: Item[] = articles.map((a) => ({
      title: a.title,
      link: `${origin}/blog/${a.slug}`,
      pubDate: new Date(a.publishedAt ?? a.createdAt).toUTCString(),
      guid: `${origin}/blog/${a.slug}`,
      description: a.excerpt,
      category: "Artikel",
    }));

    const items = [...videoItems, ...articleItems]
      .sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      )
      .slice(0, 50);

    const lastBuild = items[0]?.pubDate ?? new Date().toUTCString();

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
      `<channel>\n` +
      `  <title>CinemaStream — Drama China Sub Indo</title>\n` +
      `  <link>${escapeXml(origin)}/</link>\n` +
      `  <description>Drama China dan mini series Mandarin terbaru dengan judul Bahasa Indonesia.</description>\n` +
      `  <language>id-ID</language>\n` +
      `  <lastBuildDate>${lastBuild}</lastBuildDate>\n` +
      `  <atom:link href="${escapeXml(origin)}/api/feed.xml" rel="self" type="application/rss+xml"/>\n` +
      items
        .map(
          (it) =>
            `  <item>\n` +
            `    <title>${cdata(it.title)}</title>\n` +
            `    <link>${escapeXml(it.link)}</link>\n` +
            `    <guid isPermaLink="true">${escapeXml(it.guid)}</guid>\n` +
            `    <pubDate>${it.pubDate}</pubDate>\n` +
            `    <category>${escapeXml(it.category)}</category>\n` +
            `    <description>${cdata(it.description)}</description>\n` +
            `  </item>`,
        )
        .join("\n") +
      `\n</channel>\n</rss>\n`;

    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(xml);
  } catch (err) {
    logger.error({ err }, "feed failed");
    res.status(500).type("text/plain").send("feed error");
  }
});

export default router;
