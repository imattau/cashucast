import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types/profile';

/**
 * State for managing the user's local profile information.
 */
interface ProfileState {
  /** Current profile data, if any. */
  profile?: Profile;
  /** Replace the current profile. */
  setProfile: (profile: Profile) => void;
  /** Load profile data from a JSON export. */
  importProfile: (json: Profile) => void;
  /** Export the profile to a Blob for downloading. */
  exportProfile: () => Blob;
}

/**
 * Persisted profile store backed by localStorage.
 */
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

