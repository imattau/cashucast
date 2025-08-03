/*
 * Licensed under GPL-3.0-or-later
 * Test suite for UploadDropzone.
 */
/** @vitest-environment jsdom */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, vi } from 'vitest';
import { UploadDropzone } from './UploadDropzone';

describe('UploadDropzone', () => {
  it('limits selection to video files', () => {
    const html = renderToStaticMarkup(<UploadDropzone onFile={() => {}} />);
    expect(html).toContain('accept="video/*"');
  });

  it('shows error for non-video files', async () => {
    const onFile = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<UploadDropzone onFile={onFile} />);
    await new Promise((r) => setTimeout(r, 0));
    const input = container.querySelector('input') as HTMLInputElement;
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(onFile).not.toHaveBeenCalled();
    const error = container.querySelector('.text-red-600');
    expect(error?.textContent).toBe('Please select a video file.');
    root.unmount();
    container.remove();
  });
});
