import { describe, it, expect, vi } from 'vitest';
import { createRPCClient } from '../../../shared/rpc';
import { MintQuoteState } from '@cashu/cashu-ts';

const { walletMock, tokenMock } = vi.hoisted(() => {
  const wallet = {
    loadMint: vi.fn(async () => {}),
    createMintQuote: vi.fn(async (sats: number) => ({ quote: 'q1' })),
    checkMintQuote: vi.fn(async (q: string) => ({ state: MintQuoteState.PAID })),
    mintProofs: vi.fn(async (_sats: number, _q: string) => [{ amount: 5 }]),
    send: vi.fn(async (_sats: number, _proofs: any[]) => ({ send: [{ amount: 5 }], keep: [] })),
  } as any;
  return {
    walletMock: wallet,
    tokenMock: vi.fn(() => 'token'),
  };
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

async function setup() {
  vi.resetModules();
  (globalThis as any).__cashuProofs = [];
  const { port1, port2 } = createPortPair();
  (globalThis as any).self = port1;
  await import('../index');
  const call = createRPCClient(port2);
  const cleanup = () => { delete (globalThis as any).self; };
  walletMock.loadMint.mockClear();
  walletMock.createMintQuote.mockClear();
  walletMock.checkMintQuote.mockClear();
  walletMock.mintProofs.mockClear();
  walletMock.send.mockClear();
  tokenMock.mockClear();
  return { call, cleanup };
}

describe('worker-cashu', () => {
  it('initializes wallet and mints tokens', async () => {
    const { call, cleanup } = await setup();
    const phrase = await call('initWallet', undefined);
    expect(phrase).toBe('mnemonic');
    const minted = await call('mint', 5);
    expect(minted).toBe(5);
    expect(walletMock.mintProofs).toHaveBeenCalled();
    cleanup();
  });

  it('sends a zap with encoded token', async () => {
    const { call, cleanup } = await setup();
    await call('initWallet', undefined);
    await call('mint', 5);
    const zap: any = await call('sendZap', 'pk', 5, 'ref');
    expect(zap.token).toBe('token');
    expect(walletMock.send).toHaveBeenCalled();
    cleanup();
  });
});

