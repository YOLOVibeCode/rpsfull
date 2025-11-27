import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: false, // Set to false to avoid rate limiting issues in auth tests
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Continue running all tests even if some fail (non-blocking) */
  maxFailures: undefined, // No limit - run all tests regardless of failures
  /* Timeout for each test */
  timeout: 60 * 1000, // 60 seconds per test
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4445',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd packages/backend && TEST_MODE=true PLAYWRIGHT=true pnpm dev',
      url: 'http://localhost:4444/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        TEST_MODE: 'true',
        PLAYWRIGHT: 'true',
        NODE_ENV: 'test',
      },
    },
    {
      command: 'cd packages/frontend && pnpm dev',
      url: 'http://localhost:4445',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});

