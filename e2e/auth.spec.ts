import { test, expect } from "@playwright/test";

/**
 * Auth flow tests — login & signup pages render correctly.
 * These tests do NOT submit credentials — they verify UX elements
 * render and the forms are accessible without hitting external services.
 */

test.describe("Auth — Login Page", () => {
    test("renders the login form", async ({ page }) => {
        await page.goto("/login");

        // Page title
        await expect(page).toHaveTitle(/PostFlow/i);

        // Email and password fields
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/password/i)).toBeVisible();

        // Submit button
        await expect(
            page.getByRole("button", { name: /sign in|log in/i })
        ).toBeVisible();

        // Link to signup
        await expect(page.getByRole("link", { name: /sign up|create account/i })).toBeVisible();
    });

    test("shows validation error for empty submission", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("button", { name: /sign in|log in/i }).click();

        // Expect HTML5 validation or custom error message
        const emailField = page.getByLabel(/email/i);
        await expect(emailField).toBeFocused();
    });
});

test.describe("Auth — Signup Page", () => {
    test("renders the signup form", async ({ page }) => {
        await page.goto("/signup");

        await expect(page).toHaveTitle(/PostFlow/i);
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /sign up|create account/i })).toBeVisible();
    });
});
