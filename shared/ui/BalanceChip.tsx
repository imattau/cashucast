import React, { useEffect, useState } from 'react';
import { useBalanceStore } from './balanceStore';

export const BalanceChip: React.FC = () => {
  const balance =
    typeof window === 'undefined'
      ? useBalanceStore.getState().balance
      : useBalanceStore((s) => s.balance);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(t);
  }, [balance]);

  return (
    <span
      className={`px-2 py-1 bg-green-200 rounded-full text-sm ${
        animate ? 'animate-pulse' : ''
      }`}
    >
      {balance} sats
    </span>
  );
};
