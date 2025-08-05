/*
 * Licensed under GPL-3.0-or-later
 * Configuration for vite.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ssbReservedWordsFix, {
  ssbReservedWordsFixEsbuild,
} from '../../ssb-reserved-words-fix';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
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
    // Copy and verify during development server startup
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
    // Copy and verify for production builds
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
  plugins: [ssbReservedWordsFix(), react(), copyLibsodiumWasm()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          config: path.resolve(__dirname, '../../tailwind.config.cjs'),
        }),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    dedupe: ['libsodium-wrappers', 'libsodium-wrappers-sumo'],
    alias: {
      path: path.resolve(__dirname, 'path-shim.ts'),
      // stub fs for browser compatibility
      fs: path.resolve(__dirname, 'src/empty-fs.js'),
      // stub other node built-ins for browser compatibility
      crypto: path.resolve(__dirname, 'empty-module.js'),
      stream: path.resolve(__dirname, 'empty-module.js'),
      net: path.resolve(__dirname, 'empty-module.js'),
      assert: path.resolve(__dirname, 'empty-module.js'),
      util: path.resolve(__dirname, 'empty-module.js'),
      querystring: path.resolve(__dirname, 'empty-module.js'),
      os: path.resolve(__dirname, 'empty-module.js'),
      url: path.resolve(__dirname, 'empty-module.js'),
      http: path.resolve(__dirname, 'empty-module.js'),
      https: path.resolve(__dirname, 'empty-module.js'),
      dgram: path.resolve(__dirname, 'empty-module.js'),
      dns: path.resolve(__dirname, 'empty-module.js'),
      'bittorrent-dht': path.resolve(__dirname, 'dht-shim.js'),
      'torrent-discovery': path.resolve(__dirname, 'empty-module.js'),
      // react-easy-crop's CSS was moved under dist in v5
      'react-easy-crop/dist': 'react-easy-crop',
      'ssb-blob-store': path.resolve(
        __dirname,
        '../../packages/ssb-blob-store/index.ts',
      ),
    },
  },
  optimizeDeps: {
    exclude: ['libsodium-wrappers-sumo'],
    esbuildOptions: {
      plugins: [ssbReservedWordsFixEsbuild()],
    },
  },
  build: {
    target: 'esnext',
  },
  worker: {
    format: 'es',
    target: 'esnext',
  },
});
