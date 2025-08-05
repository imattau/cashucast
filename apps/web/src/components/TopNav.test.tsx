/* @vitest-environment jsdom */
/*
 * Licensed under GPL-3.0-or-later
 * Test suite for TopNav.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import TopNav from './TopNav';

describe('TopNav', () => {
  it('renders app title', () => {
    const html = renderToString(<TopNav />);
    expect(html).toContain('CashuCast');
  });
});

