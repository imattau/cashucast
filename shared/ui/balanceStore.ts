import { create } from 'zustand';
import { createRPCClient } from '../rpc';

// trigger simple confetti effect when running in browser
const triggerConfetti = () => {
  if (typeof window !== 'undefined') {
    // lazy-load to avoid SSR issues
    import('canvas-confetti').then((m) => m.default());
  }
};

const makeId = () => Math.random().toString(36).slice(2);

type CashuCall = ReturnType<typeof createRPCClient>;
let cashuCall: CashuCall | null = null;

if (typeof window !== 'undefined') {
  const worker = new Worker(
    new URL('../../packages/worker-cashu/index.ts', import.meta.url),
    { type: 'module' }
  );
  cashuCall = createRPCClient(worker);
}

export const setCashuCall = (fn: CashuCall) => {
  cashuCall = fn;
};

interface Tx {
  id: string;
  type: 'mint' | 'zap';
  amount: number;
  status: 'success' | 'failed';
  error?: string;
}

interface BalanceState {
  balance: number;
  txs: Tx[];
  setBalance: (balance: number) => void;
  mint: (amount: number) => Promise<void>;
  zap: (receiverPk: string, amount: number, refId?: string) => Promise<void>;
}

export const useBalanceStore = create<BalanceState>((set, get) => ({
  balance: 0,
  txs: [],
  setBalance: (balance) =>
    set((state) => {
      if (balance > state.balance) {
        triggerConfetti();
      }
      return { balance };
    }),
  mint: async (amount) => {
    if (!cashuCall) throw new Error('wallet not initialized');
    const id = makeId();
    try {
      await cashuCall('mint', amount);
      get().setBalance(get().balance + amount);
      set((state) => ({
        txs: [...state.txs, { id, type: 'mint', amount, status: 'success' }],
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set((state) => ({
        txs: [...state.txs, { id, type: 'mint', amount, status: 'failed', error: message }],
      }));
      throw new Error(message);
    }
  },
  zap: async (receiverPk, amount, refId) => {
    if (!cashuCall) throw new Error('wallet not initialized');
    const id = makeId();
    if (get().balance < amount) {
      const message = 'insufficient balance';
      set((state) => ({
        txs: [...state.txs, { id, type: 'zap', amount, status: 'failed', error: message }],
      }));
      throw new Error(message);
    }
    try {
      await cashuCall('sendZap', receiverPk, amount, refId ?? '');
      triggerConfetti();
      set((state) => ({
        balance: state.balance - amount,
        txs: [...state.txs, { id, type: 'zap', amount, status: 'success' }],
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      set((state) => ({
        txs: [...state.txs, { id, type: 'zap', amount, status: 'failed', error: message }],
      }));
      throw new Error(message);
    }
  },
}));

