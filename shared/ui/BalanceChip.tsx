/*
 * Licensed under GPL-3.0-or-later
 * React component for BalanceChip.
 */
import React, { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';
import { useBalanceStore } from './balanceStore';

// Material 3 chip spec: https://m3.material.io/components/chips/overview
// MUI Chip docs: https://mui.com/material-ui/react-chip/

export const BalanceChip: React.FC = () => {
  const balance =
    typeof window === 'undefined'
      ? useBalanceStore.getState().balance
      : useBalanceStore((s) => s.balance);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(t);
  }, [balance]);

  return (
    <Chip
      label={`${balance} sats`}
      color="success"
      size="small"
      className={animate ? 'motion-safe:animate-pulse' : ''}
      sx={{ px: 1 }}
    />
  );
};
