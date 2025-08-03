/*
 * Licensed under GPL-3.0-or-later
 * Test suite for Onboarding.
 */
/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
vi.mock('../../shared/rpc', () => ({
  createRPCClient: () => () => Promise.resolve(undefined),
}));

import Onboarding from './Onboarding';
import { useProfile } from '../../shared/store/profile';

class MockWorker {
  onmessage: ((e: any) => void) | null = null;
  constructor() {}
  postMessage(_: any) {}
  addEventListener(type: string, cb: (e: any) => void) {
    if (type === 'message') this.onmessage = cb;
  }
  removeEventListener() {}
  terminate() {}
}

const setupDom = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  return { container, root };
};

const mockStorage = () => {
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      key: (i: number) => Object.keys(store)[i] || null,
      get length() {
        return Object.keys(store).length;
      },
    } as Storage,
    configurable: true,
  });
};

beforeEach(() => {
  mockStorage();
  // @ts-ignore
  globalThis.Worker = MockWorker;
  useProfile.setState({ profile: undefined });
  document.body.innerHTML = '';
});

describe('Onboarding steps', () => {
  it('renders initial step and transitions to new account setup', async () => {
    const { container, root } = setupDom();
    await act(async () => {
      root.render(<Onboarding />);
    });

      expect(container.textContent).toContain('New Account');
      const newBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('New Account'),
      )!;
    await act(async () => {
      newBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.querySelector('input[placeholder="Username"]')).toBeTruthy();
  });

  it('renders import dropzones when selecting import', async () => {
    const { container, root } = setupDom();
    await act(async () => {
      root.render(<Onboarding />);
    });
      const importBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Import Existing Profile'),
      )!;
    await act(async () => {
      importBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).toContain('Drop profile backup JSON');
    expect(container.textContent).toContain('Drop wallet backup JSON');
  });
});
