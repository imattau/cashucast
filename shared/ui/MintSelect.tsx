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
      <MintPicker value={mint} onChange={(e) => setMint(e.target.value)} />
      <button
        onClick={handleNext}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Next
      </button>
    </div>
  );
};
