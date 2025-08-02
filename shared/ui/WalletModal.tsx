import React from 'react';
import { BottomSheet } from './BottomSheet';
import { BalanceChip } from './BalanceChip';
import { MintPicker } from './MintPicker';
import { RefillBtn } from './RefillBtn';
import { TxList } from './TxList';

export interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Wallet view presented in a bottom sheet. */
export const WalletModal: React.FC<WalletModalProps> = ({ open, onOpenChange }) => {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="p-4 space-y-4">
        <BalanceChip />
        <MintPicker />
        <RefillBtn />
        <TxList />
      </div>
    </BottomSheet>
  );
};
