import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../settingsStore', () => {
  let state = { showNSFW: false, setShowNSFW: (show: boolean) => { state.showNSFW = show; } };
  const useStore: any = (selector: any) => selector(state);
  useStore.setState = (partial: any) => { Object.assign(state, partial); };
  useStore.getState = () => state;
  return { useSettingsStore: useStore };
});

import { TimelineCard } from '../TimelineCard';
import { useSettingsStore } from '../settingsStore';

const magnet = 'magnet:?xt=urn:btih:test';

describe('NSFW toggle', () => {
  beforeEach(() => {
    useSettingsStore.setState({ showNSFW: false });
  });

  it('hides NSFW content by default', () => {
    const html = renderToStaticMarkup(<TimelineCard author="a" magnet={magnet} nsfw />);
    expect(html).toContain('NSFW – Tap to view');
  });

  it('shows NSFW content when enabled', () => {
    useSettingsStore.getState().setShowNSFW(true);
    const html = renderToStaticMarkup(<TimelineCard author="a" magnet={magnet} nsfw />);
    expect(html).not.toContain('NSFW – Tap to view');
  });
});
