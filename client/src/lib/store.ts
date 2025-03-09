import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  addEntry, 
  updateEntry, 
  deleteEntry, 
  getAllEntries,
  getBackupSettings,
  updateBackupSettings
} from './indexedDB';
import { googleDriveService } from './googleDrive';
import type { LocalDiaryEntry } from './indexedDB';

interface SyncState {
  lastSync: Date | null;
  isOnline: boolean;
  isSyncing: boolean;
  backupSettings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    lastBackup: Date | null;
    googleDriveEnabled: boolean;
  };
  pendingSync: number;
  // Actions
  initializeSync: () => Promise<void>;
  syncEntries: () => Promise<void>;
  updateBackupSettings: (settings: Partial<SyncState['backupSettings']>) => Promise<void>;
  checkBackupSchedule: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      lastSync: null,
      isOnline: navigator.onLine,
      isSyncing: false,
      backupSettings: {
        enabled: false,
        frequency: 'weekly',
        lastBackup: null,
        googleDriveEnabled: false,
      },
      pendingSync: 0,

      initializeSync: async () => {
        // Initialize backup settings from IndexedDB
        const settings = await getBackupSettings();
        set({ backupSettings: settings });

        // Set up online/offline listeners
        window.addEventListener('online', () => set({ isOnline: true }));
        window.addEventListener('offline', () => set({ isOnline: false }));

        // Initialize Google Drive if enabled
        if (settings.googleDriveEnabled) {
          try {
            await googleDriveService.initialize();
          } catch (error) {
            console.error('Failed to initialize Google Drive:', error);
          }
        }
      },

      syncEntries: async () => {
        const state = get();
        if (!state.isOnline || state.isSyncing) return;

        set({ isSyncing: true });
        try {
          const entries = await getAllEntries();
          const pendingEntries = entries.filter(e => e.syncStatus === 'pending');

          if (pendingEntries.length > 0 && state.backupSettings.googleDriveEnabled) {
            await googleDriveService.createBackup(entries);
          }

          set({ 
            lastSync: new Date(),
            pendingSync: 0,
            isSyncing: false
          });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ isSyncing: false });
        }
      },

      updateBackupSettings: async (newSettings) => {
        const currentSettings = get().backupSettings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        await updateBackupSettings(updatedSettings);
        set({ backupSettings: updatedSettings });

        // Initialize Google Drive if newly enabled
        if (newSettings.googleDriveEnabled && !currentSettings.googleDriveEnabled) {
          try {
            await googleDriveService.initialize();
          } catch (error) {
            console.error('Failed to initialize Google Drive:', error);
          }
        }
      },

      checkBackupSchedule: async () => {
        const state = get();
        const { backupSettings, isOnline } = state;
        
        if (!backupSettings.enabled || !isOnline) return;
        
        const now = new Date();
        const lastBackup = backupSettings.lastBackup ? new Date(backupSettings.lastBackup) : null;
        
        if (!lastBackup) {
          await state.syncEntries();
          return;
        }

        const daysSinceLastBackup = Math.floor(
          (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
        );

        const shouldBackup = 
          (backupSettings.frequency === 'daily' && daysSinceLastBackup >= 1) ||
          (backupSettings.frequency === 'weekly' && daysSinceLastBackup >= 7) ||
          (backupSettings.frequency === 'monthly' && daysSinceLastBackup >= 30);

        if (shouldBackup) {
          await state.syncEntries();
        }
      },
    }),
    {
      name: 'diary-sync-store',
      // Only persist specific fields
      partialize: (state) => ({
        lastSync: state.lastSync,
        backupSettings: state.backupSettings,
      }),
    }
  )
);

// Set up periodic backup check
setInterval(() => {
  useSyncStore.getState().checkBackupSchedule();
}, 1000 * 60 * 60); // Check every hour
