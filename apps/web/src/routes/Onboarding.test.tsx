/*
 * Licensed under GPL-3.0-or-later
 * Test suite for Onboarding.
 */
/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
// silence act(...) warnings in React 19
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
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

  it('shows an error for invalid username', async () => {
    const { container, root } = setupDom();
    await act(async () => {
      root.render(<Onboarding />);
    });
    const newBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('New Account'),
    )!;
    await act(async () => {
      newBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const input = container.querySelector('input[name="username"]') as HTMLInputElement;
    await act(async () => {
      input.focus();
      input.value = 'ab';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.blur();
    });
    expect(container.textContent).toContain('Username must be between 3 and 30 characters.');
  });

  it('shows an error when invalid JSON is dropped', async () => {
    const { container, root } = setupDom();
    await act(async () => {
      root.render(<Onboarding />);
    });
    const importBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Import Existing Profile'),
    )!;
    await act(async () => {
      importBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const input = container.querySelector('input[name="profile"]') as HTMLInputElement;
    const file = new File(['{invalid'], 'bad.json', { type: 'application/json' });
    await act(async () => {
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(container.textContent).toContain('Invalid JSON');
  });

  it('shows step indicator and Back navigation', async () => {
    const { container, root } = setupDom();
    await act(async () => {
      root.render(<Onboarding />);
    });
    const newBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('New Account'),
    )!;
    await act(async () => {
      newBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).toContain('Step 2 of 3');
    const backBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Back',
    )!;
    await act(async () => {
      backBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).toContain('Step 1 of 3');
    const newBtn2 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('New Account'),
    )!;
    await act(async () => {
      newBtn2.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).toContain('Step 2 of 3');
  });

  it('allows user to reach final confirmation step via import flow', async () => {
    const { container, root } = setupDom();
    await act(async () => {
      root.render(<Onboarding />);
    });
    const importBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Import Existing Profile'),
    )!;
    await act(async () => {
      importBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await act(async () => {
      useProfile.setState({
        profile: {
          ssbPk: 'pk',
          ssbSk: 'sk',
          cashuMnemonic: 'mnemonic',
          username: 'alice',
        } as any,
      });
    });
    const nextBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Next',
    )!;
    await act(async () => {
      nextBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container.textContent).toContain('Step 3 of 3');
    expect(container.textContent).toContain('Confirm');
  });
});
