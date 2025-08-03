/*
 * Licensed under GPL-3.0-or-later
 * Configuration for playwright.
 */
import { defineConfig } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';
import ssbReservedWordsFix, {
  ssbReservedWordsFixEsbuild,
} from './ssb-reserved-words-fix';

export default defineConfig({
  testDir: './apps/web/playwright',
  testMatch: /.*\.pw\.tsx/,
  ctViteConfig: {
    plugins: [ssbReservedWordsFix(), react()],
    optimizeDeps: {
      esbuildOptions: {
        plugins: [ssbReservedWordsFixEsbuild()],
      },
    },
  },
});

