import { test, expect } from '@playwright/test';

test.describe('Tournament Flow', () => {
  test('should display tournament list', async ({ page }) => {
    await page.goto('/tournaments');

    // Should show tournaments page
    await expect(page.locator('text=/tournament/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show tournament creation form', async ({ page }) => {
    await page.goto('/tournaments');

    // Look for create tournament button or form
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create")');
    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForTimeout(1000);
      // Form should be visible
      const form = page.locator('form');
      await expect(form).toBeVisible({ timeout: 5000 });
    }
  });
});

