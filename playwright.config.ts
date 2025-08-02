import { defineConfig } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';

export default defineConfig({
  testDir: './apps/web/playwright',
  testMatch: /.*\.pw\.tsx/,
  ctViteConfig: {
    plugins: [react()],
  },
});

