import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface Settings {
  theme: Theme;
  isLargeText: boolean;
  // Privacy settings
  isPublicSharingEnabled: boolean;
  isPasswordProtectionEnabled: boolean;
  autoLockTimeout: number; // in minutes, 0 means disabled
  // Methods
  setTheme: (theme: Theme) => void;
  setLargeText: (isLarge: boolean) => void;
  setPublicSharing: (enabled: boolean) => void;
  setPasswordProtection: (enabled: boolean) => void;
  setAutoLockTimeout: (minutes: number) => void;
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      theme: 'system',
      isLargeText: false,
      // Privacy defaults
      isPublicSharingEnabled: false,
      isPasswordProtectionEnabled: false,
      autoLockTimeout: 0,
      // Methods
      setTheme: (theme) => set({ theme }),
      setLargeText: (isLargeText) => set({ isLargeText }),
      setPublicSharing: (isPublicSharingEnabled) => set({ isPublicSharingEnabled }),
      setPasswordProtection: (isPasswordProtectionEnabled) => set({ isPasswordProtectionEnabled }),
      setAutoLockTimeout: (autoLockTimeout) => set({ autoLockTimeout }),
    }),
    {
      name: 'diary-settings',
    }
  )
);