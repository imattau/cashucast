import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import TestCompose from './TestCompose';

test('posting flow publishes a post', async ({ mount, page }) => {
  await page.addInitScript(() => {
    (window as any).__publishCalled = false;
    class MockWorker {
      onmessage: ((e: any) => void) | null = null;
      postMessage(msg: any) {
        const { method, id } = msg;
        if (method === 'publishPost') {
          (window as any).__publishCalled = true;
          this.onmessage?.({ data: { result: null, id } });
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

  const component = await mount(<TestCompose />);
  const file = new File(['vid'], 'vid.mp4', { type: 'video/mp4' });
  await page.setInputFiles('input[type="file"]', file);
  await component.getByText('Publish').click();
  await expect(await page.evaluate(() => (window as any).__publishCalled)).toBe(true);
});

