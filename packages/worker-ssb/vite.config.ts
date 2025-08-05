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
import { copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

function copyLibsodiumWasm() {
  let outDir: string;
  let rootDir: string;
  const filename = 'libsodium-sumo.wasm';
  const source = fileURLToPath(
    new URL(
      '../../node_modules/libsodium-wrappers-sumo/dist/modules-sumo/libsodium-sumo.wasm',
      import.meta.url,
    ),
  );
  return {
    name: 'copy-libsodium-wasm',
    configResolved(config) {
      outDir = config.build.outDir;
      rootDir = config.root;
    },
    configureServer() {
      const dest = path.resolve(rootDir, filename);
      if (!existsSync(source)) {
        console.warn(`missing ${filename} at ${source}`);
        return;
      }
      copyFileSync(source, dest);
      if (!existsSync(dest)) {
        console.warn(`failed to copy ${filename} to dev output`);
      }
    },
    closeBundle() {
      const dest = path.resolve(outDir, filename);
      if (!existsSync(source)) {
        this.error(`missing ${filename} at ${source}`);
      }
      copyFileSync(source, dest);
      if (!existsSync(dest)) {
        this.error(`failed to copy ${filename} to ${dest}`);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    ssbReservedWordsFix(),
    NodeGlobalsPolyfillPlugin({ buffer: true, process: true }),
    NodeModulesPolyfillPlugin(),
    copyLibsodiumWasm(),
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
    exclude: ['libsodium-wrappers-sumo', 'libsodium-sumo'],
    esbuildOptions: {
      plugins: [
        ssbReservedWordsFixEsbuild(),
        NodeGlobalsPolyfillPlugin({ buffer: true, process: true }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
});
