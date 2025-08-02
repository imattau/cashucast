import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultEndpoints } from '../config';

interface SettingsState {
  showNSFW: boolean;
  maxBlobMB: number;
  enableDht: boolean;
  roomUrl: string;
  trackerUrls: string[];
  setShowNSFW: (v: boolean) => void;
  setMaxBlobMB: (mb: number) => void;
  toggleDht: () => void;
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
        maxBlobMB: 512,
        enableDht: true,
        roomUrl: room,
        trackerUrls: trackerList,
        setShowNSFW: (v) => set({ showNSFW: v }),
        setRoomUrl: (u) => set({ roomUrl: u }),
        addTracker: (u) =>
          set({ trackerUrls: Array.from(new Set([...get().trackerUrls, u])) }),
        removeTracker(u: string) {
          set({ trackerUrls: get().trackerUrls.filter((x) => x !== u) });
        },
        setMaxBlobMB(mb: number) {
          set({ maxBlobMB: mb });
        },
        toggleDht() {
          set({ enableDht: !get().enableDht });
        },
      };
    },
    { name: 'cashucast-settings' },
  ),
);
