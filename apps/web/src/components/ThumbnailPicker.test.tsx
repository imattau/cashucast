/*
 * Licensed under GPL-3.0-or-later
 * Test suite for ThumbnailPicker.
 */
/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';

const load = vi.fn(async () => {});
const writeFile = vi.fn(async () => {});
const exec = vi.fn(async () => {});
const readFile = vi.fn(async () => new Uint8Array([1]));

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: class {
    load = load;
    writeFile = writeFile;
    exec = exec;
    readFile = readFile;
  },
}));

class MockWorker {
  postMessage(_: any) {}
  addEventListener() {}
  removeEventListener() {}
  terminate() {}
}
(globalThis as any).Worker = MockWorker as any;

import ThumbnailPicker from './ThumbnailPicker';

describe('ThumbnailPicker', () => {
  it('extracts thumbnails from input.webm at given timestamps', async () => {
    (global as any).URL.createObjectURL = vi.fn(() => 'blob:mock');
    const file = {
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    } as unknown as Blob;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(<ThumbnailPicker file={file} onSelect={() => {}} />);
    });
    await act(async () => {});
    expect(writeFile).toHaveBeenCalledWith('input.webm', expect.any(Uint8Array));
    expect(exec).toHaveBeenCalledTimes(3);
    expect(exec.mock.calls[0][0]).toEqual([
      '-ss',
      '00:00:01',
      '-i',
      'input.webm',
      '-frames:v',
      '1',
      'out0.jpg',
    ]);
    expect(exec.mock.calls[1][0]).toEqual([
      '-ss',
      '00:00:02',
      '-i',
      'input.webm',
      '-frames:v',
      '1',
      'out1.jpg',
    ]);
    expect(exec.mock.calls[2][0]).toEqual([
      '-ss',
      '00:00:03',
      '-i',
      'input.webm',
      '-frames:v',
      '1',
      'out2.jpg',
    ]);
  });
});

