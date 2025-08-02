import { create } from 'zustand';

interface CreatorStats {
  followers: number;
  isFollowing: boolean;
  zaps: number;
}

interface SocialState {
  creators: Record<string, CreatorStats>;
  toggleFollow: (id: string) => void;
  addZap: (id: string, amount: number) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  creators: {},
  toggleFollow: (id) =>
    set((state) => {
      const current = state.creators[id] || {
        followers: 0,
        isFollowing: false,
        zaps: 0,
      };
      const nextFollowing = !current.isFollowing;
      return {
        creators: {
          ...state.creators,
          [id]: {
            ...current,
            isFollowing: nextFollowing,
            followers: current.followers + (nextFollowing ? 1 : -1),
          },
        },
      };
    }),
  addZap: (id, amount) =>
    set((state) => {
      const current = state.creators[id] || {
        followers: 0,
        isFollowing: false,
        zaps: 0,
      };
      return {
        creators: {
          ...state.creators,
          [id]: { ...current, zaps: current.zaps + amount },
        },
      };
    }),
}));
