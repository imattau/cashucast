import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import BoostBadge, { setBoosters } from './BoostBadge';

describe('BoostBadge', () => {
  it('returns null when no boosters', () => {
    setBoosters('p1', []);
    const result = renderToString(<BoostBadge id="p1" />);
    expect(result).toBe('');
  });

  it('displays a count when boosters are present', () => {
    setBoosters('p2', ['a', 'b']);
    const result = renderToString(<BoostBadge id="p2" />);
    const clean = result.replace(/<!--.*?-->/g, '');
    expect(clean).toContain('↻ 2');
  });
});
