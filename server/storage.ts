import { diaryEntries, comments, type DiaryEntry, type InsertEntry, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllEntries(): Promise<DiaryEntry[]>;
  getEntry(id: number): Promise<DiaryEntry | undefined>;
  createEntry(entry: InsertEntry): Promise<DiaryEntry>;
  updateEntry(id: number, entry: InsertEntry): Promise<DiaryEntry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
  // New comment methods
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
    // Ensure mediaUrls is always an array
    const mediaUrls = Array.isArray(entry.mediaUrls) ? entry.mediaUrls : [];
    
    console.log("Creating entry with mediaUrls:", mediaUrls);
    
    const [newEntry] = await db
      .insert(diaryEntries)
      .values({
        title: entry.title,
        content: entry.content,
        mediaUrls: mediaUrls,
        feeling: entry.feeling,
        location: entry.location
      })
      .returning();
      
    console.log("Created entry:", newEntry);
    return newEntry;
  }

  async updateEntry(id: number, entry: InsertEntry): Promise<DiaryEntry | undefined> {
    // Ensure mediaUrls is always an array
    const mediaUrls = Array.isArray(entry.mediaUrls) ? entry.mediaUrls : [];
    
    console.log(`Updating entry ${id} with mediaUrls:`, mediaUrls);
    
    const [updated] = await db
      .update(diaryEntries)
      .set({
        title: entry.title,
        content: entry.content,
        mediaUrls: mediaUrls,
        feeling: entry.feeling,
        location: entry.location
      })
      .where(eq(diaryEntries.id, id))
      .returning();
      
    console.log("Updated entry:", updated);
    return updated;
  }

  async deleteEntry(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(diaryEntries)
      .where(eq(diaryEntries.id, id))
      .returning();
    return !!deleted;
  }

  // New comment methods
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