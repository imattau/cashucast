/*
 * Licensed under GPL-3.0-or-later
 * Test suite for VideoPlayer.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer', () => {
  it('renders a skeleton loader while awaiting the stream URL', () => {
    const html = renderToStaticMarkup(
      <VideoPlayer magnet="magnet:?xt=urn:btih:test" />
    );
    expect(html).toContain('bg-gray-200');
  });
});
