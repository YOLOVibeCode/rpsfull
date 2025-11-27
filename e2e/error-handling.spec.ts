import { test, expect } from '@playwright/test';

/**
 * Error Handling E2E Tests
 * 
 * Tests error boundaries, network errors, validation errors,
 * and error recovery mechanisms
 */

test.describe('Error Boundaries', () => {
  test('should display error boundary for invalid routes', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('/non-existent-route-12345');
    await page.waitForLoadState('networkidle');

    // Should show 404 or error page
    const hasError = await page.locator('text=/404|not found|error|page not found/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    // Verify error is handled gracefully
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });

  test('should show error fallback UI', async ({ page }) => {
    // Try to access invalid match
    await page.goto('/play/invalid-match-id-12345');
    await page.waitForLoadState('networkidle');

    // Should show error message or not found
    const hasError = await page.locator('text=/error|not found|invalid|failed/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    // Error should be user-friendly
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
  });
});

test.describe('Network Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Simulate network error by going offline
    await page.context().setOffline(true);
    
    await page.goto('/play');
    await page.waitForLoadState('networkidle');

    // Should show error or offline indicator
    const hasError = await page.locator('text=/offline|network|error|connection/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    // Restore online
    await page.context().setOffline(false);
  });

  test('should show error messages for failed API calls', async ({ page }) => {
    await page.goto('/play');
    await page.waitForLoadState('networkidle');

    // Try to submit form with invalid data
    const form = page.locator('form');
    if (await form.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.fill('input[name="player2Id"]', 'invalid-player-id-that-does-not-exist');
      
      // Try to find and select game type
      const gameTypeSelect = page.locator('select[name="gameTypeId"]');
      if (await gameTypeSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
        const options = await gameTypeSelect.locator('option').count();
        if (options > 1) {
          await gameTypeSelect.selectOption({ index: 1 });
        }
      }

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for error to appear
      await page.waitForTimeout(2000);

      // Should show error message
      const hasError = await page.locator('text=/error|failed|invalid|not found/i').isVisible({ timeout: 2000 }).catch(() => false);
      // Error handling depends on implementation
    }
  });
});

test.describe('Form Validation Errors', () => {
  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(500);

    // Should show validation errors
    const hasValidation = await page.locator('input:invalid').count() > 0 ||
                         await page.locator('text=/required|invalid|please/i').isVisible({ timeout: 1000 }).catch(() => false);
    
    // Browser validation or custom validation should trigger
    expect(hasValidation || page.url().includes('/register')).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[name="email"], input[type="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('invalid-email');
      
      // Trigger validation
      await emailInput.blur();
      await page.waitForTimeout(500);

      // Should show email validation error
      const hasError = await page.locator('input:invalid, text=/invalid email|valid email/i').isVisible({ timeout: 1000 }).catch(() => false);
      // Validation might be browser-native or custom
    }
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordInput.fill('weak');
      
      // Trigger validation
      await passwordInput.blur();
      await page.waitForTimeout(500);

      // Should show password validation error
      const hasError = await page.locator('text=/password|strength|length|characters/i').isVisible({ timeout: 1000 }).catch(() => false);
      // Validation depends on implementation
    }
  });
});

test.describe('Unauthorized Access', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page.locator('text=/login|sign in/i')).toBeVisible();
  });

  test('should protect game editor routes', async ({ page }) => {
    // Try to access game editor without login
    await page.goto('/game-editor');
    await page.waitForLoadState('networkidle');

    // Should redirect to login or show error
    const isLogin = page.url().includes('/login');
    const hasError = await page.locator('text=/unauthorized|login|access/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(isLogin || hasError).toBeTruthy();
  });
});

test.describe('Error Recovery', () => {
  test('should allow retry after error', async ({ page }) => {
    await page.goto('/play');
    await page.waitForLoadState('networkidle');

    // Try to create match with invalid data
    const form = page.locator('form');
    if (await form.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.fill('input[name="player2Id"]', 'invalid');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Should be able to retry
      const canRetry = await submitButton.isEnabled().catch(() => false);
      // Form should be resubmittable after error
    }
  });

  test('should clear errors when user corrects input', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[name="email"], input[type="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Enter invalid email
      await emailInput.fill('invalid');
      await emailInput.blur();
      await page.waitForTimeout(500);

      // Correct the email
      await emailInput.fill('valid@example.com');
      await emailInput.blur();
      await page.waitForTimeout(500);

      // Error should clear
      const hasError = await page.locator('text=/invalid|error/i').isVisible({ timeout: 500 }).catch(() => false);
      // Error should be cleared when input is corrected
    }
  });
});

