import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, afterEach } from 'vitest';
import { PwaPrompt } from './PwaPrompt';

describe('PwaPrompt', () => {
  afterEach(() => {
    // @ts-ignore
    delete (global as any).navigator;
  });

  it('shows offline banner when offline', () => {
    // @ts-ignore
    (global as any).navigator = { onLine: false };
    const html = renderToStaticMarkup(<PwaPrompt />);
    expect(html).toContain('You are offline');
  });
});
