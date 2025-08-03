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
const dropHandlers: ((files: File[]) => void)[] = [];
vi.mock('react-dropzone', () => ({
  default: ({ onDrop, children }: any) => {
    dropHandlers.push(onDrop);
    return children({
      getRootProps: (props: any = {}) => props,
      getInputProps: (props: any = {}) => ({
        ...props,
        onChange: (e: any) => onDrop(Array.from(e.target.files)),
      }),
      open: () => {},
    });
  },
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
  dropHandlers.length = 0;
});

describe('Onboarding steps', () => {
  it('renders initial step and transitions to new account setup', async () => {
    const { container, root } = setupDom();
    await act(async () => {
      root.render(<Onboarding />);
    });

    expect(container.textContent).toContain('New Account');
    expect(container.textContent).toContain('Import Existing Profile');
    const buttons = Array.from(container.querySelectorAll('button'));
    const newBtn = buttons.find((b) => b.textContent?.includes('New Account'))!;
    const importBtn = buttons.find((b) =>
      b.textContent?.includes('Import Existing Profile'),
    );
    expect(importBtn).toBeTruthy();
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
    expect(container.textContent).toContain('Profile Backup');
    expect(container.textContent).toContain('Wallet Backup');
  });

  it(
    'shows profile success message when dropping valid profile backup and enables Next after wallet backup',
    async () => {
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
      const profileFile = {
        text: () =>
          Promise.resolve(
            JSON.stringify({ ssbPk: 'pk', ssbSk: 'sk', username: 'alice' }),
          ),
      } as any;
      await act(async () => {
        dropHandlers[0]([profileFile]);
      });
      await new Promise((r) => setTimeout(r, 0));
      await new Promise((r) => setTimeout(r, 0));
      expect(container.textContent).toContain('Profile backup loaded');
      expect(container.textContent).not.toContain('Wallet backup loaded');
      const nextBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Next',
      )!;
      expect(nextBtn.disabled).toBe(true);
      const walletFile = {
        text: () => Promise.resolve(JSON.stringify({ cashuMnemonic: 'mnemonic' })),
      } as any;
      await act(async () => {
        dropHandlers[1]([walletFile]);
      });
      await new Promise((r) => setTimeout(r, 0));
      await new Promise((r) => setTimeout(r, 0));
      expect(container.textContent).toContain('Wallet backup loaded');
      expect(nextBtn.disabled).toBe(false);
    },
  );

  it('shows wallet success message when dropping valid wallet backup only', async () => {
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
    const walletFile = {
      text: () => Promise.resolve(JSON.stringify({ cashuMnemonic: 'mnemonic' })),
    } as any;
    await act(async () => {
      dropHandlers[1]([walletFile]);
    });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(container.textContent).toContain('Wallet backup loaded');
    expect(container.textContent).not.toContain('Profile backup loaded');
    const nextBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Next',
    )!;
    expect(nextBtn.disabled).toBe(true);
  });

  it('misplacing backups shows errors without affecting other drop zone', async () => {
    // wallet file dropped into profile zone
    {
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
      const walletFile = {
        text: () => Promise.resolve(JSON.stringify({ cashuMnemonic: 'mnemonic' })),
      } as any;
      await act(async () => {
        dropHandlers[0]([walletFile]);
      });
      await new Promise((r) => setTimeout(r, 0));
      await new Promise((r) => setTimeout(r, 0));
      expect(container.textContent).toContain('Invalid profile backup');
      expect(container.textContent).not.toContain('Invalid wallet backup');
      expect(container.textContent).not.toContain('Wallet backup loaded');
      const nextBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Next',
      )!;
      expect(nextBtn.disabled).toBe(true);
    }

    // profile file dropped into wallet zone
    {
      dropHandlers.length = 0;
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
      const profileFile = {
        text: () =>
          Promise.resolve(
            JSON.stringify({ ssbPk: 'pk', ssbSk: 'sk', username: 'alice' }),
          ),
      } as any;
      await act(async () => {
        dropHandlers[1]([profileFile]);
      });
      await new Promise((r) => setTimeout(r, 0));
      await new Promise((r) => setTimeout(r, 0));
      expect(container.textContent).toContain('Invalid wallet backup');
      expect(container.textContent).not.toContain('Invalid profile backup');
      expect(container.textContent).not.toContain('Profile backup loaded');
      const nextBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent === 'Next',
      )!;
      expect(nextBtn.disabled).toBe(true);
    }
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

  it.skip('shows an error when invalid JSON is dropped', async () => {
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
      await new Promise((r) => setTimeout(r, 0));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(container.textContent).toContain('Invalid profile backup');
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

  it.skip('allows user to reach final confirmation step via import flow', async () => {
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
    const profileInput = container.querySelector(
      'input[name="profile"]',
    ) as HTMLInputElement;
    const profileFile = new File(
      [JSON.stringify({ ssbPk: 'pk', ssbSk: 'sk', username: 'alice' })],
      'profile.json',
      { type: 'application/json' },
    );
    await act(async () => {
      Object.defineProperty(profileInput, 'files', { value: [profileFile] });
      profileInput.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 0));
    });
    const walletInput = container.querySelector(
      'input[name="wallet"]',
    ) as HTMLInputElement;
    const walletFile = new File(
      [JSON.stringify({ cashuMnemonic: 'mnemonic' })],
      'wallet.json',
      { type: 'application/json' },
    );
    await act(async () => {
      Object.defineProperty(walletInput, 'files', { value: [walletFile] });
      walletInput.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 0));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const nextBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Next',
    )!;
    await act(async () => {
      nextBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(container.textContent).toContain('Step 3 of 3');
    expect(container.textContent).toContain('Confirm');
  });
});
