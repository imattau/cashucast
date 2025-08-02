import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types/profile';

interface ProfileState {
  profile?: Profile;
  setProfile: (profile: Profile) => void;
  importProfile: (json: Profile) => void;
  exportProfile: () => Blob;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: undefined,
      setProfile(profile) {
        set({ profile });
      },
      importProfile(json) {
        set({ profile: json });
      },
      exportProfile() {
        return new Blob([JSON.stringify(get().profile)], {
          type: 'application/json',
        });
      },
    }),
    { name: 'cashucast-profile' },
  ),
);

