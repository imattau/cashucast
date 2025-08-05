/*
 * Licensed under GPL-3.0-or-later
 * React component for MintSelect.
 */
import React from 'react';
import { MintPicker } from './MintPicker';

export interface MintSelectProps {
  onNext: () => void;
}

/** Step component for choosing the default mint. */
export const MintSelect: React.FC<MintSelectProps> = ({ onNext }) => {
  const [mint, setMint] = React.useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('defaultMint') ?? '';
  });

  const handleNext = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('defaultMint', mint);
    }
    onNext();
  };

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Select Default Mint</h2>
      <MintPicker
        value={mint}
        onChange={(e) => setMint(e.target.value as string)}
        autoFocus
      />
      <button
        onClick={handleNext}
        className="mt-4 rounded bg-primary px-4 py-2 min-tap"
      >
        Next
      </button>
    </div>
  );
};
