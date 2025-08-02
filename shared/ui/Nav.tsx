import React from 'react';
import { WalletModal } from './WalletModal';

/** Simple navigation bar that opens the wallet bottom sheet. */
export const Nav: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <nav className="flex items-center justify-between p-2 bg-gray-100">
      <span className="font-bold">CashuCast</span>
      <button onClick={() => setOpen(true)} className="px-2 py-1 rounded bg-gray-200">
        Wallet
      </button>
      <WalletModal open={open} onOpenChange={setOpen} />
    </nav>
  );
};
