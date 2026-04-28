import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  channelsTable,
  videoOverridesTable,
  type VideoOverride as VideoOverrideRow,
} from "@workspace/db";
import { ListChannelVideosResponseItem } from "@workspace/api-zod";
import { fetchChannelVideosCached, type RssVideo } from "../lib/youtube";
import { cleanVideoDescription } from "../lib/clean-description";
import { logger } from "../lib/logger";
import {
  containsChinese,
  translateChineseToIndonesian,
  isTranslatorAvailable,
} from "../lib/translator";

const router: IRouter = Router();

const TRANSLATION_CONCURRENCY = 3;
const inFlightTranslations = new Set<string>();

function scheduleAutoTranslations(videos: RssVideo[]): void {
  if (!isTranslatorAvailable()) return;

  const todo = videos.filter(
    (v) => containsChinese(v.title) && !inFlightTranslations.has(v.videoId),
  );
  if (todo.length === 0) return;

  void (async () => {
    try {
      const overrides = await db.select().from(videoOverridesTable);
      const have = new Set(
        overrides.filter((o) => o.title?.trim()).map((o) => o.videoId),
      );
      const queue = todo.filter((v) => !have.has(v.videoId));
      for (const v of queue) inFlightTranslations.add(v.videoId);

      const workers = Array.from({ length: TRANSLATION_CONCURRENCY }, async () => {
        while (queue.length > 0) {
          const v = queue.shift();
          if (!v) break;
          try {
            const translation = await translateChineseToIndonesian(v.title);
            if (translation) {
              await db
                .insert(videoOverridesTable)
                .values({ videoId: v.videoId, title: translation })
                .onConflictDoUpdate({
                  target: videoOverridesTable.videoId,
                  set: { title: translation },
                });
            }
          } catch (err) {
            logger.warn(
              { err, videoId: v.videoId },
              "auto translation worker failed",
            );
          } finally {
            inFlightTranslations.delete(v.videoId);
          }
        }
      });
      await Promise.all(workers);
    } catch (err) {
      logger.warn({ err }, "scheduleAutoTranslations failed");
    }
  })();
}

async function buildVideos(rss: RssVideo[]): Promise<unknown[]> {
  if (rss.length === 0) return [];
  const overrides = await db.select().from(videoOverridesTable);
  const map = new Map<string, VideoOverrideRow>(
    overrides.map((o) => [o.videoId, o]),
  );

  // Fire-and-forget: translations populate over time without blocking the
  // current response. Subsequent requests will pick up new translations.
  scheduleAutoTranslations(rss);

  return rss.map((v) => {
    const o = map.get(v.videoId);
    const title = o?.title?.trim() || v.title;
    const cleanedRawDesc = cleanVideoDescription(v.description, v.channelName);
    const description = o?.description?.trim() || cleanedRawDesc;
    return ListChannelVideosResponseItem.parse({
      videoId: v.videoId,
      channelId: v.channelId,
      channelName: v.channelName,
      title,
      originalTitle: v.title,
      description,
      originalDescription: v.description,
      publishedAt: v.publishedAt,
      thumbnailUrl: v.thumbnailUrl,
      hasOverride: Boolean(o && (o.title || o.description)),
    });
  });
}

router.get("/channels/:id/videos", async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db
      .select()
      .from(channelsTable)
      .where(eq(channelsTable.id, id))
      .limit(1);
    if (rows.length === 0)
      return res.status(404).json({ error: "Channel not found" });
    const videos = await fetchChannelVideosCached(rows[0].channelId);
    const enriched = await buildVideos(videos);
    res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Failed to list channel videos");
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.get("/videos", async (_req, res) => {
  try {
    const channels = await db.select().from(channelsTable);
    const all: RssVideo[] = [];
    await Promise.all(
      channels.map(async (c) => {
        try {
          const v = await fetchChannelVideosCached(c.channelId);
          all.push(...v);
        } catch (err) {
          logger.warn({ err, channelId: c.channelId }, "Failed channel fetch");
        }
      }),
    );
    all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    res.json(await buildVideos(all));
  } catch (err) {
    logger.error({ err }, "Failed to list videos");
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
