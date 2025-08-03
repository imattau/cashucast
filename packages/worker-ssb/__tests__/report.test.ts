/*
 * Licensed under GPL-3.0-or-later
 * Test suite for report.
 */
import { describe, it, expect, vi } from 'vitest';
import { createRPCClient } from '../../../shared/rpc';
vi.mock('../src/instance', () => ({ getSSB: () => ({ db: { publish: () => {} }, blobs: { add: () => ({ write() {}, end(cb: any){cb(null,'hash')} }), get: vi.fn(), rm: vi.fn() } }) }));

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
  const cleanup = () => { delete (globalThis as any).self; };
  return { call, self: port1 as any, cleanup };
}

describe('worker-ssb reporting', () => {
  it('hides post after report threshold via reportPost', async () => {
    const { call, self, cleanup } = await setup();
    self.SSB_REPORT_THRESHOLD = 1;
    await call('publishPost', {
      id: 'rep1',
      author: { name: 'R', pubkey: 'r', avatarUrl: '' },
      magnet: 'magnet:?xt=urn:btih:rep1',
    });
    await call('reportPost', 'rep1', 'spam');
    const feed = (await call('queryFeed', {})) as any[];
    expect(feed.some((p) => p.id === 'rep1')).toBe(false);
    cleanup();
  });
});

