import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach } from 'vitest';
import { BalanceChip } from './BalanceChip';
import { useBalanceStore } from './balanceStore';

describe('BalanceChip', () => {
  beforeEach(() => {
    useBalanceStore.setState({ balance: 0, txs: [] });
  });

  it('renders balance and updates on change', () => {
    const initial = renderToStaticMarkup(<BalanceChip />);
    expect(initial).toContain('0 sats');
    useBalanceStore.setState({ balance: 200, txs: [] });
    const updated = renderToStaticMarkup(<BalanceChip />);
    expect(updated).toContain('200 sats');
  });
});
