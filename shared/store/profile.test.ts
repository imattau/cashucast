/*
 * Licensed under GPL-3.0-or-later
 * Test suite for profile.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { useProfile } from './profile';
import type { Profile } from '../types/profile';

const mockStorage = () => {
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      key: (i: number) => Object.keys(store)[i] || null,
      get length() {
        return Object.keys(store).length;
      },
    } as Storage,
    configurable: true,
  });
};

describe('importProfile', () => {
  beforeEach(() => {
    mockStorage();
    useProfile.setState({ profile: undefined });
  });

  it('populates the store with imported profile', () => {
    const profile: Profile = {
      ssbPk: 'pk',
      ssbSk: 'sk',
      cashuMnemonic: 'mnemonic',
      username: 'alice',
    };

    useProfile.getState().importProfile(profile);
    expect(useProfile.getState().profile).toEqual(profile);
  });
});
