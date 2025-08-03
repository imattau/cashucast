/*
 * Licensed under GPL-3.0-or-later
 * Test suite for filters.
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
  return { call, self: port1, cleanup };
}

describe('worker-ssb feed filtering', () => {
  it('omits posts from blocked users', async () => {
    const { call, cleanup } = await setup();
    await call('publishPost', {
      id: 'a',
      author: { name: 'A', pubkey: 'blockme', avatarUrl: 'https://example.com/a.png' },
      magnet: 'magnet:?xt=urn:btih:a',
    });
    await call('publishPost', {
      id: 'b',
      author: { name: 'B', pubkey: 'keep', avatarUrl: 'https://example.com/b.png' },
      magnet: 'magnet:?xt=urn:btih:b',
    });
    await call('blockUser', 'blockme');
    const feed = (await call('queryFeed', {})) as any[];
    expect(feed.some((p) => p.author.pubkey === 'blockme')).toBe(false);
    expect(feed.some((p) => p.author.pubkey === 'keep')).toBe(true);
    cleanup();
  });

  it('hides posts meeting report threshold', async () => {
    const { call, self, cleanup } = await setup();
    self.SSB_REPORT_THRESHOLD = 2;
    await call('publishPost', {
      id: 'c',
      author: { name: 'C', pubkey: 'c', avatarUrl: 'https://example.com/c.png' },
      magnet: 'magnet:?xt=urn:btih:c',
      reports: [{ fromPk: 'x', reason: 'spam', ts: 0 }],
    });
    await call('publishPost', {
      id: 'd',
      author: { name: 'D', pubkey: 'd', avatarUrl: 'https://example.com/d.png' },
      magnet: 'magnet:?xt=urn:btih:d',
      reports: [
        { fromPk: 'x', reason: 'spam', ts: 0 },
        { fromPk: 'y', reason: 'spam', ts: 1 },
      ],
    });
    const feed = (await call('queryFeed', {})) as any[];
    expect(feed.some((p) => p.id === 'c')).toBe(true);
    expect(feed.some((p) => p.id === 'd')).toBe(false);
    cleanup();
  });

  it('filters posts by included tags', async () => {
    const { call, cleanup } = await setup();
    await call('publishPost', {
      id: 'e',
      author: { name: 'E', pubkey: 'e', avatarUrl: 'https://example.com/e.png' },
      magnet: 'magnet:?xt=urn:btih:e',
      tags: ['dog'],
    });
    await call('publishPost', {
      id: 'f',
      author: { name: 'F', pubkey: 'f', avatarUrl: 'https://example.com/f.png' },
      magnet: 'magnet:?xt=urn:btih:f',
      tags: ['cat'],
    });
    const feed = (await call('queryFeed', { includeTags: ['dog'] })) as any[];
    expect(feed.some((p) => p.id === 'e')).toBe(true);
    expect(feed.some((p) => p.id === 'f')).toBe(false);
    cleanup();
  });
});

