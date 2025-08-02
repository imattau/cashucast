import React from 'react';

export interface ZapButtonProps {
  onZap: (amount: number) => void;
  disabled?: boolean;
}

const amounts = [21, 100, 1000];

export const ZapButton: React.FC<ZapButtonProps> = ({ onZap, disabled }) => {
  return (
    <div className="flex gap-2">
      {amounts.map((amt) => (
        <button
          key={amt}
          className="px-2 py-1 bg-purple-600 text-white rounded disabled:opacity-50"
          disabled={disabled}
          onClick={() => onZap(amt)}
        >
          {amt}
        </button>
      ))}
    </div>
  );
};
