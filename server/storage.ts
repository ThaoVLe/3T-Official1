import { diaryEntries, type DiaryEntry, type InsertEntry } from "@shared/schema";

export interface IStorage {
  getAllEntries(): Promise<DiaryEntry[]>;
  getEntry(id: number): Promise<DiaryEntry | undefined>;
  createEntry(entry: InsertEntry): Promise<DiaryEntry>;
  updateEntry(id: number, entry: InsertEntry): Promise<DiaryEntry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, DiaryEntry>;
  private currentId: number;

  constructor() {
    this.entries = new Map();
    this.currentId = 1;
  }

  async getAllEntries(): Promise<DiaryEntry[]> {
    return Array.from(this.entries.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEntry(id: number): Promise<DiaryEntry | undefined> {
    return this.entries.get(id);
  }

  async createEntry(entry: InsertEntry): Promise<DiaryEntry> {
    const id = this.currentId++;
    const newEntry: DiaryEntry = {
      ...entry,
      id,
      mediaUrls: entry.mediaUrls || [],
      createdAt: new Date(),
    };
    this.entries.set(id, newEntry);
    return newEntry;
  }

  async updateEntry(id: number, entry: InsertEntry): Promise<DiaryEntry | undefined> {
    const existing = this.entries.get(id);
    if (!existing) return undefined;

    const updated: DiaryEntry = {
      ...existing,
      title: entry.title,
      content: entry.content,
      mediaUrls: entry.mediaUrls || existing.mediaUrls,
    };
    this.entries.set(id, updated);
    return updated;
  }

  async deleteEntry(id: number): Promise<boolean> {
    return this.entries.delete(id);
  }
}

export const storage = new MemStorage();