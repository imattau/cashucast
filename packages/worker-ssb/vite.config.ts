/*
 * Licensed under GPL-3.0-or-later
 * Vite config for worker-ssb.
 */
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Stub fs to prevent node filesystem access in the worker bundle
      fs: path.resolve(__dirname, 'empty-fs.js'),
    },
  },
});
