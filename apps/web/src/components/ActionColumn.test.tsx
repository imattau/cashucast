/*
 * Licensed under GPL-3.0-or-later
 * Test suite for ActionColumn.
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ActionColumn from './ActionColumn';

describe('ActionColumn', () => {
  it('renders three action buttons with counts', () => {
    const post = { id: 'p1', zaps: 5, comments: 7, boosters: ['a', 'b', 'c'] };
    const result = renderToString(<ActionColumn post={post} />);
    const clean = result.replace(/<!--.*?-->/g, '');
    expect(clean).toContain('aria-label="Boost"');
    expect(clean).toContain('aria-label="Zap"');
    expect(clean).toContain('aria-label="Comment"');
    expect(clean).toContain('>3</span>');
    expect(clean).toContain('>5</span>');
    expect(clean).toContain('>7</span>');
  });
});
