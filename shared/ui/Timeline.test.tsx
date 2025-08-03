/*
 * Licensed under GPL-3.0-or-later
 * Test suite for Timeline.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { Timeline } from './Timeline';

describe('Timeline', () => {
  it('centers content with blurred sidebars and includes bottom nav', () => {
    const html = renderToStaticMarkup(<Timeline />);
    expect(html).toContain('max-w-screen-md');
    expect(html).toContain('backdrop-blur');
    expect(html).toContain('aria-label="Home"');
  });
});
