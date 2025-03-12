import { diaryEntries, comments, type DiaryEntry, type InsertEntry, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllEntries(userId: string): Promise<DiaryEntry[]>;
  getEntry(id: number, userId: string): Promise<DiaryEntry | undefined>;
  createEntry(entry: InsertEntry): Promise<DiaryEntry>;
  updateEntry(id: number, entry: InsertEntry, userId: string): Promise<DiaryEntry | undefined>;
  deleteEntry(id: number, userId: string): Promise<boolean>;
  // Comment methods
  getComments(entryId: number): Promise<Comment[]>;
  addComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllEntries(userId?: string): Promise<DiaryEntry[]> {
    // If userId is provided, filter by it, otherwise return all entries
    const query = db
      .select()
      .from(diaryEntries)
      .orderBy(desc(diaryEntries.createdAt));
    
    if (userId) {
      return await query.where(eq(diaryEntries.userId, userId));
    }
    
    return await query;
  }

  async getEntry(id: number, userId: string): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.id, id))
      .where(eq(diaryEntries.userId, userId));
    return entry;
  }

  async createEntry(entry: InsertEntry): Promise<DiaryEntry> {
    const [newEntry] = await db
      .insert(diaryEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async updateEntry(id: number, entry: InsertEntry, userId: string): Promise<DiaryEntry | undefined> {
    const [updated] = await db
      .update(diaryEntries)
      .set(entry)
      .where(eq(diaryEntries.id, id))
      .where(eq(diaryEntries.userId, userId))
      .returning();
    return updated;
  }

  async deleteEntry(id: number, userId: string): Promise<boolean> {
    const [deleted] = await db
      .delete(diaryEntries)
      .where(eq(diaryEntries.id, id))
      .where(eq(diaryEntries.userId, userId))
      .returning();
    return !!deleted;
  }

  // Comment methods remain unchanged
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