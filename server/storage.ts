import { diaryEntries, comments, settings, type DiaryEntry, type InsertEntry, type Comment, type InsertComment, type Settings, type InsertSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllEntries(): Promise<DiaryEntry[]>;
  getEntry(id: number): Promise<DiaryEntry | undefined>;
  createEntry(entry: InsertEntry): Promise<DiaryEntry>;
  updateEntry(id: number, entry: InsertEntry): Promise<DiaryEntry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  updateSettings(userId: number, settings: Partial<InsertSettings>): Promise<Settings>;
  // Comment methods
  getComments(entryId: number): Promise<Comment[]>;
  addComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllEntries(): Promise<DiaryEntry[]> {
    return await db.select().from(diaryEntries).orderBy(desc(diaryEntries.createdAt));
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
        mediaUrls: entry.mediaUrls || [],
        feeling: entry.feeling,
        location: entry.location
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
        mediaUrls: entry.mediaUrls || [],
        feeling: entry.feeling,
        location: entry.location
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

  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [userSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userId));
    return userSettings;
  }

  async updateSettings(userId: number, settingsData: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = await this.getSettings(userId);

    if (existingSettings) {
      const [updated] = await db
        .update(settings)
        .set(settingsData)
        .where(eq(settings.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values({ ...settingsData, userId })
        .returning();
      return created;
    }
  }

  // Comment methods
  async getComments(entryId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.entryId, entryId))
      .orderBy(desc(comments.createdAt));
  }

  async addComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();