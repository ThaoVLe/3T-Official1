import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]).notNull(),
  feeling: jsonb("feeling").$type<{ emoji: string; label: string } | null>().default(null),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => diaryEntries.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Update the schema to properly validate mediaUrls
export const insertEntrySchema = createInsertSchema(diaryEntries)
  .extend({
    mediaUrls: z.array(z.string()).default([]),
  })
  .omit({
    id: true,
    createdAt: true,
  });

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;