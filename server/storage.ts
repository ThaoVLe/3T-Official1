import { diaryEntries, type DiaryEntry, type InsertEntry } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllEntries(): Promise<DiaryEntry[]>;
  getEntry(id: number): Promise<DiaryEntry | undefined>;
  createEntry(entry: InsertEntry): Promise<DiaryEntry>;
  updateEntry(id: number, entry: InsertEntry): Promise<DiaryEntry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllEntries(): Promise<DiaryEntry[]> {
    return await db.select().from(diaryEntries).orderBy(diaryEntries.createdAt);
  }

  async getEntry(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.id, id));
    return entry;
  }

  async createEntry(entry: InsertEntry): Promise<DiaryEntry> {
    const [newEntry] = await db
      .insert(diaryEntries)
      .values({
        title: entry.title,
        content: entry.content,
        mediaUrls: entry.mediaUrls || []
      })
      .returning();
    return newEntry;
  }

  async updateEntry(id: number, entry: InsertEntry): Promise<DiaryEntry | undefined> {
    const [updated] = await db
      .update(diaryEntries)
      .set({
        title: entry.title,
        content: entry.content,
        mediaUrls: entry.mediaUrls || []
      })
      .where(eq(diaryEntries.id, id))
      .returning();
    return updated;
  }

  async deleteEntry(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(diaryEntries)
      .where(eq(diaryEntries.id, id))
      .returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();