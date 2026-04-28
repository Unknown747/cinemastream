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

const MAX_AUTO_TRANSLATIONS_PER_REQUEST = 8;

async function autoTranslateAndPersist(
  videos: RssVideo[],
  existing: Map<string, VideoOverrideRow>,
): Promise<Map<string, VideoOverrideRow>> {
  if (!isTranslatorAvailable()) return existing;

  const targets = videos.filter((v) => {
    const o = existing.get(v.videoId);
    if (o?.title?.trim()) return false;
    return containsChinese(v.title);
  });

  if (targets.length === 0) return existing;

  const slice = targets.slice(0, MAX_AUTO_TRANSLATIONS_PER_REQUEST);

  const results = await Promise.all(
    slice.map(async (v) => {
      const translation = await translateChineseToIndonesian(v.title);
      if (!translation) return null;
      const existingDesc = existing.get(v.videoId)?.description ?? null;
      try {
        const inserted = await db
          .insert(videoOverridesTable)
          .values({
            videoId: v.videoId,
            title: translation,
            description: existingDesc,
          })
          .onConflictDoUpdate({
            target: videoOverridesTable.videoId,
            set: { title: translation },
          })
          .returning();
        return inserted[0] ?? null;
      } catch (err) {
        logger.warn(
          { err, videoId: v.videoId },
          "failed to persist auto translation",
        );
        return null;
      }
    }),
  );

  const next = new Map(existing);
  for (const row of results) {
    if (row) next.set(row.videoId, row);
  }
  return next;
}

async function buildVideos(rss: RssVideo[]): Promise<unknown[]> {
  if (rss.length === 0) return [];
  const overrides = await db.select().from(videoOverridesTable);
  let map = new Map<string, VideoOverrideRow>(
    overrides.map((o) => [o.videoId, o]),
  );

  map = await autoTranslateAndPersist(rss, map);

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
