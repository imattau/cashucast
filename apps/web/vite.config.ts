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

export default defineConfig({
  plugins: [ssbReservedWordsFix(), react()],
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
    alias: {
      path: path.resolve(__dirname, 'path-shim.ts'),
      // stub fs for browser compatibility
      fs: path.resolve(__dirname, 'src/empty-fs.js'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [ssbReservedWordsFixEsbuild()],
    },
  },
});
