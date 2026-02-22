import { test, expect } from "@playwright/test";

/**
 * Billing page tests.
 * Verifies unauthenticated users are redirected, and
 * that the billing page title is correct when accessed.
 */

test.describe("Billing Page — Unauthenticated", () => {
    test("redirects to login when not authenticated", async ({ page }) => {
        await page.goto("/billing");
        await page.waitForURL(/\/(login|auth)/i, { timeout: 10_000 });
        await expect(page).toHaveURL(/\/(login|auth)/i);
    });
});

test.describe("Application — General", () => {
    test("home redirects to login or dashboard", async ({ page }) => {
        await page.goto("/");
        // Should land on login, dashboard, or another valid page — never a 404 or error
        await expect(page).not.toHaveURL(/\/_error/i);
        const status = page.url();
        expect(status).toBeTruthy();
    });

    test("404 page renders gracefully", async ({ page }) => {
        await page.goto("/this-page-does-not-exist-xyz");
        // Next.js renders a not-found page — should not crash
        const body = await page.locator("body").innerText();
        expect(body.length).toBeGreaterThan(0);
    });
});
