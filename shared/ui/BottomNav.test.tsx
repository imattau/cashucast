import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('renders navigation links', () => {
    const html = renderToStaticMarkup(<BottomNav />);
    expect(html).toContain('Home');
    expect(html).toContain('+');
    expect(html).toContain('Profile');
  });
});
