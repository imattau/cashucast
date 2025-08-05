/*
 * Licensed under GPL-3.0-or-later
 * Test suite for PostMenu.
 */
/** @vitest-environment jsdom */

import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import { describe, it, expect } from 'vitest';
import { PostMenu } from './PostMenu';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('PostMenu', () => {
  it('renders report and block actions', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);

    await act(async () => {
      root.render(
        <PostMenu
          postId="p1"
          authorPubKey="a1"
          onReport={() => {}}
          onBlock={() => {}}
        />,
      );
      await Promise.resolve();
    });

    const button = container.querySelector(
      'button[aria-label="Open post menu"]',
    );
    expect(button).toBeTruthy();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });

    expect(document.body.textContent).toContain('Report');
    expect(document.body.textContent).toContain('Block author');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
