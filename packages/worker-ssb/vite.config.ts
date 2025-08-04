/*
 * Licensed under GPL-3.0-or-later
 * Vite config for worker-ssb.
 */
import { defineConfig } from 'vite';
import path from 'path';
import ssbReservedWordsFix, {
  ssbReservedWordsFixEsbuild,
} from '../../ssb-reserved-words-fix';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [
    ssbReservedWordsFix(),
    NodeGlobalsPolyfillPlugin({ buffer: true, process: true }),
    NodeModulesPolyfillPlugin(),
  ],
  define: { global: 'globalThis' },
  resolve: {
    dedupe: ['libsodium-wrappers', 'libsodium-wrappers-sumo'],
    alias: {
      // Stub fs to prevent node filesystem access in the worker bundle
      fs: path.resolve(__dirname, 'empty-fs.js'),
      'ssb-blob-store': path.resolve(
        __dirname,
        '../ssb-blob-store/index.ts',
      ),
    },
  },
  optimizeDeps: {
    exclude: ['libsodium-wrappers-sumo'],
    esbuildOptions: {
      plugins: [
        ssbReservedWordsFixEsbuild(),
        NodeGlobalsPolyfillPlugin({ buffer: true, process: true }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
});
