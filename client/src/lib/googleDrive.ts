// Add type declarations for Google API
declare global {
  interface Window {
    gapi: any;
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (resp: any) => void;
          }): {
            requestAccessToken: (options: { prompt: string }) => void;
          };
        };
      };
    };
  }
}

import { auth } from './firebase';
import { LocalDiaryEntry } from './types/storage';

// Google Drive API configuration
const BACKUP_FOLDER_NAME = 'DiaryAppBackups';

interface BackupMetadata {
  timestamp: string;
  entryCount: number;
  version: string;
}

class GoogleDriveService {
  private async getAccessToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    return token;
  }

  async createBackup(entries: LocalDiaryEntry[]): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google Drive');
    }

    const timestamp = new Date().toISOString();
    const backupData = {
      metadata: {
        timestamp,
        entryCount: entries.length,
        version: '1.0',
      },
      entries,
    };

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backupData)
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  async listBackups(): Promise<{ id: string; name: string; timestamp: string }[]> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const response = await fetch('/api/backups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to list backups');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to list backups:', error);
      throw error;
    }
  }

  async restoreBackup(fileId: string): Promise<LocalDiaryEntry[]> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const response = await fetch(`/api/backup/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to restore backup');
      }

      const backupData = await response.json();
      return backupData.entries;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService();