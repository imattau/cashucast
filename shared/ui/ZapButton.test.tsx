import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach } from 'vitest';
import { ZapButton } from './ZapButton';
import { useBalanceStore } from './balanceStore';

describe('ZapButton', () => {
  beforeEach(() => {
    useBalanceStore.setState({ balance: 0, txs: [] });
  });

  it('disables amounts above balance', () => {
    useBalanceStore.setState({ balance: 50, txs: [] });
    const html = renderToStaticMarkup(<ZapButton />);
    const disabledCount = (html.match(/disabled=""/g) || []).length;
    expect(disabledCount).toBe(2);
  });

  it('enables all amounts when balance high enough', () => {
    useBalanceStore.setState({ balance: 2000, txs: [] });
    const html = renderToStaticMarkup(<ZapButton />);
    expect(html).not.toContain('disabled=""');
  });

  it('disables all amounts when disabled prop set', () => {
    useBalanceStore.setState({ balance: 2000, txs: [] });
    const html = renderToStaticMarkup(<ZapButton disabled />);
    const disabledCount = (html.match(/disabled=""/g) || []).length;
    expect(disabledCount).toBe(3);
  });
});
