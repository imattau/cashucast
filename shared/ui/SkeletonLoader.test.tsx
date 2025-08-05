/*
 * Licensed under GPL-3.0-or-later
 * Test suite for SkeletonLoader.
 */
/** @vitest-environment jsdom */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';

describe('SkeletonLoader', () => {
  it('renders shimmer placeholder', async () => {
    vi.resetModules();
    const { SkeletonLoader } = await import('./SkeletonLoader');
    const html = renderToStaticMarkup(<SkeletonLoader />);
    expect(html).toContain('bg-surface');
    expect(html).toContain('bg-gradient-to-r');
    expect(html).toContain('animate-skeleton-shimmer');
  });
});

