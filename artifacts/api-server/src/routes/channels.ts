import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, channelsTable } from "@workspace/db";
import { AddChannelBody, ListChannelsResponseItem } from "@workspace/api-zod";
import { resolveChannel, invalidateVideoCache } from "../lib/youtube";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/channels", async (_req, res) => {
  const rows = await db.select().from(channelsTable).orderBy(channelsTable.createdAt);
  const data = rows.map((r) =>
    ListChannelsResponseItem.parse({
      id: r.id,
      channelId: r.channelId,
      handle: r.handle,
      name: r.name,
      thumbnailUrl: r.thumbnailUrl,
    }),
  );
  res.json(data);
});

router.post("/channels", async (req, res) => {
  const parsed = AddChannelBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }
  try {
    const info = await resolveChannel(parsed.data.handle);
    // upsert by channelId
    const existing = await db
      .select()
      .from(channelsTable)
      .where(eq(channelsTable.channelId, info.channelId))
      .limit(1);
    let row;
    if (existing.length > 0) {
      row = existing[0];
    } else {
      const inserted = await db
        .insert(channelsTable)
        .values({
          channelId: info.channelId,
          handle: info.handle,
          name: info.name,
          thumbnailUrl: info.thumbnailUrl ?? null,
        })
        .returning();
      row = inserted[0];
    }
    res.status(201).json(
      ListChannelsResponseItem.parse({
        id: row.id,
        channelId: row.channelId,
        handle: row.handle,
        name: row.name,
        thumbnailUrl: row.thumbnailUrl,
      }),
    );
  } catch (err) {
    logger.error({ err }, "Failed to add channel");
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.delete("/channels/:id", async (req, res) => {
  const { id } = req.params;
  const deleted = await db
    .delete(channelsTable)
    .where(eq(channelsTable.id, id))
    .returning();
  if (deleted.length > 0) invalidateVideoCache(deleted[0].channelId);
  res.status(204).end();
});

export default router;
