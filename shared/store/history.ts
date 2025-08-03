import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type V = { ts: number };

/**
 * Tracks which post IDs have been seen recently to avoid re-showing them in
 * the feed.
 */
interface HistoryState {
  /** Mapping of post id to timestamp of last view. */
  map: Record<string, V>;
  /** Record that a post has been viewed. */
  add: (id: string) => void;
}

/**
 * Zustand store used to persist recently viewed posts in localStorage.
 */
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
