import { diaryEntries, users, type DiaryEntry, type InsertEntry, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lt } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Diary entry methods
  getAllEntriesByEmail(email: string, filters: any): Promise<DiaryEntry[]>;
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

  async getAllEntriesByEmail(email: string, filters: any = {}): Promise<DiaryEntry[]> {
    try {
      let query = and(eq(diaryEntries.userEmail, email.toLowerCase()));

      // Add filters if they exist
      if (filters.feeling) {
        query = and(query, like(diaryEntries.feeling, `%${filters.feeling}%`));
      }

      if (filters.location) {
        query = and(query, like(diaryEntries.location, `%${filters.location}%`));
      }

      if (filters.tags) {
        query = and(query, like(diaryEntries.tags, `%${filters.tags}%`));
      }

      if (filters.startDate) {
        query = and(query, gte(diaryEntries.createdAt, new Date(filters.startDate)));
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1); // Include the end date fully
        query = and(query, lt(diaryEntries.createdAt, endDate));
      }

      const entries = await db
        .select()
        .from(diaryEntries)
        .where(query)
        .orderBy(desc(diaryEntries.createdAt));

      return entries;
    } catch (error) {
      console.error('Error getting entries by email:', error);
      throw error;
    }
  }

  async getEntry(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.id, id));
    return entry;
  }

  async createEntry(entry: InsertEntry): Promise<DiaryEntry> {
    console.log("Creating entry with data:", entry);
    // Ensure userEmail is stored
    if (!entry.userEmail) {
      throw new Error("User email is required");
    }

    const entryToInsert = {
      ...entry,
      userEmail: entry.userEmail.toLowerCase(), //Added to maintain consistency with other functions
      date: entry.date || new Date().toISOString(),
    };

    console.log("Creating entry with formatted data:", entryToInsert);

    try {
      const [newEntry] = await db
        .insert(diaryEntries)
        .values(entryToInsert)
        .returning();
      console.log("Entry created:", newEntry);
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