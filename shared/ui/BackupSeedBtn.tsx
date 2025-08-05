/*
 * Licensed under GPL-3.0-or-later
 * React component for BackupSeedBtn.
 *
 * Material 3 button spec: https://m3.material.io/components/buttons/overview
 * MUI Button docs: https://mui.com/material-ui/react-button/
 */
import React from 'react';
import Button from '@mui/material/Button';

/** Button to export wallet seed as a text file. */
export const BackupSeedBtn: React.FC<React.ComponentProps<typeof Button>> = (
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
    <Button
      {...props}
      variant="contained"
      color="success"
      onClick={handleClick}
      className={`min-tap ${props.className ?? ''}`}
    >
      Backup Seed
    </Button>
  );
};
