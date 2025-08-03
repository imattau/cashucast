import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ssbReservedWordsFix, {
  ssbReservedWordsFixEsbuild,
} from '../../ssb-reserved-words-fix';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [ssbReservedWordsFix(), react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  resolve: {
    alias: {
      path: resolve(__dirname, 'path-shim.ts'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [ssbReservedWordsFixEsbuild()],
    },
  },
});
