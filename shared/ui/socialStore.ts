/*
 * Licensed under GPL-3.0-or-later
 * socialStore module.
 */
import { create } from 'zustand';
import { createRPCClient } from '../rpc';

interface CreatorStats {
  followers: number;
  isFollowing: boolean;
  zaps: number;
}

interface SocialState {
  creators: Record<string, CreatorStats>;
  /** Whether the current viewer is a moderator */
  isModerator: boolean;
  setModerator: (isMod: boolean) => void;
  toggleFollow: (id: string) => void;
  addZap: (id: string, amount: number) => void;
}

type SsbCall = ReturnType<typeof createRPCClient>;
let ssbCall: SsbCall | null = null;

if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
  const worker = new Worker(
    new URL('../../packages/worker-ssb/index.ts', import.meta.url),
    { type: 'module' }
  );
  ssbCall = createRPCClient(worker);
}

export const setSsbCall = (fn: SsbCall) => {
  ssbCall = fn;
};

export const useSocialStore = create<SocialState>((set) => ({
  creators: {},
  isModerator: false,
  setModerator: (isModerator) => set({ isModerator }),
  toggleFollow: (id) =>
    set((state) => {
      const current = state.creators[id] || {
        followers: 0,
        isFollowing: false,
        zaps: 0,
      };
      const nextFollowing = !current.isFollowing;
      ssbCall?.(nextFollowing ? 'follow' : 'unfollow', id);
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
