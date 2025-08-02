import { create } from 'zustand';

interface FilterState {
  tags: string[];
  toggleTag: (t: string) => void;
}

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

function writeTagsToHash(tags: string[]) {
  if (typeof window === 'undefined') return;
  const hash = tags.length
    ? `#tags=${tags.map((t) => encodeURIComponent(t)).join(',')}`
    : '#';
  window.history.replaceState(null, '', hash);
}

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

