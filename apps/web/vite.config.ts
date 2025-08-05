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
  return {
    name: 'copy-libsodium-wasm',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const source = fileURLToPath(
        new URL(
          '../../node_modules/libsodium-wrappers-sumo/dist/modules-sumo/libsodium-sumo.wasm',
          import.meta.url,
        ),
      );
      if (existsSync(source)) {
        copyFileSync(source, path.resolve(outDir, 'libsodium-sumo.wasm'));
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
