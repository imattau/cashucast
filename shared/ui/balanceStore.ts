import { create } from 'zustand';

// trigger simple confetti effect when running in browser
const triggerConfetti = () => {
  if (typeof window !== 'undefined') {
    // lazy-load to avoid SSR issues
    import('canvas-confetti').then((m) => m.default());
  }
};

const makeId = () => Math.random().toString(36).slice(2);

interface Tx {
  id: string;
  type: 'mint' | 'zap';
  amount: number;
  status: 'success' | 'failed';
}

interface BalanceState {
  balance: number;
  txs: Tx[];
  setBalance: (balance: number) => void;
  mint: (amount: number) => Promise<void>;
  zap: (amount: number) => void;
}

export const useBalanceStore = create<BalanceState>((set, get) => ({
  balance: 0,
  txs: [],
  setBalance: (balance) =>
    set(
      (state) => {
        if (balance > state.balance) {
          triggerConfetti();
        }
        return { balance };
      },
      true,
    ),
  mint: async (amount) => {
    try {
      const res = await fetch('/mint', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error('mint failed');
      get().setBalance(get().balance + amount);
      set(
        (state) => ({
          txs: [...state.txs, { id: makeId(), type: 'mint', amount, status: 'success' }],
        }),
        true,
      );
    } catch {
      set(
        (state) => ({
          txs: [...state.txs, { id: makeId(), type: 'mint', amount, status: 'failed' }],
        }),
        true,
      );
      throw new Error('mint unreachable');
    }
  },
  zap: (amount) =>
    set(
      (state) => {
        if (state.balance >= amount) {
          triggerConfetti();
          return {
            balance: state.balance - amount,
            txs: [...state.txs, { id: makeId(), type: 'zap', amount, status: 'success' }],
          };
        }
        return state;
      },
      true,
    ),
}));
