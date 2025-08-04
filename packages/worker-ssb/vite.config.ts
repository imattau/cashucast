/*
 * Licensed under GPL-3.0-or-later
 * Vite config for worker-ssb.
 */
import { defineConfig } from 'vite';
import path from 'path';
import ssbReservedWordsFix, {
  ssbReservedWordsFixEsbuild,
} from '../../ssb-reserved-words-fix';

export default defineConfig({
  plugins: [ssbReservedWordsFix()],
  resolve: {
    dedupe: ['libsodium-wrappers', 'libsodium-wrappers-sumo'],
    alias: {
      // Stub fs to prevent node filesystem access in the worker bundle
      fs: path.resolve(__dirname, 'empty-fs.js'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [ssbReservedWordsFixEsbuild()],
    },
  },
});
