/**
 * Explicit GPU checks of the built interim hero with software and disabled WebGL.
 * @packageDocumentation
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/hero',
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 120000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'local-chromium',
      testIgnore: '**/no-webgl.spec.ts',
      use: {
        browserName: 'chromium',
        launchOptions: { args: ['--enable-unsafe-swiftshader'] },
      },
    },
    {
      name: 'no-webgl',
      testMatch: '**/no-webgl.spec.ts',
      use: {
        browserName: 'chromium',
        launchOptions: { args: ['--disable-webgl'] },
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4174',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
