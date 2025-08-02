import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  showNSFW: boolean;
  setShowNSFW: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showNSFW: false,
      setShowNSFW: (show) => set({ showNSFW: show }),
    }),
    { name: 'settings' },
  ),
);
