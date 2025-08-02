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
      className={`px-2 py-1 rounded-full text-sm bg-green-200 text-gray-900 dark:bg-green-700 dark:text-white ${
        animate ? 'motion-safe:animate-pulse' : ''
      }`}
    >
      {balance} sats
    </span>
  );
};
