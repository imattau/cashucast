import { create } from 'zustand';
import type { Post } from '../types';

/**
 * State used by the search dialog for querying posts.
 */
interface SearchState {
  /** Whether the search UI is currently shown. */
  open: boolean;
  /** Current query string. */
  q: string;
  /** Search results from the worker. */
  results: Post[];
  setOpen: (v: boolean) => void;
  setQ: (q: string) => void;
  setResults: (r: Post[]) => void;
}

/**
 * Zustand store holding search UI state.
 */
export const useSearch = create<SearchState>((set) => ({
  open: false,
  q: '',
  results: [],
  setOpen: (open) => set({ open }),
  setQ: (q) => set({ q }),
  setResults: (results) => set({ results }),
}));

