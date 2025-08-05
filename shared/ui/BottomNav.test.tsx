/*
 * Licensed under GPL-3.0-or-later
 * Test suite for BottomNav.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('renders navigation links', () => {
    const html = renderToStaticMarkup(<BottomNav />);
    expect(html).toContain('Home');
    expect(html).toContain('Discover');
    expect(html).toContain('Profile');
    expect(html).toContain('+');
    expect(html).toContain('Mui-selected');
  });

  it('hides on wider screens', () => {
    const html = renderToStaticMarkup(<BottomNav />);
    expect(html).toContain('sm:hidden');
  });
});
