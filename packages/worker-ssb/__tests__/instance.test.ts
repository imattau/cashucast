/*
 * Licensed under GPL-3.0-or-later
 *
 * Ensures that `getSSB` returns a usable instance for operations such as
 * avatar uploads which rely on the blobs API.
 */
import { describe, expect, it } from 'vitest';
import { getSSB, initSsb } from '../src/instance';

describe('getSSB', () => {
  it('exposes a blobs.add function for avatar uploads', async () => {
    await initSsb();
    const ssb = getSSB();
    expect(ssb).toBeTruthy();
    expect(ssb.blobs).toBeDefined();
    expect(typeof ssb.blobs.add).toBe('function');
  });
});

