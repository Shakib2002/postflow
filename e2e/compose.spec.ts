import { test, expect } from "@playwright/test";

/**
 * Compose page tests — verify the page renders and redirects unauthenticated users.
 * Full interaction tests require an authenticated session (see auth.setup.ts).
 */

test.describe("Compose Page — Unauthenticated", () => {
    test("redirects to login when not authenticated", async ({ page }) => {
        await page.goto("/compose");

        // Should redirect to login
        await page.waitForURL(/\/(login|auth)/i, { timeout: 10_000 });
        await expect(page).toHaveURL(/\/(login|auth)/i);
    });
});

test.describe("Compose Page — Structure", () => {
    test("login page has correct heading", async ({ page }) => {
        await page.goto("/login");
        // Verify the application loads properly (not a blank/error page)
        await expect(page.locator("body")).not.toBeEmpty();
        const title = await page.title();
        expect(title).toMatch(/PostFlow/i);
    });
});
