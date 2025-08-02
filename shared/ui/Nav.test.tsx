import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach } from 'vitest';
import { Nav } from './Nav';
import { useBalanceStore } from './balanceStore';

describe('Nav', () => {
  beforeEach(() => {
    useBalanceStore.setState({ balance: 0, txs: [] }, true);
  });

  it('renders logo and balance chip', () => {
    useBalanceStore.setState({ balance: 123, txs: [] }, true);
    const html = renderToStaticMarkup(<Nav />);
    expect(html).toContain('CashuCast');
    expect(html).toContain('123 sats');
  });
});
