import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ssbReservedWordsFix, {
  ssbReservedWordsFixEsbuild,
} from '../../ssb-reserved-words-fix';
import { resolve } from 'path';

export default defineConfig({
  plugins: [ssbReservedWordsFix(), react()],
  resolve: {
    alias: {
      fs: resolve(__dirname, 'fs-shim.ts'),
      path: resolve(__dirname, 'path-shim.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['ssb-blobs'],
    esbuildOptions: {
      plugins: [ssbReservedWordsFixEsbuild()],
    },
  },
});
