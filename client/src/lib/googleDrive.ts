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

import { LocalDiaryEntry } from './types/storage';

// Google Drive API configuration
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FOLDER_NAME = 'DiaryAppBackups';

interface BackupMetadata {
  timestamp: string;
  entryCount: number;
  version: string;
}

class GoogleDriveService {
  private gapiInited = false;
  private gisInited = false;
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;

  async initialize() {
    // Load the Google API client library
    if (!window.gapi) {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    // Load the Google Identity Services library
    if (!window.google?.accounts?.oauth2) {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    await new Promise<void>((resolve) => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: process.env.VITE_GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        this.gapiInited = true;
        resolve();
      });
    });

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: process.env.VITE_GOOGLE_CLIENT_ID!,
      scope: SCOPE,
      callback: '', // defined later
    });

    this.gisInited = true;
  }

  async authorize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }

      this.tokenClient.callback = async (resp) => {
        if (resp.error) {
          reject(resp);
        }
        resolve();
      };

      if (window.gapi.client.getToken() === null) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  private async ensureBackupFolder(): Promise<string> {
    const response = await window.gapi.client.drive.files.list({
      q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    const folderMetadata = {
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await window.gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });

    return folder.result.id;
  }

  async createBackup(entries: LocalDiaryEntry[]): Promise<void> {
    if (!this.gapiInited || !this.gisInited) {
      throw new Error('Google API not initialized');
    }

    const folderId = await this.ensureBackupFolder();
    const timestamp = new Date().toISOString();
    const backupData = {
      metadata: {
        timestamp,
        entryCount: entries.length,
        version: '1.0',
      },
      entries,
    };

    const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
    const file = new File([blob], `diary_backup_${timestamp}.json`, { type: 'application/json' });

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    await window.gapi.client.drive.files.create({
      resource: metadata,
      media: {
        mimeType: file.type,
        body: blob,
      },
      fields: 'id',
    });
  }

  async listBackups(): Promise<{ id: string; name: string; timestamp: string }[]> {
    const folderId = await this.ensureBackupFolder();
    const response = await window.gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
    });

    return response.result.files || [];
  }

  async restoreBackup(fileId: string): Promise<LocalDiaryEntry[]> {
    const response = await window.gapi.client.drive.files.get({
      fileId,
      alt: 'media',
    });

    const backupData = response.result;
    return backupData.entries;
  }
}

export const googleDriveService = new GoogleDriveService();