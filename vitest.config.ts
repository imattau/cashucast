/*
 * Licensed under GPL-3.0-or-later
 * Configuration for vitest.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      'react-easy-crop/dist': 'react-easy-crop',
    },
  },
});
