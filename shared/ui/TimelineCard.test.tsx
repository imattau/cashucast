/*
 * Licensed under GPL-3.0-or-later
 * Test suite for TimelineCard.
 */
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
      <TimelineCard name="a" avatarUrl="" magnet={magnet} nsfw />,
    );
    expect(html).toContain('NSFW – Tap to view');
  });

  it('shows normal content when not marked nsfw', () => {
    const html = renderToStaticMarkup(
      <TimelineCard name="a" avatarUrl="" magnet={magnet} />,
    );
    expect(html).not.toContain('NSFW – Tap to view');
  });

  it('shows report badge for moderators', () => {
    const html = renderToStaticMarkup(
      <TimelineCard name="a" avatarUrl="" magnet={magnet} reports={2} isModerator />,
    );
    expect(html).toContain('⚑ 2');
  });

  it('hides report badge for non-moderators', () => {
    const html = renderToStaticMarkup(
      <TimelineCard name="a" avatarUrl="" magnet={magnet} reports={3} />,
    );
    expect(html).not.toContain('⚑ 3');
  });

  it('renders avatar, username, menu button, and caption gradient', () => {
    const html = renderToStaticMarkup(
      <TimelineCard
        name="Alice"
        avatarUrl="/alice.png"
        text="hello world"
        magnet={magnet}
        postId="1"
        authorPubKey="pubkey"
        onReport={() => {}}
        onBlock={() => {}}
      />,
    );
    expect(html).toContain('<img src="/alice.png"');
    expect(html).toContain('<span class="font-semibold">Alice</span>');
    expect(html).toContain('aria-label="Open post menu"');
    expect(html).toContain('bg-black/60');
  });
});

