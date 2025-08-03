/*
 * Licensed under GPL-3.0-or-later
 * Test suite for initKeys.
 */
import { describe, it, expect, vi } from 'vitest';
import { createRPCClient } from '../../../shared/rpc';

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
  const { port1, port2 } = createPortPair();
  (globalThis as any).self = port1;
  await import('../index');
  const call = createRPCClient(port2);
  const cleanup = () => {
    delete (globalThis as any).self;
  };
  return { call, cleanup };
}

describe('initKeys', () => {
  it('generates and returns a keypair when not provided', async () => {
    const { call, cleanup } = await setup();
    const keys: any = await call('initKeys', undefined, undefined);
    expect(typeof keys.sk).toBe('string');
    expect(typeof keys.pk).toBe('string');
    cleanup();
  });

  it('stores provided keys without generating', async () => {
    const { call, cleanup } = await setup();
    const res = await call('initKeys', 'sk', 'pk');
    expect(res).toBeUndefined();
    cleanup();
  });
});
