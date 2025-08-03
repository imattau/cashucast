/*
 * Licensed under GPL-3.0-or-later
 * React component for WalletModal.
 */
import React from 'react';
import { BottomSheet } from './BottomSheet';
import { BalanceChip } from './BalanceChip';
import { MintPicker } from './MintPicker';
import { RefillBtn } from './RefillBtn';
import { TxList } from './TxList';
import { QuotaBar } from './QuotaBar';
import { BackupSeedBtn } from './BackupSeedBtn';

export interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Wallet view presented in a bottom sheet. */
export const WalletModal: React.FC<WalletModalProps> = ({ open, onOpenChange }) => {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <BalanceChip />
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close wallet"
            className="rounded bg-gray-200 px-2 py-1"
          >
            Close
          </button>
        </div>
        <MintPicker />
        <RefillBtn />
        <BackupSeedBtn />
        <QuotaBar />
        <TxList />
      </div>
    </BottomSheet>
  );
};
