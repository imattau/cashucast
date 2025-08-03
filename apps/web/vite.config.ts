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
      path: resolve(__dirname, 'path-shim.ts'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [ssbReservedWordsFixEsbuild()],
    },
  },
});
