/**
 * Authentication Helper Functions for E2E Tests
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  username?: string;
}

/**
 * Register a new user via the UI
 */
export async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');

  // Wait for form to be ready
  await page.waitForSelector('input[name="username"]', { timeout: 5000 });

  if (user.username) {
    await page.fill('input[name="username"]', user.username);
  }
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  // Note: Registration form doesn't have confirmPassword field
  // Optional fields (firstName, lastName, displayName) are left empty
  // The frontend should handle empty strings, but if validation fails,
  // we may need to ensure they're not sent or are undefined

  // Wait a moment for any validation checks
  await page.waitForTimeout(1000);

  await page.click('button[type="submit"]');
  
  // Wait for redirect or success message (non-blocking - continue even if timeout)
  try {
    await page.waitForURL(/\/dashboard|\/login|\/verify-email/, { timeout: 15000 });
  } catch (error) {
    // If redirect doesn't happen, wait for network to settle and continue
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    // Check if we're still on register page (might be validation error)
    const currentUrl = page.url();
    if (currentUrl.includes('/register')) {
      // Wait a bit more for any error messages
      await page.waitForTimeout(2000);
    }
  }
}

/**
 * Login a user via the UI
 */
export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  // Wait for form to be ready
  await page.waitForTimeout(500);
  
  // Listen for API response
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes('/auth/login'),
    { timeout: 10000 }
  ).catch(() => null);
  
  await page.click('button[type="submit"]');
  
  // Wait for API response
  const response = await responsePromise;
  if (response) {
    const status = response.status();
    if (status >= 400) {
      const responseData = await response.json().catch(() => null);
      throw new Error(`Login API failed with status ${status}: ${JSON.stringify(responseData)}`);
    }
  }

  // Wait for either redirect or error message
  try {
    // Wait for redirect to dashboard (as per login page code)
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  } catch (error) {
    // Check if there's an error message on the page
    await page.waitForTimeout(2000); // Give time for error to appear
    
    const errorMessage = await page.locator('text=/error|failed|invalid|incorrect/i').isVisible({ timeout: 2000 }).catch(() => false);
    if (errorMessage) {
      const errorText = await page.locator('text=/error|failed|invalid|incorrect/i').first().textContent().catch(() => 'Unknown error');
      throw new Error(`Login failed: ${errorText}`);
    }
    
    // Check if we're still on login page (might be a validation error)
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Check for validation errors
      const validationError = await page.locator('text=/required|invalid|please/i').isVisible({ timeout: 2000 }).catch(() => false);
      if (validationError) {
        const errorText = await page.locator('text=/required|invalid|please/i').first().textContent().catch(() => 'Validation error');
        throw new Error(`Login validation failed: ${errorText}`);
      }
      
      // Check if token exists (might have succeeded but redirect failed)
      const isAuth = await page.evaluate(() => {
        return !!localStorage.getItem('accessToken');
      });
      
      if (isAuth) {
        // Token exists but no redirect - navigate manually
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        return;
      }
      
      throw new Error(`Login failed - no redirect and no access token. Current URL: ${currentUrl}`);
    }
    
    // If we're not on login page, check token
    const isAuth = await page.evaluate(() => {
      return !!localStorage.getItem('accessToken');
    });
    
    if (!isAuth) {
      throw new Error(`Login failed - no access token found. Current URL: ${currentUrl}`);
    }
  }
  
  await page.waitForLoadState('networkidle');
  
  // Verify authentication succeeded by checking for token
  const isAuth = await page.evaluate(() => {
    return !!localStorage.getItem('accessToken');
  });
  
  if (!isAuth) {
    throw new Error('Login failed - no access token found after redirect');
  }
}

/**
 * Logout current user
 */
export async function logoutUser(page: Page): Promise<void> {
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
  
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL(/\/login/, { timeout: 5000 });
  }
}

/**
 * Create a unique test user
 */
export function createTestUser(prefix: string = 'test'): TestUser {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return {
    email: `${prefix}_${timestamp}_${random}@test.com`,
    password: 'TestPassword123!',
    username: `${prefix}_user_${timestamp}_${random}`,
  };
}

/**
 * Get current user ID from localStorage (if available)
 */
export async function getCurrentUserId(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || null;
      } catch {
        return null;
      }
    }
    return null;
  });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  return token !== null;
}

