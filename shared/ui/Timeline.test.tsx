import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { Timeline } from './Timeline';

describe('Timeline', () => {
  it('centers content with blurred sidebars and includes bottom nav', () => {
    const html = renderToStaticMarkup(<Timeline />);
    expect(html).toContain('backdrop-blur');
    expect(html).toContain('Home');
  });
});
