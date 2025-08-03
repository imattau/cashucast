import { describe, it, expect, vi } from 'vitest';
import { createRPCClient } from '../../../shared/rpc';
import { MintQuoteState } from '@cashu/cashu-ts';

const { seedMock, addMock } = vi.hoisted(() => ({
  seedMock: vi.fn((file: File, _opts: any, cb: any) =>
    cb({ magnetURI: 'magnet:?xt=urn:btih:test', files: [{ getBlob: (cb2: any) => cb2(null, file) }] })
  ),
  addMock: vi.fn((_magnet: string, _opts: any, cb: any) => {
    const blob = new Blob(['data'], { type: 'video/mp4' });
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
        end(cb: any) { cb(null, 'hash'); },
      })),
      get: vi.fn(),
      rm: vi.fn(),
    },
    db: { publish: vi.fn() },
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

const { walletMock, tokenMock } = vi.hoisted(() => {
  const wallet = {
    loadMint: vi.fn(async () => {}),
    createMintQuote: vi.fn(async (sats: number) => ({ quote: 'q1' })),
    checkMintQuote: vi.fn(async () => ({ state: MintQuoteState.PAID })),
    mintProofs: vi.fn(async () => [{ amount: 5 }]),
    send: vi.fn(async () => ({ send: [{ amount: 5 }], keep: [] })),
  } as any;
  return { walletMock: wallet, tokenMock: vi.fn(() => 'token') };
});

vi.mock('@cashu/cashu-ts', () => ({
  CashuMint: vi.fn(),
  CashuWallet: vi.fn(() => walletMock),
  MintQuoteState: { PAID: 'PAID' },
  getEncodedTokenV4: tokenMock,
}));
vi.mock('bip39', () => ({
  generateMnemonic: () => 'mnemonic',
  mnemonicToSeedSync: () => Buffer.from('seed'),
}));

function createPortPair() {
  const listeners1: ((ev: MessageEvent) => void)[] = [];
  const listeners2: ((ev: MessageEvent) => void)[] = [];
  const port1 = {
    postMessage(data: any) {
      listeners2.forEach((l) => l({ data } as MessageEvent));
    },
    addEventListener(_t: 'message', l: (ev: MessageEvent) => void) {
      listeners1.push(l);
    },
    removeEventListener(_t: 'message', l: (ev: MessageEvent) => void) {
      const i = listeners1.indexOf(l);
      if (i >= 0) listeners1.splice(i, 1);
    },
    start() {},
  } as any;
  const port2 = {
    postMessage(data: any) {
      listeners1.forEach((l) => l({ data } as MessageEvent));
    },
    addEventListener(_t: 'message', l: (ev: MessageEvent) => void) {
      listeners2.push(l);
    },
    removeEventListener(_t: 'message', l: (ev: MessageEvent) => void) {
      const i = listeners2.indexOf(l);
      if (i >= 0) listeners2.splice(i, 1);
    },
    start() {},
  } as any;
  return { port1, port2 };
}

async function loadWorker(modulePath: string) {
  const { port1, port2 } = createPortPair();
  (globalThis as any).self = port1;
  await import(modulePath);
  const call = createRPCClient(port2);
  const cleanup = () => { delete (globalThis as any).self; };
  return { call, cleanup };
}

describe('integration flow', () => {
  it('seeds, publishes, streams and zaps', async () => {
    vi.resetModules();
    (globalThis as any).__cashuSSBLog = [];
    (globalThis as any).__cashuProofs = [];
    ssbMock.blobs.get.mockImplementation((_h: string, cb: any) => cb(new Error('missing'), null));
    const ssb = await loadWorker('../../worker-ssb/index.ts');
    const torrent = await loadWorker('../../worker-torrent/src/index.ts');
    const cashu = await loadWorker('../../worker-cashu/index.ts');

    await cashu.call('initWallet', undefined);
    await cashu.call('mint', 5);

    const magnet = (await torrent.call('seedFile', new Blob(['video']))) as string;
    await ssb.call('publishPost', {
      id: 'v1',
      magnet,
      author: { name: 'A', pubkey: 'a', avatarUrl: '' },
    } as any);
    const feed: any[] = (await ssb.call('queryFeed', {})) as any[];
    expect(feed.some((p) => p.id === 'v1')).toBe(true);

    const url = (await torrent.call('stream', magnet)) as string;
    expect(url.startsWith('blob:')).toBe(true);

    const zap: any = await cashu.call('sendZap', 'pk', 5, 'ref');
    expect(zap.token).toBe('token');

    ssb.cleanup();
    torrent.cleanup();
    cashu.cleanup();
  }, 15000);
});

