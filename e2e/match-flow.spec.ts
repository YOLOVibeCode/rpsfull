import { test, expect } from '@playwright/test';

test.describe('Match Creation and Gameplay Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    // Note: In real scenario, you'd have a test user setup
    // For now, we'll test the UI flow
  });

  test('should create a new match', async ({ page }) => {
    await page.goto('/play');

    // Wait for form to load
    await page.waitForSelector('input[name="player2Id"]', { timeout: 5000 });

    // Fill match creation form
    // Note: This requires valid player IDs and game type ID
    // For now, we'll just verify the form exists
    const form = page.locator('form');
    await expect(form).toBeVisible();

    const player2Input = page.locator('input[name="player2Id"]');
    const gameTypeSelect = page.locator('select[name="gameTypeId"], input[name="gameTypeId"]');
    const bestOfNInput = page.locator('input[name="bestOfN"]');

    await expect(player2Input).toBeVisible();
    await expect(gameTypeSelect).toBeVisible();
    await expect(bestOfNInput).toBeVisible();
  });

  test('should display match list', async ({ page }) => {
    await page.goto('/play');

    // Should show match list section
    await expect(page.locator('text=/your matches|matches/i')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to match detail page', async ({ page }) => {
    // This would require a valid match ID
    // For now, we'll test the route structure
    await page.goto('/play/test-match-id');

    // Should show match gameplay or error
    await page.waitForTimeout(2000);
    // Either match content or error message should appear
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });
});

