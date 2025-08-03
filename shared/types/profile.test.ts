/*
 * Licensed under GPL-3.0-or-later
 * Test suite for profile.
 */
import { describe, expect, it } from 'vitest';
import { createProfile, decryptProfileSecrets } from './profile';

describe('profile encryption', () => {
  it('encrypts and decrypts secrets', async () => {
    const profile = await createProfile({
      ssbPk: 'pk',
      ssbSk: 'secret-sk',
      cashuMnemonic: 'secret-mnemonic',
      username: 'alice',
    });

    expect(profile.ssbSk).not.toBe('secret-sk');
    expect(profile.cashuMnemonic).not.toBe('secret-mnemonic');

    const secrets = await decryptProfileSecrets(profile);
    expect(secrets.ssbSk).toBe('secret-sk');
    expect(secrets.cashuMnemonic).toBe('secret-mnemonic');
  });
});
