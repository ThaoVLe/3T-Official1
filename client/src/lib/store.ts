import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  addEntry, 
  updateEntry, 
  deleteEntry, 
  getAllEntries,
  getBackupSettings,
} from './indexedDB';

interface BackupState {
  lastBackup: Date | null;
  isOnline: boolean;
  backupSettings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    lastBackup: Date | null;
  };
  // Actions
  updateBackupSettings: (settings: Partial<BackupState['backupSettings']>) => Promise<void>;
  checkBackupSchedule: () => Promise<void>;
}

export const useBackupStore = create<BackupState>()(
  persist(
    (set, get) => ({
      lastBackup: null,
      isOnline: navigator.onLine,
      backupSettings: {
        enabled: false,
        frequency: 'weekly',
        lastBackup: null,
      },

      updateBackupSettings: async (newSettings) => {
        const currentSettings = get().backupSettings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        set({ backupSettings: updatedSettings });
      },
      checkBackupSchedule: async () => {
        const state = get();
        const { backupSettings } = state;

        if (!backupSettings.enabled) return;

        const now = new Date();
        const lastBackup = backupSettings.lastBackup ? new Date(backupSettings.lastBackup) : null;

        if (!lastBackup) {
          //This part is simplified, assuming no immediate backup on first run.
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
          // No syncEntries here,  local backup only.  A more sophisticated solution would require a separate local backup function.
          set({ lastBackup: now }); // Update lastBackup if a backup was hypothetically performed.
        }
      },
    }),
    {
      name: 'diary-backup-store',
      partialize: (state) => ({
        lastBackup: state.lastBackup,
        backupSettings: state.backupSettings,
      }),
    }
  )
);

// Set up periodic backup check
setInterval(() => {
  useBackupStore.getState().checkBackupSchedule();
}, 1000 * 60 * 60); // Check every hour