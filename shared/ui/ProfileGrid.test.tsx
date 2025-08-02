import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { ProfileGrid } from './ProfileGrid';

describe('ProfileGrid', () => {
  it('uses responsive column classes', () => {
    const html = renderToStaticMarkup(<ProfileGrid clips={[]} />);
    expect(html).toContain('grid-cols-1');
    expect(html).toContain('sm:grid-cols-2');
    expect(html).toContain('lg:grid-cols-3');
  });
});
