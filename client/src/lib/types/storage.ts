import type { DiaryEntry, Comment } from "@shared/schema";

export interface LocalDiaryEntry extends Omit<DiaryEntry, 'id'> {
  id?: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
}

export interface LocalComment extends Omit<Comment, 'id'> {
  id?: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
}

export interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastBackup: Date | null;
  googleDriveEnabled: boolean;
}
