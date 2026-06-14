import { defineConfig, devices } from '@playwright/test'

// E2E front-only : on lance le dev server en mode mock (VITE_USE_MOCK=true) — pas
// de backend requis. Les flux testés sont déterministes (mocks + script onboarding).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: { VITE_USE_MOCK: 'true' },
    timeout: 60_000,
  },
})
