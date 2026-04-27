import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, articlesTable } from "@workspace/db";
import {
  CreateArticleBody,
  UpdateArticleBody,
  GetArticleResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function serialize(row: typeof articlesTable.$inferSelect) {
  return GetArticleResponse.parse({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage,
    channelId: row.channelId,
    status: row.status,
    author: row.author,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

router.get("/articles", async (req, res) => {
  const includeDrafts = req.query.includeDrafts === "true";
  const rows = await db
    .select()
    .from(articlesTable)
    .orderBy(desc(articlesTable.publishedAt), desc(articlesTable.createdAt));
  const filtered = includeDrafts
    ? rows
    : rows.filter((r) => r.status === "published");
  res.json(filtered.map(serialize));
});

router.get("/articles/:slug", async (req, res) => {
  const { slug } = req.params;
  const rows = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, slug))
    .limit(1);
  if (rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(serialize(rows[0]));
});

router.post("/articles", async (req, res) => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }
  try {
    const data = parsed.data;
    const inserted = await db
      .insert(articlesTable)
      .values({
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage ?? null,
        channelId: data.channelId ?? null,
        status: data.status,
        author: data.author ?? "Tim CinemaStream",
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning();
    res.status(201).json(serialize(inserted[0]));
  } catch (err) {
    logger.error({ err }, "create article failed");
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.put("/articles/:id/by-id", async (req, res) => {
  const { id } = req.params;
  const parsed = UpdateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }
  try {
    const existing = await db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.id, id))
      .limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    const data = parsed.data;
    const becamePublished =
      existing[0].status !== "published" && data.status === "published";
    const updated = await db
      .update(articlesTable)
      .set({
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage ?? null,
        channelId: data.channelId ?? null,
        status: data.status,
        author: data.author ?? existing[0].author,
        publishedAt: becamePublished
          ? new Date()
          : data.status === "draft"
            ? null
            : existing[0].publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(articlesTable.id, id))
      .returning();
    res.json(serialize(updated[0]));
  } catch (err) {
    logger.error({ err }, "update article failed");
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

router.delete("/articles/:id/by-id", async (req, res) => {
  const { id } = req.params;
  await db.delete(articlesTable).where(eq(articlesTable.id, id));
  res.status(204).end();
});

export default router;
