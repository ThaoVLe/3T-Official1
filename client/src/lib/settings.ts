import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface Settings {
  theme: Theme;
  isLargeText: boolean;
  // Privacy settings
  isPublicSharingEnabled: boolean;
  // Methods
  setTheme: (theme: Theme) => void;
  setLargeText: (isLarge: boolean) => void;
  setPublicSharing: (enabled: boolean) => void;
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      theme: 'system',
      isLargeText: false,
      // Privacy defaults
      isPublicSharingEnabled: false,
      // Methods
      setTheme: (theme) => set({ theme }),
      setLargeText: (isLargeText) => set({ isLargeText }),
      setPublicSharing: (isPublicSharingEnabled) => set({ isPublicSharingEnabled }),
    }),
    {
      name: 'diary-settings',
    }
  )
);