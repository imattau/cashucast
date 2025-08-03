/*
 * Licensed under GPL-3.0-or-later
 * Test suite for torrent.
 */
import { describe, it, expect, vi } from 'vitest';
import { Readable } from 'stream';
import { createRPCClient } from '../../../shared/rpc';

const { seedMock, addMock } = vi.hoisted(() => ({
  seedMock: vi.fn((file: File, _opts: any, cb: any) =>
    cb({ magnetURI: 'magnet:?xt=urn:btih:test', files: [{ getBlob: (cb2: any) => cb2(null, file) }] })
  ),
  addMock: vi.fn((_magnet: string, _opts: any, cb: any) => {
    const blob = new Blob(['data'], { type: 'video/webm' });
    cb({ files: [{ getBlob: (cb2: any) => cb2(null, blob) }] });
  }),
}));

vi.mock('webtorrent', () => ({
  default: class {
    seed = seedMock;
    add = addMock;
  },
}));
const { ssbMock } = vi.hoisted(() => ({
  ssbMock: {
    blobs: {
      add: vi.fn(() => ({
        write() {},
        end(cb: any) {
          cb(null, 'hash');
        },
      })),
      get: vi.fn(),
      rm: vi.fn(),
    },
  },
}));

vi.mock('../../worker-ssb/src/instance', () => ({ getSSB: () => ssbMock }));
vi.mock('../../worker-ssb/src/blobCache', () => ({
  cache: { entries: () => [], maxSize: 0, calculatedSize: 0 },
  touch: vi.fn(),
  prune: vi.fn(),
}));
vi.mock('../../../shared/store/settings', () => ({
  useSettings: { getState: () => ({ trackerUrls: [] }) },
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

async function setup(ssbHasBlob: boolean) {
  vi.resetModules();

  ssbMock.blobs.get.mockImplementation((_: string, cb: any) => {
    if (ssbHasBlob) {
      const stream = new Readable();
      stream.push(Buffer.from('video'));
      stream.push(null);
      cb(null, stream);
    } else {
      cb(new Error('missing'), null);
    }
  });
  ssbMock.blobs.add.mockImplementation(() => ({
    write() {},
    end(cb: any) {
      cb(null, 'hash');
    },
  }));

  const { port1, port2 } = createPortPair();
  (globalThis as any).self = port1;
  await import('../src/index');
  const call = createRPCClient(port2);
  const cleanup = () => {
    delete (globalThis as any).self;
  };
  seedMock.mockClear();
  addMock.mockClear();
  ssbMock.blobs.add.mockClear();
  ssbMock.blobs.get.mockClear();
  return { call, clientMock: { seed: seedMock, add: addMock }, ssb: ssbMock, cleanup };
}

describe('worker-torrent', () => {
  it('seeds a file and returns a magnet URI', async () => {
    const { call, clientMock, cleanup } = await setup(false);
    const magnet = await call('seedFile', new Blob(['hello'], { type: 'video/webm' }));
    expect(clientMock.seed).toHaveBeenCalled();
    expect(magnet).toMatch(/^magnet:/);
    cleanup();
  });

  it('streams from ssb blob cache when available', async () => {
    const { call, clientMock, cleanup } = await setup(true);
    const url = (await call('stream', 'magnet:?xt=urn:btih:test')) as string;
    expect(clientMock.add).not.toHaveBeenCalled();
    expect(url.startsWith('blob:')).toBe(true);
    cleanup();
  });

  it('falls back to torrent when blob cache misses', async () => {
    const { call, clientMock, ssb, cleanup } = await setup(false);
    const url = (await call('stream', 'magnet:?xt=urn:btih:test')) as string;
    expect(clientMock.add).toHaveBeenCalled();
    expect(ssb.blobs.add).toHaveBeenCalled();
    expect(url.startsWith('blob:')).toBe(true);
    cleanup();
  });
});
