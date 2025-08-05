/*
 * Licensed under GPL-3.0-or-later
 * Test suite for VideoPlayer.
 */
import React, { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactDOM from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { describe, it, expect, vi } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

const blobUrl = URL.createObjectURL(new Blob(['data'], { type: 'video/ogg' }));

vi.mock('../rpc', () => ({
  createRPCClient: () => () => Promise.resolve(blobUrl),
}));

const dom = new JSDOM('<!doctype html><html><body></body></html>');
(globalThis as any).window = dom.window as any;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;

describe('VideoPlayer', () => {
  it('renders a skeleton loader while awaiting the stream URL', () => {
    const html = renderToStaticMarkup(
      <VideoPlayer magnet="magnet:?xt=urn:btih:test" />
    );
    expect(html).toContain('bg-surface');
  });

  it('renders a video element once the blob URL resolves', async () => {
    (globalThis as any).Worker = class {
      terminate() {}
    };
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(<VideoPlayer magnet="magnet:?xt=urn:btih:test" />);
      await Promise.resolve();
    });
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toBeTruthy();
    expect(video.src).toBe(blobUrl);
    root.unmount();
  });
});
