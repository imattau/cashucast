import { describe, it, expect, vi } from 'vitest';
import { createRPCClient } from '../../../shared/rpc';

vi.mock('../src/instance', () => ({
  getSSB: () => ({ db: { publish: () => {} }, blobs: { add: () => ({ write() {}, end(cb:any){cb(null,'hash')} }), get: vi.fn(), rm: vi.fn() } })
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
  const cleanup = () => { delete (globalThis as any).self; };
  return { call, cleanup };
}

describe('worker-ssb topTags', () => {
  it('returns most frequent tags', async () => {
    const { call, cleanup } = await setup();
    await call('publishPost', {
      id: '1',
      author: { name: 'A', pubkey: 'a', avatarUrl: '' },
      magnet: 'magnet:?xt=urn:btih:a',
      tags: ['x', 'y'],
    });
    await call('publishPost', {
      id: '2',
      author: { name: 'B', pubkey: 'b', avatarUrl: '' },
      magnet: 'magnet:?xt=urn:btih:b',
      tags: ['x'],
    });
    const tags = (await call('topTags', { since: 0, limit: 10 })) as any[];
    expect(tags[0]).toEqual({ tag: 'x', count: 2 });
    cleanup();
  });
});

