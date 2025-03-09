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
export interface LocalDiaryEntry extends Omit<DiaryEntry, 'id'> {
  id?: number;
  lastModified: Date;
}

interface LocalComment extends Omit<Comment, 'id'> {
  id?: number;
  lastModified: Date;
}

interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastBackup: Date | null;
}

// Initialize the database
export async function initDB(): Promise<IDBDatabase> {
  console.log('Initializing IndexedDB...');
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to initialize IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('IndexedDB initialized successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('Upgrading IndexedDB schema...');
      const db = (event.target as IDBOpenDBRequest).result;

      // Create entries store
      if (!db.objectStoreNames.contains(STORES.entries)) {
        const entriesStore = db.createObjectStore(STORES.entries, { keyPath: 'id', autoIncrement: true });
        entriesStore.createIndex('lastModified', 'lastModified');
        console.log('Created entries store');
      }

      // Create comments store
      if (!db.objectStoreNames.contains(STORES.comments)) {
        const commentsStore = db.createObjectStore(STORES.comments, { keyPath: 'id', autoIncrement: true });
        commentsStore.createIndex('entryId', 'entryId');
        commentsStore.createIndex('lastModified', 'lastModified');
        console.log('Created comments store');
      }

      // Create settings store
      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: 'id' });
        console.log('Created settings store');
      }
    };
  });
}

// CRUD operations for entries
export async function addEntry(entry: Omit<LocalDiaryEntry, 'id'>): Promise<number> {
  console.log('Adding new entry to IndexedDB:', entry);
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);

    const request = store.add({
      ...entry,
      lastModified: new Date()
    });

    request.onsuccess = () => {
      const id = request.result as number;
      console.log('Successfully added entry with ID:', id);
      resolve(id);
    };
    request.onerror = () => {
      console.error('Failed to add entry:', request.error);
      reject(request.error);
    };
  });
}

export async function getEntry(id: number): Promise<LocalDiaryEntry | undefined> {
  console.log('Fetching entry with ID:', id);
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const request = store.get(id);

    request.onsuccess = () => {
      console.log('Successfully fetched entry:', request.result);
      resolve(request.result);
    };
    request.onerror = () => {
      console.error('Failed to fetch entry:', request.error);
      reject(request.error);
    };
  });
}

export async function getAllEntries(): Promise<LocalDiaryEntry[]> {
  console.log('Fetching all entries from IndexedDB');
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const request = store.getAll();

    request.onsuccess = () => {
      console.log('Successfully fetched all entries:', request.result.length, 'entries found');
      resolve(request.result);
    };
    request.onerror = () => {
      console.error('Failed to fetch entries:', request.error);
      reject(request.error);
    };
  });
}

export async function updateEntry(id: number, entry: Partial<LocalDiaryEntry>): Promise<void> {
  console.log('Updating entry with ID:', id, 'New data:', entry);
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);

    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const existingEntry = getRequest.result;
      if (!existingEntry) {
        const error = new Error('Entry not found');
        console.error(error);
        reject(error);
        return;
      }

      const updatedEntry = {
        ...existingEntry,
        ...entry,
        lastModified: new Date()
      };

      const updateRequest = store.put(updatedEntry);
      updateRequest.onsuccess = () => {
        console.log('Successfully updated entry');
        resolve();
      };
      updateRequest.onerror = () => {
        console.error('Failed to update entry:', updateRequest.error);
        reject(updateRequest.error);
      };
    };
    getRequest.onerror = () => {
      console.error('Failed to fetch entry for update:', getRequest.error);
      reject(getRequest.error);
    };
  });
}

export async function deleteEntry(id: number): Promise<void> {
  console.log('Deleting entry with ID:', id);
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('Successfully deleted entry');
      resolve();
    };
    request.onerror = () => {
      console.error('Failed to delete entry:', request.error);
      reject(request.error);
    };
  });
}

// Settings operations
export async function getBackupSettings(): Promise<BackupSettings> {
  console.log('Fetching backup settings');
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.settings], 'readonly');
    const store = transaction.objectStore(STORES.settings);
    const request = store.get('backupSettings');

    request.onsuccess = () => {
      const defaultSettings = {
        enabled: false,
        frequency: 'weekly' as const,
        lastBackup: null
      };
      console.log('Successfully fetched backup settings:', request.result || defaultSettings);
      resolve(request.result || defaultSettings);
    };
    request.onerror = () => {
      console.error('Failed to fetch backup settings:', request.error);
      reject(request.error);
    };
  });
}

// Debug utilities
export async function getDatabaseStats(): Promise<{
  entriesCount: number;
  lastModifiedEntry: Date | null;
}> {
  const entries = await getAllEntries();
  return {
    entriesCount: entries.length,
    lastModifiedEntry: entries.length > 0 
      ? new Date(Math.max(...entries.map(e => e.lastModified.getTime())))
      : null
  };
}