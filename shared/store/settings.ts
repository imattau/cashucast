import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultEndpoints } from '../config';

interface SettingsState {
  showNSFW: boolean;
  roomUrl: string;
  trackerUrls: string[];
  setShowNSFW: (v: boolean) => void;
  setRoomUrl: (u: string) => void;
  addTracker: (u: string) => void;
  removeTracker: (u: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => {
      const { room, trackerList } = getDefaultEndpoints();
      return {
        showNSFW: false,
        roomUrl: room,
        trackerUrls: trackerList,
        setShowNSFW: (v) => set({ showNSFW: v }),
        setRoomUrl: (u) => set({ roomUrl: u }),
        addTracker: (u) =>
          set({ trackerUrls: Array.from(new Set([...get().trackerUrls, u])) }),
        removeTracker: (u) =>
          set({ trackerUrls: get().trackerUrls.filter((x) => x !== u) }),
      };
    },
    { name: 'cashucast-settings' },
  ),
);
