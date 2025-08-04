/*
 * Licensed under GPL-3.0-or-later
 * Test suite for follow and unfollow RPC methods.
 */
import { describe, it, expect, vi } from 'vitest';
import { createRPCClient } from '../../../shared/rpc';

const followSpy = vi.fn();

const ssb = { friends: { follow: followSpy } };

vi.mock('../src/instance', () => ({
  initSsb: () => ssb,
  getSSB: () => ssb,
}));

function createPortPair() {
  const listeners1: ((ev: MessageEvent) => void)[] = [];
  const listeners2: ((ev: MessageEvent) => void)[] = [];
  const port1 = {
    postMessage(data: any) {
      listeners2.forEach((l) => l({ data } as MessageEvent));
    },
    addEventListener(_type: 'message', listener: (ev: MessageEvent) => void) {
      listeners1.push(listener);
    },
    removeEventListener(_type: 'message', listener: (ev: MessageEvent) => void) {
      const idx = listeners1.indexOf(listener);
      if (idx >= 0) listeners1.splice(idx, 1);
    },
    start() {},
  } as any;
  const port2 = {
    postMessage(data: any) {
      listeners1.forEach((l) => l({ data } as MessageEvent));
    },
    addEventListener(_type: 'message', listener: (ev: MessageEvent) => void) {
      listeners2.push(listener);
    },
    removeEventListener(_type: 'message', listener: (ev: MessageEvent) => void) {
      const idx = listeners2.indexOf(listener);
      if (idx >= 0) listeners2.splice(idx, 1);
    },
    start() {},
  } as any;
  return { port1, port2 };
}

async function setup() {
  vi.resetModules();
  (globalThis as any).__cashuSSBLog = [];
  const { port1, port2 } = createPortPair();
  (globalThis as any).self = port1;
  await import('../index');
  const call = createRPCClient(port2);
  const cleanup = () => {
    delete (globalThis as any).self;
  };
  return { call, cleanup };
}

describe('worker-ssb follow RPC', () => {
  it('invokes friends.follow with correct flag', async () => {
    const { call, cleanup } = await setup();
    await call('follow', 'alice');
    expect(followSpy).toHaveBeenCalledWith('alice', true, expect.any(Function));
    followSpy.mockClear();
    await call('unfollow', 'alice');
    expect(followSpy).toHaveBeenCalledWith('alice', false, expect.any(Function));
    cleanup();
  });
});

