/*
 * Licensed under GPL-3.0-or-later
 * filters module.
 */
import { create } from 'zustand';

/**
 * State for managing active tag filters in the timeline view.
 */
interface FilterState {
  /** Currently selected tags to filter by. */
  tags: string[];
  /** Add or remove a tag from the filter set. */
  toggleTag: (t: string) => void;
}

/**
 * Parse the hash fragment of the URL and extract the `tags` parameter.
 */
function readTagsFromHash(): string[] {
  if (typeof window === 'undefined') return [];
  const match = window.location.hash.match(/tags=([^&]+)/);
  if (match && match[1]) {
    return match[1]
      .split(',')
      .map((t) => decodeURIComponent(t))
      .filter(Boolean);
  }
  return [];
}

/**
 * Persist the current tag selection into the URL hash to allow link sharing.
 */
function writeTagsToHash(tags: string[]) {
  if (typeof window === 'undefined') return;
  const hash = tags.length
    ? `#tags=${tags.map((t) => encodeURIComponent(t)).join(',')}`
    : '#';
  window.history.replaceState(null, '', hash);
}

/**
 * Zustand store encapsulating tag filter state.
 */
export const useFilters = create<FilterState>((set, get) => ({
  tags: readTagsFromHash(),
  toggleTag(t) {
    const current = get().tags;
    const tags = current.includes(t)
      ? current.filter((x) => x !== t)
      : [...current, t];
    set({ tags });
    writeTagsToHash(tags);
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    useFilters.setState({ tags: readTagsFromHash() });
  });
}

