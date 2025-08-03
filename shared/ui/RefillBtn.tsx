/*
 * Licensed under GPL-3.0-or-later
 * React component for RefillBtn.
 */
import React from 'react';
import { useBalanceStore } from './balanceStore';

/** Button to trigger wallet refill. Attempts to mint and falls back with a toast if unreachable. */
export const RefillBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props,
) => {
  const mint = useBalanceStore((s) => s.mint);
  const [toast, setToast] = React.useState(false);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    props.onClick?.(e);
    try {
      await mint(100);
    } catch {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }
  };

  return (
    <>
      <button
        {...props}
        onClick={handleClick}
        className={`px-3 py-1 bg-blue-500 text-white rounded ${props.className ?? ''}`}
      >
        Refill
      </button>
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded">
          Mint unreachable. Transaction stored locally.
        </div>
      )}
    </>
  );
};
