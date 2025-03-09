import { DiaryEntry, Comment } from "@shared/schema";

// Database configuration
const DB_NAME = 'diaryApp';
const DB_VERSION = 1;

// Store names
const STORES = {
  entries: 'entries',
  comments: 'comments',
  settings: 'settings'
} as const;

// IndexedDB Schema and types
interface LocalDiaryEntry extends Omit<DiaryEntry, 'id'> {
  id?: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
}

interface LocalComment extends Omit<Comment, 'id'> {
  id?: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
}

interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastBackup: Date | null;
  googleDriveEnabled: boolean;
}

// Initialize the database
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create entries store
      if (!db.objectStoreNames.contains(STORES.entries)) {
        const entriesStore = db.createObjectStore(STORES.entries, { keyPath: 'id', autoIncrement: true });
        entriesStore.createIndex('syncStatus', 'syncStatus');
        entriesStore.createIndex('lastModified', 'lastModified');
      }

      // Create comments store
      if (!db.objectStoreNames.contains(STORES.comments)) {
        const commentsStore = db.createObjectStore(STORES.comments, { keyPath: 'id', autoIncrement: true });
        commentsStore.createIndex('entryId', 'entryId');
        commentsStore.createIndex('syncStatus', 'syncStatus');
        commentsStore.createIndex('lastModified', 'lastModified');
      }

      // Create settings store
      if (!db.objectStoreNames.contains(STORES.settings)) {
        const settingsStore = db.createObjectStore(STORES.settings, { keyPath: 'id' });
      }
    };
  });
}

// CRUD operations for entries
export async function addEntry(entry: Omit<LocalDiaryEntry, 'id'>): Promise<number> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);
    
    const request = store.add({
      ...entry,
      syncStatus: 'pending',
      lastModified: new Date()
    });

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getEntry(id: number): Promise<LocalDiaryEntry | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllEntries(): Promise<LocalDiaryEntry[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateEntry(id: number, entry: Partial<LocalDiaryEntry>): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const existingEntry = getRequest.result;
      if (!existingEntry) {
        reject(new Error('Entry not found'));
        return;
      }

      const updatedEntry = {
        ...existingEntry,
        ...entry,
        syncStatus: 'pending',
        lastModified: new Date()
      };

      const updateRequest = store.put(updatedEntry);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteEntry(id: number): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Settings operations
export async function getBackupSettings(): Promise<BackupSettings> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.settings], 'readonly');
    const store = transaction.objectStore(STORES.settings);
    const request = store.get('backupSettings');

    request.onsuccess = () => {
      resolve(request.result || {
        enabled: false,
        frequency: 'weekly',
        lastBackup: null,
        googleDriveEnabled: false
      });
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateBackupSettings(settings: BackupSettings): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.settings], 'readwrite');
    const store = transaction.objectStore(STORES.settings);
    const request = store.put({ id: 'backupSettings', ...settings });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
