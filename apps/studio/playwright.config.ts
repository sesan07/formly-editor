import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const workspaceRoot = resolve(__dirname, '../..');
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: resolve(workspaceRoot, 'tmp/playwright/test-results'),
  reporter: [
    [
      'html',
      {
        outputFolder: resolve(workspaceRoot, 'dist/.playwright/apps/studio/playwright-report'),
        open: 'never',
      },
    ],
  ],
  use: { baseURL, headless: true, trace: 'on-first-retry' },
  webServer: {
    command: 'npm start',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180000,
    cwd: workspaceRoot,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
