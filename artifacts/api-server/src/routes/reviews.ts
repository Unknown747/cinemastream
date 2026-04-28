import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, videoOverridesTable } from "@workspace/db";
import {
  generateIndonesianReview,
  isTranslatorAvailable,
  REVIEW_MODEL,
} from "../lib/translator";
import { logger } from "../lib/logger";
import { aiLimiter } from "../lib/rate-limit";
import { requireAdmin } from "../lib/admin-auth";

const router: IRouter = Router();

router.use("/videos/:videoId/review", aiLimiter);

type ReviewInput = {
  title?: string;
  channelName?: string;
  synopsis?: string;
};

function parseReviewInput(src: unknown): ReviewInput | null {
  if (!src || typeof src !== "object") return {};
  const out: ReviewInput = {};
  const obj = src as Record<string, unknown>;
  for (const key of ["title", "channelName", "synopsis"] as const) {
    const v = obj[key];
    if (v === undefined || v === null || v === "") continue;
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    if (!trimmed) continue;
    if (key === "title" && trimmed.length > 300) return null;
    if (key === "channelName" && trimmed.length > 200) return null;
    if (key === "synopsis" && trimmed.length > 2000) return null;
    out[key] = trimmed;
  }
  return out;
}

const inFlight = new Map<string, Promise<string | null>>();

/**
 * GET /api/videos/:videoId/review
 *
 * Lazy-generates and caches a long-form Indonesian review for a video.
 * Title/channelName/synopsis are sent as query params from the frontend
 * (which already has the data from the videos endpoint), avoiding a second
 * YouTube fetch on the server.
 *
 * Returns:
 *   200 { videoId, review, generatedAt, model }
 *   404 if review can't be generated and no cached version exists
 *   503 if AI is not configured
 */
router.get("/videos/:videoId/review", async (req, res) => {
  const { videoId } = req.params;
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(videoId)) {
    res.status(400).json({ error: "Invalid videoId" });
    return;
  }

  // 1) Check cache first.
  const existing = await db
    .select()
    .from(videoOverridesTable)
    .where(eq(videoOverridesTable.videoId, videoId))
    .limit(1);

  const cached = existing[0];
  if (cached?.review?.trim()) {
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.json({
      videoId,
      review: cached.review,
      generatedAt: cached.reviewGeneratedAt,
      model: cached.reviewModel ?? REVIEW_MODEL,
    });
    return;
  }

  // 2) Need to generate — check we have a title.
  const parsed = parseReviewInput(req.query);
  if (!parsed || !parsed.title) {
    res.status(400).json({
      error:
        "Review belum tersedia. Sertakan ?title=...&channelName=...&synopsis=... untuk generate.",
    });
    return;
  }

  if (!isTranslatorAvailable()) {
    res.status(503).json({
      error: "AI review tidak tersedia (AI integration belum di-setup).",
    });
    return;
  }

  // 3) Coalesce concurrent requests for same videoId.
  let promise = inFlight.get(videoId);
  if (!promise) {
    const { title, channelName, synopsis } = parsed;
    promise = (async () => {
      try {
        const review = await generateIndonesianReview(
          title,
          channelName ?? null,
          synopsis ?? null,
        );
        if (!review) return null;
        const now = new Date();
        await db
          .insert(videoOverridesTable)
          .values({
            videoId,
            review,
            reviewModel: REVIEW_MODEL,
            reviewGeneratedAt: now,
          })
          .onConflictDoUpdate({
            target: videoOverridesTable.videoId,
            set: {
              review,
              reviewModel: REVIEW_MODEL,
              reviewGeneratedAt: now,
            },
          });
        return review;
      } catch (err) {
        logger.error({ err, videoId }, "review generation failed");
        return null;
      } finally {
        inFlight.delete(videoId);
      }
    })();
    inFlight.set(videoId, promise);
  }

  const review = await promise;
  if (!review) {
    res.status(502).json({
      error: "AI tidak mengembalikan review yang valid. Coba lagi nanti.",
    });
    return;
  }

  res.setHeader("Cache-Control", "public, max-age=86400");
  res.json({
    videoId,
    review,
    generatedAt: new Date(),
    model: REVIEW_MODEL,
  });
});

/**
 * POST /api/admin/videos/:videoId/review/regenerate
 * Admin-only: force regeneration even if cached.
 */
router.post(
  "/admin/videos/:videoId/review/regenerate",
  requireAdmin,
  async (req, res) => {
    const { videoId } = req.params;
    const parsed = parseReviewInput(req.body);
    if (!parsed || !parsed.title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    if (!isTranslatorAvailable()) {
      res.status(503).json({ error: "AI not configured" });
      return;
    }
    const { title, channelName, synopsis } = parsed;
    const review = await generateIndonesianReview(
      title,
      channelName ?? null,
      synopsis ?? null,
    );
    if (!review) {
      res.status(502).json({ error: "AI returned no review" });
      return;
    }
    const now = new Date();
    await db
      .insert(videoOverridesTable)
      .values({
        videoId,
        review,
        reviewModel: REVIEW_MODEL,
        reviewGeneratedAt: now,
      })
      .onConflictDoUpdate({
        target: videoOverridesTable.videoId,
        set: {
          review,
          reviewModel: REVIEW_MODEL,
          reviewGeneratedAt: now,
        },
      });
    res.json({ videoId, review, generatedAt: now, model: REVIEW_MODEL });
  },
);

export default router;
