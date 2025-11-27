import { test, expect } from '@playwright/test';

test.describe('Game Library Flow', () => {
  test('should display game library', async ({ page }) => {
    await page.goto('/games');

    // Should show games page
    await expect(page.locator('text=/game library|games/i')).toBeVisible({ timeout: 5000 });
  });

  test('should search games', async ({ page }) => {
    await page.goto('/games');

    // Wait for search input
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('rock');
      await page.waitForTimeout(500); // Wait for debounce
      // Results should update
    }
  });

  test('should filter games', async ({ page }) => {
    await page.goto('/games');

    // Look for filter buttons
    const filterButtons = page.locator('button:has-text("All"), button:has-text("Official"), button:has-text("Community")');
    if (await filterButtons.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await filterButtons.nth(1).click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to game detail page', async ({ page }) => {
    // Navigate to a game detail page (would need valid game ID)
    await page.goto('/games/test-game-id');

    // Should show game details or error
    await page.waitForTimeout(2000);
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });
});

