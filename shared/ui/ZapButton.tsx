/*
 * Licensed under GPL-3.0-or-later
 * React component for ZapButton.
 *
 * Material 3 button spec: https://m3.material.io/components/buttons/overview
 * MUI Button docs: https://mui.com/material-ui/react-button/
 */
import React, { useRef } from 'react';
import Button from '@mui/material/Button';
import { useBalanceStore } from './balanceStore';

export interface ZapButtonProps {
  receiverPk: string;
  refId?: string;
  onZap?: (amount: number) => void;
  /** Disable all zap options */
  disabled?: boolean;
}

const amounts = [21, 100, 1000];

const ZapOption: React.FC<{
  amount: number;
  receiverPk: string;
  refId?: string;
  onZap?: (amt: number) => void;
  disabled?: boolean;
}> = ({ amount, receiverPk, refId, onZap, disabled }) => {
  const balance =
    typeof window === 'undefined'
      ? useBalanceStore.getState().balance
      : useBalanceStore((s) => s.balance);
  const zap = useBalanceStore.getState().zap;
  const timer = useRef<NodeJS.Timeout | null>(null);
  const longPress = useRef(false);

  const promptCustom = () => {
    if (typeof window === 'undefined') return;
    const input = window.prompt('Custom zap amount (sats)');
    const value = Number(input);
    if (!isNaN(value) && value > 0 && value <= balance) {
      void zap(receiverPk, value, refId);
      onZap?.(value);
    }
  };

  const handlePointerDown = () => {
    longPress.current = false;
    timer.current = setTimeout(() => {
      longPress.current = true;
      promptCustom();
    }, 600);
  };

  const handlePointerUp = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!longPress.current) {
      if (balance >= amount) {
        void zap(receiverPk, amount, refId);
        onZap?.(amount);
      }
    }
  };

  const handlePointerLeave = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  return (
    <Button
      variant="contained"
      disabled={disabled || balance < amount}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="min-tap"
    >
      {amount}
    </Button>
  );
};

export const ZapButton: React.FC<ZapButtonProps> = ({
  receiverPk,
  refId,
  onZap,
  disabled,
}) => (
  <div className="flex gap-2">
    {amounts.map((amt) => (
      <ZapOption
        key={amt}
        amount={amt}
        receiverPk={receiverPk}
        refId={refId}
        onZap={onZap}
        disabled={disabled}
      />
    ))}
  </div>
);

