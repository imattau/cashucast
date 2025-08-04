/*
 * Licensed under GPL-3.0-or-later
 * Test suite for onboarding.
 */
import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import Onboarding, { resetOnboardingState } from '../src/routes/Onboarding';
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

test('onboarding step-1 buttons have primary background color', async ({ mount }) => {
  resetOnboardingState();
  useProfile.setState({ profile: undefined });
  const component = await mount(<Onboarding />);
  const newAccount = component.getByRole('button', { name: 'New Account' });
  await expect(newAccount).toHaveCSS('background-color', 'rgb(255, 7, 89)');
  const importExisting = component.getByRole('button', {
    name: 'Import Existing',
  });
  await expect(importExisting).toHaveCSS('background-color', 'rgb(255, 7, 89)');
});

