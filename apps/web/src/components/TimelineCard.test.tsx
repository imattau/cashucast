/* @vitest-environment jsdom */
/*
 * Licensed under GPL-3.0-or-later
 * Test suite for TimelineCard.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

// Mocks for modules used inside TimelineCard
vi.mock('framer-motion', () => ({
  motion: {
    article: (props: any) => <article {...props} />,
  },
}));

vi.mock('../../shared/rpc', () => ({
  createRPCClient: () => () => {},
}));

vi.mock('./CommentsDrawer', () => ({
  CommentsDrawer: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">Comments</div> : null,
}));

vi.mock('../../shared/ui', async () => {
  const { create } = await import('zustand');
  const useSettingsStore = create(() => ({
    showNSFW: false,
    setShowNSFW: (show: boolean) => useSettingsStore.setState({ showNSFW: show }),
  }));
  return {
    VideoPlayer: ({ magnet }: { magnet: string }) => <video src={magnet} />,
    useSettingsStore,
    BlurOverlay: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Avatar: ({ name, url }: { name: string; url: string }) => (
      <img alt={name} src={url} />
    ),
    BottomSheet: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
    Profile: ({ name }: { name: string }) => <div>Profile-{name}</div>,
    FabRecord: ({ className }: { className?: string }) => (
      <button aria-label="Record" className={className} />
    ),
  };
});

import TimelineCard from './TimelineCard';
import { useSettingsStore } from '../../shared/ui';

// Stub Worker to avoid errors in useEffect
class WorkerStub {
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  terminate() {}
}
// @ts-ignore
global.Worker = WorkerStub;

describe('TimelineCard', () => {
  const post = {
    id: 'p1',
    authorAvatar: 'avatar.jpg',
    authorName: 'Alice',
    description: 'Hello world',
    magnet: 'magnet:?xt=urn:btih:abc',
    nsfw: true,
    authorPubKey: 'pubkey1',
    zaps: 5,
    comments: 7,
    boosters: ['a', 'b', 'c'],
  };

  beforeEach(() => {
    useSettingsStore.setState({ showNSFW: false });
  });

  it('renders core elements and counts', () => {
    const result = renderToString(<TimelineCard post={post} />);
    const clean = result.replace(/<!--.*?-->/g, '');
    expect(clean).toContain('<video src="magnet:?xt=urn:btih:abc"');
    expect(clean).toContain('alt="Alice"');
    expect(clean).toContain('Hello world');
    expect(clean).toContain('>3</span>');
    expect(clean).toContain('>5</span>');
    expect(clean).toContain('>7</span>');
    expect(clean).toContain('aria-label="Record"');
    expect(clean).toContain('NSFW – Tap to view');
  });

  it('reveals NSFW content after interaction', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(<TimelineCard post={post} />);
    });
    let clean = container.innerHTML.replace(/<!--.*?-->/g, '');
    expect(clean).toContain('NSFW – Tap to view');
    const overlay = container.querySelector('[aria-label="NSFW content hidden"]') as HTMLElement;
    await act(async () => {
      overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    clean = container.innerHTML.replace(/<!--.*?-->/g, '');
    expect(clean).not.toContain('NSFW – Tap to view');
  });

  it('opens profile bottom sheet when avatar is clicked', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(<TimelineCard post={post} />);
    });
    const avatarBtn = container.querySelector('button img[alt="Alice"]')?.parentElement as HTMLButtonElement;
    await act(async () => {
      avatarBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const clean = container.innerHTML.replace(/<!--.*?-->/g, '');
    expect(clean).toContain('Profile-Alice');
  });

  it('opens comments drawer when comment button is clicked', async () => {
    useSettingsStore.setState({ showNSFW: true });
    const container = document.createElement('div');
    const root = createRoot(container);
    await act(async () => {
      root.render(<TimelineCard post={post} />);
    });
    const commentBtn = container.querySelector('button[aria-label="Comment"]') as HTMLButtonElement;
    await act(async () => {
      commentBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const clean = container.innerHTML.replace(/<!--.*?-->/g, '');
    expect(clean).toContain('Comments');
  });
});

