/*
 * Licensed under GPL-3.0-or-later
 * React component for BackupSeedBtn.
 */
import React from 'react';

/** Button to export wallet seed as a text file. */
export const BackupSeedBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props,
) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    props.onClick?.(e);
    if (typeof window === 'undefined') return;
    const seed = localStorage.getItem('walletSeed') ?? '';
    const blob = new Blob([seed], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wallet-seed.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`px-3 py-1 bg-green-600 rounded min-tap ${props.className ?? ''}`}
    >
      Backup Seed
    </button>
  );
};
