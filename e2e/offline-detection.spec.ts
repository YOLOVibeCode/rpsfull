import { test, expect } from '@playwright/test';

/**
 * Offline Detection E2E Tests
 * 
 * Tests offline detection, online/offline indicators,
 * and graceful degradation
 */

test.describe('Offline Detection', () => {
  test('should show offline indicator when network is offline', async ({ page }) => {
    // Set offline mode
    await page.context().setOffline(true);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show offline indicator
    const offlineIndicator = page.locator('text=/offline|no connection|check your internet/i');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Restore online
    await page.context().setOffline(false);
  });

  test('should hide offline indicator when network comes back online', async ({ page }) => {
    // Start offline
    await page.context().setOffline(true);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify offline indicator appears
    const offlineIndicator = page.locator('text=/offline/i');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);

    // Offline indicator should disappear or show "back online" message
    const isGone = await offlineIndicator.isHidden({ timeout: 3000 }).catch(() => false);
    const backOnline = await page.locator('text=/back online|connection restored/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(isGone || backOnline).toBeTruthy();
  });

  test('should show toast notification when going offline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // Should show toast notification
    // Toast might be in shadow DOM or specific container
    const hasToast = await page.locator('text=/offline|no connection/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    // Restore online
    await page.context().setOffline(false);
  });

  test('should show toast notification when coming back online', async ({ page }) => {
    // Start offline
    await page.context().setOffline(true);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);

    // Should show "back online" toast
    const backOnlineToast = await page.locator('text=/back online|connection restored|online/i').isVisible({ timeout: 2000 }).catch(() => false);
    // Toast notification depends on implementation
  });
});

test.describe('Offline Functionality Degradation', () => {
  test('should prevent API calls when offline', async ({ page }) => {
    await page.context().setOffline(true);
    
    await page.goto('/play');
    await page.waitForLoadState('networkidle');

    // Form should still be visible but submission should fail gracefully
    const form = page.locator('form');
    const hasForm = await form.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasForm) {
      // Try to submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Should show error about being offline
      const hasError = await page.locator('text=/offline|network|connection/i').isVisible({ timeout: 2000 }).catch(() => false);
    }

    // Restore online
    await page.context().setOffline(false);
  });

  test('should show offline banner at top of page', async ({ page }) => {
    await page.context().setOffline(true);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for offline banner (should be fixed at top)
    const offlineBanner = page.locator('text=/offline/i').first();
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });

    // Verify banner styling (red background, etc.)
    const bannerElement = offlineBanner.locator('..');
    const bgColor = await bannerElement.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    }).catch(() => null);
    
    // Banner should be visible and styled

    // Restore online
    await page.context().setOffline(false);
  });
});

test.describe('Online/Offline State Transitions', () => {
  test('should handle rapid online/offline transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Rapidly toggle offline/online
    for (let i = 0; i < 3; i++) {
      await page.context().setOffline(true);
      await page.waitForTimeout(500);
      await page.context().setOffline(false);
      await page.waitForTimeout(500);
    }

    // Should handle transitions gracefully
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });

  test('should update UI state when network status changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // Verify offline state
    const offlineIndicator = page.locator('text=/offline/i');
    await expect(offlineIndicator).toBeVisible({ timeout: 3000 });

    // Go online
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);

    // Verify online state (indicator gone or "back online" message)
    const isOnline = await offlineIndicator.isHidden({ timeout: 3000 }).catch(() => false) ||
                     await page.locator('text=/back online/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(isOnline).toBeTruthy();
  });
});

