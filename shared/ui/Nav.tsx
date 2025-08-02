import React from 'react';
import { WalletModal } from './WalletModal';
import { ToggleDarkMode } from './ToggleDarkMode';
import { BalanceChip } from './BalanceChip';

/** Simple navigation bar that opens the wallet bottom sheet. */
export const Nav: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 shadow text-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-2 font-bold">
        <img src="/logo.svg" alt="CashuCast logo" className="h-6 w-6" />
        CashuCast
      </div>
      <div className="flex items-center gap-2">
        <BalanceChip />
        <ToggleDarkMode />
        <button
          onClick={() => setOpen(true)}
          className="rounded bg-gray-200 dark:bg-gray-700 px-2 py-1 text-gray-900 dark:text-gray-100"
        >
          Wallet
        </button>
      </div>
      <WalletModal open={open} onOpenChange={setOpen} />
    </header>
  );
};
