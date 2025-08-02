import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer', () => {
  it('is muted by default and uses a blob URL', () => {
    const html = renderToStaticMarkup(<VideoPlayer />);
    expect(html).toContain('muted');
    expect(html).toContain('src="blob:');
  });
});
