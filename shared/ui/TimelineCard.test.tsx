import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach } from 'vitest';
import { TimelineCard } from './TimelineCard';
import { useSettingsStore } from './settingsStore';

const magnet = 'magnet:?xt=urn:btih:test';

describe('TimelineCard', () => {
  beforeEach(() => {
    useSettingsStore.setState({ showNSFW: false });
  });

  it('hides nsfw content when setting disabled', () => {
    const html = renderToStaticMarkup(
      <TimelineCard author="a" magnet={magnet} nsfw />,
    );
    expect(html).toContain('NSFW – Tap to view');
  });

  it('shows normal content when not marked nsfw', () => {
    const html = renderToStaticMarkup(
      <TimelineCard author="a" magnet={magnet} />,
    );
    expect(html).not.toContain('NSFW – Tap to view');
  });
});

