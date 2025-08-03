/*
 * Licensed under GPL-3.0-or-later
 * settings module.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultEndpoints } from '../config';

/**
 * Global application settings persisted in localStorage. These control how the
 * application interacts with the network and its moderation behaviour.
 */
interface SettingsState {
  showNSFW: boolean;
  maxBlobMB: number;
  enableDht: boolean;
  roomUrl: string;
  trackerUrls: string[];
  lowSeedRatio: number;
  setShowNSFW: (v: boolean) => void;
  setMaxBlobMB: (mb: number) => void;
  toggleDht: () => void;
  setRoomUrl: (u: string) => void;
  addTracker: (u: string) => void;
  removeTracker: (u: string) => void;
  setLowSeedRatio: (n: number) => void;
}

/**
 * Zustand store providing read/write access to user settings.
 */
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
        lowSeedRatio: 10, // 1 in 10
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
        setLowSeedRatio(n: number) {
          set({ lowSeedRatio: n });
        },
      };
    },
    { name: 'cashucast-settings' },
  ),
);
