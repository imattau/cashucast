/*
 * Licensed under GPL-3.0-or-later
 * Tests that initSsb handles libsodium initialization failures.
 */
import { describe, it, expect, vi } from 'vitest';

const sodiumError = new Error('boom');
const ready = Promise.reject(sodiumError);
ready.catch(() => {});
vi.mock('libsodium-wrappers-sumo', () => ({ ready }));

describe('initSsb sodium failure', () => {
  it('logs an error and returns a stub SSB instance', async () => {
    vi.resetModules();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { initSsb } = await import('../src/index');
    const ssb = await initSsb();
    expect(ssb).toBeTruthy();
    expect(ssb.blobs).toBeDefined();
    expect(typeof ssb.blobs.add).toBe('function');
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toBe(
      'Failed to initialize libsodium. SSB features are disabled.'
    );
    expect(consoleError.mock.calls[0][1]).toBe(sodiumError);
    consoleError.mockRestore();
  });
});
