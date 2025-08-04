/*
 * Licensed under GPL-3.0-or-later
 * Configuration for vitest.
 */
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      'react-easy-crop/dist': 'react-easy-crop',
      'ssb-blob-store': fileURLToPath(
        new URL('./packages/ssb-blob-store/index.ts', import.meta.url),
      ),
    },
  },
});
