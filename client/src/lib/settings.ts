import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  isCompactMode: boolean;
  isLargeText: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
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
