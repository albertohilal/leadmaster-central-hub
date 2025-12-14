// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3010',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  projects: [
    {
      name: 'API Tests',
      testMatch: '**/*.api.spec.ts',
    },
  ],
};

module.exports = config;
