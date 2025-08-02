import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { SkeletonLoader } from './SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders shimmer placeholder', () => {
    const html = renderToStaticMarkup(<SkeletonLoader />);
    expect(html).toContain('bg-gray-200');
    expect(html).toContain('bg-gradient-to-r');
  });
});
