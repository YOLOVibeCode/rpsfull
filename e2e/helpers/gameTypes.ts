/**
 * Game Type Helper Functions for E2E Tests
 */

import { Page } from '@playwright/test';

/**
 * Get the first available game type ID from the game types list
 */
export async function getFirstGameTypeId(page: Page): Promise<string | null> {
  // Try to get from API or from UI
  try {
    // Navigate to a page that loads game types
    await page.goto('/play');
    await page.waitForLoadState('networkidle');

    // Try to get game type from select dropdown
    const gameTypeSelect = page.locator('select[name="gameTypeId"]');
    if (await gameTypeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      const options = gameTypeSelect.locator('option');
      const count = await options.count();
      
      if (count > 1) {
        // Get value of first non-empty option
        for (let i = 1; i < count; i++) {
          const option = options.nth(i);
          const value = await option.getAttribute('value');
          if (value && value !== '') {
            return value;
          }
        }
      }
    }

    // Fallback: try to get from API call
    const response = await page.request.get('http://localhost:4444/api/v1/game-types?active=true');
    if (response.ok()) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return data.data[0].id;
      }
    }
  } catch (error) {
    console.error('Error getting game type ID:', error);
  }

  return null;
}

/**
 * Get game type ID by name
 */
export async function getGameTypeIdByName(page: Page, name: string): Promise<string | null> {
  try {
    const response = await page.request.get('http://localhost:4444/api/v1/game-types?active=true');
    if (response.ok()) {
      const data = await response.json();
      if (data.data) {
        const gameType = data.data.find((gt: any) => gt.name === name);
        if (gameType) {
          return gameType.id;
        }
      }
    }
  } catch (error) {
    console.error('Error getting game type by name:', error);
  }

  return null;
}

