/*
 * Licensed under GPL-3.0-or-later
 * Test suite for VideoRecorder.
 */
/** @vitest-environment jsdom */

import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VideoRecorder from './VideoRecorder';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const MAX_RECORDING_MS = 300_000;
let stopSpy: any;

describe('VideoRecorder', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (navigator as any).mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    };

    class MockMediaRecorder {
      public ondataavailable: ((e: any) => void) | null = null;
      public onstop: (() => void) | null = null;
      public state = 'inactive';
      start() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['x'], { type: 'video/webm' }) });
        this.onstop?.();
      }
    }

    stopSpy = vi.spyOn(MockMediaRecorder.prototype, 'stop');
    (globalThis as any).MediaRecorder = MockMediaRecorder as any;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (navigator as any).mediaDevices;
    delete (globalThis as any).MediaRecorder;
  });

  it('stops recording after five minutes', async () => {
    const onComplete = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);

    await act(async () => {
      root.render(<VideoRecorder onComplete={onComplete} />);
      await Promise.resolve();
    });

    expect(stopSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(MAX_RECORDING_MS - 1);
    expect(stopSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(expect.any(Blob));

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});

