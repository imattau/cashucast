/*
 * Licensed under GPL-3.0-or-later
 * Test suite for onboarding.
 */
import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import Onboarding from '../src/routes/Onboarding';
import { useProfile } from '../shared/store/profile';

test('onboarding new account flow', async ({ mount, page }) => {
  await page.addInitScript(() => {
    (window as any).__publishCalled = false;
    class MockWorker {
      url: string;
      onmessage: ((e: any) => void) | null = null;
      constructor(url: string) {
        this.url = url;
      }
      postMessage(msg: any) {
        const { method, id } = msg;
        if (method === 'initKeys') {
          this.onmessage?.({ data: { result: { pk: 'pk', sk: 'sk' }, id } });
        } else if (method === 'initWallet') {
          this.onmessage?.({ data: { result: 'mnemonic', id } });
        }
      }
      addEventListener(type: string, cb: any) {
        if (type === 'message') this.onmessage = cb;
      }
      removeEventListener() {}
      terminate() {}
    }
    // @ts-ignore
    window.Worker = MockWorker;
  });

  useProfile.setState({ profile: undefined });
  const component = await mount(<Onboarding />);
  await component.getByText('New Account').click();
  await page.fill('input[placeholder="Username"]', 'alice');
  await component.getByText('Confirm').click();
  await expect(page).toHaveURL('/');
});

