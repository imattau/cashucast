/*
 * Licensed under GPL-3.0-or-later
 * React component for RefillBtn.
 */
import React from 'react';
import { useBalanceStore } from './balanceStore';
import { Toast } from './Toast';

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
    }
  };

  return (
    <>
      <button
        {...props}
        onClick={handleClick}
        className={`px-3 py-1 bg-primary rounded min-tap ${props.className ?? ''}`}
      >
        Refill
      </button>
      {toast && (
        <Toast
          message="Mint unreachable. Transaction stored locally."
          onHide={() => setToast(false)}
        />
      )}
    </>
  );
};
