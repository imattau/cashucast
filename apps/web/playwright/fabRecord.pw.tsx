/*
 * Licensed under GPL-3.0-or-later
 * Test suite for FabRecord long press behavior.
 */
import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import FabRecord from '../../shared/ui/FabRecord';

// Short tap should navigate to /record

test('short tap navigates to /record', async ({ mount, page }) => {
  await mount(<FabRecord className="absolute bottom-4 left-1/2" />);
  await page.getByRole('button', { name: 'Record' }).click();
  await expect(page).toHaveURL('/record');
});

// Long press should open file selector and navigate to /compose

test('long press opens file selector and navigates to /compose', async ({ mount, page }) => {
  await mount(<FabRecord className="absolute bottom-4 left-1/2" />);
  const button = page.getByRole('button', { name: 'Record' });
  await button.dispatchEvent('mousedown');
  await page.waitForTimeout(600);
  const file = new File(['vid'], 'vid.webm', { type: 'video/webm' });
  await page.setInputFiles('input[type="file"]', file);
  await button.dispatchEvent('mouseup');
  await expect(page).toHaveURL('/compose');
  const name = await page.evaluate(() => window.recordedFile?.name);
  expect(name).toBe('vid.webm');
});
