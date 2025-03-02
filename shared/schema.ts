import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEntrySchema = createInsertSchema(diaryEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
