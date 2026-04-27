import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, videoOverridesTable } from "@workspace/db";
import { UpsertVideoOverrideBody, UpsertVideoOverrideResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.put("/overrides/:videoId", async (req, res) => {
  const { videoId } = req.params;
  const parsed = UpsertVideoOverrideBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }
  const title = parsed.data.title?.trim() || null;
  const description = parsed.data.description?.trim() || null;
  const now = new Date();
  const inserted = await db
    .insert(videoOverridesTable)
    .values({ videoId, title, description, updatedAt: now })
    .onConflictDoUpdate({
      target: videoOverridesTable.videoId,
      set: { title, description, updatedAt: now },
    })
    .returning();
  res.json(
    UpsertVideoOverrideResponse.parse({
      videoId: inserted[0].videoId,
      title: inserted[0].title,
      description: inserted[0].description,
      updatedAt: inserted[0].updatedAt,
    }),
  );
});

router.delete("/overrides/:videoId", async (req, res) => {
  const { videoId } = req.params;
  await db.delete(videoOverridesTable).where(eq(videoOverridesTable.videoId, videoId));
  res.status(204).end();
});

export default router;
