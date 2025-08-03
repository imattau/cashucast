import { create } from 'zustand';
import type { Post } from '../types';

interface SearchState {
  open: boolean;
  q: string;
  results: Post[];
  setOpen: (v: boolean) => void;
  setQ: (q: string) => void;
  setResults: (r: Post[]) => void;
}

export const useSearch = create<SearchState>((set) => ({
  open: false,
  q: '',
  results: [],
  setOpen: (open) => set({ open }),
  setQ: (q) => set({ q }),
  setResults: (results) => set({ results }),
}));

