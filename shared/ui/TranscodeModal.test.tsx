/*
 * Licensed under GPL-3.0-or-later
 * Test suite for TranscodeModal.
 */
/** @vitest-environment jsdom */

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  })),
}));

vi.mock('../rpc', () => ({
  createRPCClient: () => () => Promise.resolve('magnet:?xt=urn:btih:test'),
}));

import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { TranscodeModal } from './TranscodeModal';
import { FFmpeg } from '@ffmpeg/ffmpeg';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const flushPromises = () => new Promise((r) => setTimeout(r, 0));

if (!(File.prototype as any).arrayBuffer) {
  (File.prototype as any).arrayBuffer = function () {
    return Promise.resolve(new Uint8Array(this.size).buffer);
  };
}

describe('TranscodeModal', () => {
  beforeEach(() => {
    (globalThis as any).Worker = class { terminate() {} };
  });

  afterEach(() => {
    delete (globalThis as any).Worker;
  });

  it('trims input longer than five minutes', async () => {
    const longFile = new File([new Uint8Array(1024 * 1024 * 10)], 'long.webm', {
      type: 'video/webm',
    });
    const onComplete = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);

    await act(async () => {
      root.render(
        <TranscodeModal open file={longFile} onComplete={onComplete} />,
      );
    });
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
    await flushPromises();
    const instance = (FFmpeg as any).mock.results[0].value;
    await instance.load.mock.results[0].value;
    await flushPromises();
    expect((FFmpeg as any).mock.calls.length).toBe(1);
    expect(instance.writeFile).toHaveBeenCalledTimes(1);
    await instance.writeFile.mock.results[0].value;
    await flushPromises();
    expect(instance.exec).toHaveBeenCalledTimes(1);
    const args = instance.exec.mock.calls[0][0];
    const tIndex = args.indexOf('-t');
    expect(args[tIndex + 1]).toBe('300');
    expect(onComplete).toHaveBeenCalledWith('magnet:?xt=urn:btih:test');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});

