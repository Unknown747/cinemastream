import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videoOverridesTable = pgTable("video_overrides", {
  videoId: text("video_id").primaryKey(),
  title: text("title"),
  description: text("description"),
  review: text("review"),
  reviewModel: text("review_model"),
  reviewGeneratedAt: timestamp("review_generated_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const upsertVideoOverrideSchema = createInsertSchema(videoOverridesTable).omit({
  updatedAt: true,
});
export type UpsertVideoOverride = z.infer<typeof upsertVideoOverrideSchema>;
export type VideoOverride = typeof videoOverridesTable.$inferSelect;
