/*
 * Licensed under GPL-3.0-or-later
 * Test suite for SkeletonLoader.
 */
/** @vitest-environment jsdom */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi } from 'vitest';

describe('SkeletonLoader', () => {
  it('renders shimmer placeholder', async () => {
    vi.resetModules();
    const { SkeletonLoader } = await import('./SkeletonLoader');
    const html = renderToStaticMarkup(<SkeletonLoader />);
    expect(html).toContain('bg-gray-200');
    expect(html).toContain('bg-gradient-to-r');
  });

  it('attaches shimmer style only once', async () => {
    vi.resetModules();
    const { SkeletonLoader } = await import('./SkeletonLoader');
    document.head.innerHTML = '';
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<SkeletonLoader />);
    await new Promise((r) => setTimeout(r, 0));
    expect(
      document.head.querySelectorAll('#skeleton-loader-style').length,
    ).toBe(1);
    root.render(<SkeletonLoader />);
    await new Promise((r) => setTimeout(r, 0));
    expect(
      document.head.querySelectorAll('#skeleton-loader-style').length,
    ).toBe(1);
    root.unmount();
    container.remove();
  });
});

