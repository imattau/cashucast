import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type V = { ts: number };

interface HistoryState {
  map: Record<string, V>;
  add: (id: string) => void;
}

export const useHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      map: {},
      add: (id: string) =>
        set((s) => {
          const now = Date.now();
          return { map: { ...s.map, [id]: { ts: now } } };
        }),
    }),
    { name: 'timeline-history', version: 1 },
  ),
);
