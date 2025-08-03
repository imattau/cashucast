import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ssbReservedWordsFix, {
  ssbReservedWordsFixEsbuild,
} from '../../ssb-reserved-words-fix';

export default defineConfig({
  plugins: [ssbReservedWordsFix(), react()],
  optimizeDeps: {
    exclude: ['ssb-blobs'],
    esbuildOptions: {
      plugins: [ssbReservedWordsFixEsbuild()],
    },
  },
});
