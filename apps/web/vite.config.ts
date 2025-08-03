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
      plugins: [tailwindcss(), autoprefixer()],
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
