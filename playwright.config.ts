import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  timeout: 30_000,
  
  use: {
    browserName: 'chromium',
    trace: 'on-first-retry',
  },

});
