import React from 'react';

export interface WalletModalProps {
  balance: number;
  onClose: () => void;
  visible: boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({ balance, onClose, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 rounded shadow-lg min-w-[200px]">
        <div className="mb-4">Balance: {balance}</div>
        <button className="px-2 py-1 bg-gray-200 rounded" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
