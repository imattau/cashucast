import { create } from 'zustand';

// trigger simple confetti effect when running in browser
const triggerConfetti = () => {
  if (typeof window !== 'undefined') {
    // lazy-load to avoid SSR issues
    import('canvas-confetti').then((m) => m.default());
  }
};

interface BalanceState {
  balance: number;
  setBalance: (balance: number) => void;
  zap: (amount: number) => void;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }, true),
  zap: (amount) =>
    set(
      (state) => {
        if (state.balance >= amount) {
          triggerConfetti();
          return { balance: state.balance - amount };
        }
        return state;
      },
      true,
    ),
}));
