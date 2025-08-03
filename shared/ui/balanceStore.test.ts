/*
 * Licensed under GPL-3.0-or-later
 * Test suite for balanceStore.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useBalanceStore, setCashuCall } from './balanceStore';

describe('balanceStore', () => {
  beforeEach(() => {
    useBalanceStore.setState({ balance: 0, txs: [] });
  });

  it('updates balance on successful mint', async () => {
    setCashuCall(((method: any, amount: number) => {
      if (method === 'mint') return Promise.resolve(amount);
      return Promise.resolve(null);
    }) as any);
    await useBalanceStore.getState().mint(100);
    const state = useBalanceStore.getState();
    expect(state.balance).toBe(100);
    expect(state.txs[0]).toMatchObject({ type: 'mint', status: 'success', amount: 100 });
  });

  it('records mint failures with error message', async () => {
    setCashuCall((async () => {
      throw new Error('mint failed');
    }) as any);
    await expect(useBalanceStore.getState().mint(50)).rejects.toThrow('mint failed');
    const state = useBalanceStore.getState();
    expect(state.balance).toBe(0);
    expect(state.txs[0]).toMatchObject({ type: 'mint', status: 'failed', error: 'mint failed' });
  });

  it('handles successful zap and balance decrease', async () => {
    setCashuCall((async () => null) as any);
    useBalanceStore.setState({ balance: 200, txs: [] });
    await useBalanceStore.getState().zap('pk', 80, 'ref');
    const state = useBalanceStore.getState();
    expect(state.balance).toBe(120);
    expect(state.txs[0]).toMatchObject({ type: 'zap', status: 'success', amount: 80 });
  });
});
