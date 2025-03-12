import { diaryEntries, users, type DiaryEntry, type InsertEntry, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Diary entry methods
  getAllEntriesByEmail(email: string): Promise<DiaryEntry[]>;
  getEntry(id: number): Promise<DiaryEntry | undefined>;
  createEntry(entry: InsertEntry): Promise<DiaryEntry>;
  updateEntry(id: number, entry: Partial<InsertEntry>): Promise<DiaryEntry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        email: user.email.toLowerCase()
      })
      .returning();
    return newUser;
  }

  async getAllEntriesByEmail(email: string): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userEmail, email.toLowerCase()))
      .orderBy(desc(diaryEntries.createdAt));
  }

  async getEntry(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.id, id));
    return entry;
  }

  async createEntry(entry: InsertEntry): Promise<DiaryEntry> {
    // Ensure we're handling both column naming styles
    const entryData = {
      ...entry,
      userEmail: entry.userEmail.toLowerCase() 
    };

    console.log("Creating entry with formatted data:", entryData);

    try {
      const [newEntry] = await db
        .insert(diaryEntries)
        .values(entryData)
        .returning();
      return newEntry;
    } catch (error) {
      console.error("Database error when creating entry:", error);
      throw error;
    }
  }

  async updateEntry(id: number, entry: Partial<InsertEntry>): Promise<DiaryEntry | undefined> {
    const [updated] = await db
      .update(diaryEntries)
      .set({
        ...entry,
        userEmail: entry.userEmail?.toLowerCase()
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