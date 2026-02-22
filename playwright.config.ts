import { defineConfig, devices } from "@playwright/test";

/**
 * PostFlow Playwright E2E config.
 * Runs against the local Next.js dev server.
 * Set TEST_BASE_URL env var to point at a deployed preview.
 */
export default defineConfig({
    testDir: "./e2e",
    timeout: 30_000,
    expect: { timeout: 10_000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [["html", { open: "never" }], ["line"]],

    use: {
        baseURL: process.env.TEST_BASE_URL ?? "http://localhost:3000",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "on-first-retry",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    // Auto-start Next.js dev server unless TEST_BASE_URL is set
    webServer: process.env.TEST_BASE_URL
        ? undefined
        : {
            command: "npm run dev",
            url: "http://localhost:3000",
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        },
});
