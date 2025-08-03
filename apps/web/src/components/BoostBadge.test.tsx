import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import BoostBadge from './BoostBadge';

describe('BoostBadge', () => {
  it('returns null when no users', () => {
    const result = renderToString(<BoostBadge users={[]} />);
    expect(result).toBe('');
  });

  it('displays a count when users are present', () => {
    const result = renderToString(<BoostBadge users={['a', 'b']} />);
    const clean = result.replace(/<!--.*?-->/g, '');
    expect(clean).toContain('↻ 2');
  });
});
