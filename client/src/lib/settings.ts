import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface Settings {
  theme: Theme;
  isCompactMode: boolean;
  isLargeText: boolean;
  setTheme: (theme: Theme) => void;
  setCompactMode: (isCompact: boolean) => void;
  setLargeText: (isLarge: boolean) => void;
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      theme: 'system',
      isCompactMode: false,
      isLargeText: false,
      setTheme: (theme) => set({ theme }),
      setCompactMode: (isCompactMode) => set({ isCompactMode }),
      setLargeText: (isLargeText) => set({ isLargeText }),
    }),
    {
      name: 'diary-settings',
    }
  )
);