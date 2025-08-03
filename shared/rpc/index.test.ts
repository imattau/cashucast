/*
 * Licensed under GPL-3.0-or-later
 * Test suite for index.
 */
import { createRPCClient, createRPCHandler } from './index';
import { MessageChannel } from 'worker_threads';
import { describe, it, expect } from 'vitest';

describe('RPC helpers', () => {
  it('calls handlers and returns result', async () => {
    const { port1, port2 } = new MessageChannel();
    const call = createRPCClient(port1 as any);
    createRPCHandler(port2 as any, {
      mint: async (sats) => sats * 2,
    });
    const res = await call('mint', 21);
    expect(res).toBe(42);
  });

  it('validates arguments', () => {
    const { port1 } = new MessageChannel();
    const call = createRPCClient(port1 as any);
    expect(() => call('mint', 'bad' as any)).toThrow();
  });
});
