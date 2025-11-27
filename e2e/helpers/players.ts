/**
 * Player Helper Functions for E2E Tests
 */

import { Page } from '@playwright/test';

/**
 * Search for a player and get their ID
 */
export async function searchPlayer(page: Page, searchTerm: string): Promise<string | null> {
  try {
    // Navigate to players page or use search API
    const response = await page.request.get(`http://localhost:4444/api/v1/players?search=${encodeURIComponent(searchTerm)}`);
    
    if (response.ok()) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return data.data[0].id;
      }
    }
  } catch (error) {
    console.error('Error searching for player:', error);
  }

  return null;
}

/**
 * Get current user's player ID
 */
export async function getCurrentPlayerId(page: Page): Promise<string | null> {
  try {
    const response = await page.request.get('http://localhost:4444/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('accessToken'))}`,
      },
    });

    if (response.ok()) {
      const data = await response.json();
      if (data.data && data.data.player) {
        return data.data.player.id;
      }
    }
  } catch (error) {
    console.error('Error getting current player ID:', error);
  }

  return null;
}

