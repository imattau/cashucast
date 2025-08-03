import { defineConfig } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';
import ssbReservedWordsFix from './ssb-reserved-words-fix';

export default defineConfig({
  testDir: './apps/web/playwright',
  testMatch: /.*\.pw\.tsx/,
  ctViteConfig: {
    plugins: [ssbReservedWordsFix(), react()],
  },
});

