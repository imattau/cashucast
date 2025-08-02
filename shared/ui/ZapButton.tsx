import React, { useRef } from 'react';
import { useBalanceStore } from './balanceStore';

export interface ZapButtonProps {
  onZap?: (amount: number) => void;
}

const amounts = [21, 100, 1000];

const ZapOption: React.FC<{ amount: number; onZap?: (amt: number) => void }> = ({ amount, onZap }) => {
  const balance =
    typeof window === 'undefined'
      ? useBalanceStore.getState().balance
      : useBalanceStore((s) => s.balance);
  const zap = useBalanceStore.getState().zap;
  const timer = useRef<NodeJS.Timeout | null>(null);
  const longPress = useRef(false);

  const promptCustom = () => {
    if (typeof window === 'undefined') return;
    const input = window.prompt('Custom zap amount (sats)');
    const value = Number(input);
    if (!isNaN(value) && value > 0 && value <= balance) {
      zap(value);
      onZap?.(value);
    }
  };

  const handlePointerDown = () => {
    longPress.current = false;
    timer.current = setTimeout(() => {
      longPress.current = true;
      promptCustom();
    }, 600);
  };

  const handlePointerUp = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!longPress.current) {
      if (balance >= amount) {
        zap(amount);
        onZap?.(amount);
      }
    }
  };

  const handlePointerLeave = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  return (
    <button
      className="px-2 py-1 bg-purple-600 text-white rounded disabled:opacity-50"
      disabled={balance < amount}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {amount}
    </button>
  );
};

export const ZapButton: React.FC<ZapButtonProps> = ({ onZap }) => (
  <div className="flex gap-2">
    {amounts.map((amt) => (
      <ZapOption key={amt} amount={amt} onZap={onZap} />
    ))}
  </div>
);
