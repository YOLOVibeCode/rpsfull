/**
 * Match Helper Functions for E2E Tests
 */

import { Page } from '@playwright/test';

export interface CreateMatchData {
  player2Id: string;
  gameTypeId: string;
  bestOfN?: number;
  playMode?: 'digital' | 'live';
}

/**
 * Create a match via the UI
 */
export async function createMatch(page: Page, matchData: CreateMatchData): Promise<string> {
  await page.goto('/play');
  await page.waitForLoadState('networkidle');

  // Fill match creation form
  await page.fill('input[name="player2Id"]', matchData.player2Id);
  
  // Select game type if dropdown exists
  const gameTypeSelect = page.locator('select[name="gameTypeId"]');
  if (await gameTypeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gameTypeSelect.selectOption(matchData.gameTypeId);
  } else {
    // Try input field
    const gameTypeInput = page.locator('input[name="gameTypeId"]');
    if (await gameTypeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await gameTypeInput.fill(matchData.gameTypeId);
    }
  }

  // Set best of N if provided
  if (matchData.bestOfN) {
    const bestOfNInput = page.locator('input[name="bestOfN"]');
    if (await bestOfNInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bestOfNInput.fill(matchData.bestOfN.toString());
    }
  }

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to match page
  await page.waitForURL(/\/play\/[a-f0-9-]+/, { timeout: 10000 });
  
  // Extract match ID from URL
  const url = page.url();
  const matchIdMatch = url.match(/\/play\/([a-f0-9-]+)/);
  if (matchIdMatch) {
    return matchIdMatch[1];
  }
  
  throw new Error('Could not extract match ID from URL');
}

/**
 * Navigate to match page
 */
export async function navigateToMatch(page: Page, matchId: string): Promise<void> {
  await page.goto(`/play/${matchId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Start a match (if user is player 1)
 */
export async function startMatch(page: Page): Promise<void> {
  const startButton = page.locator('button:has-text("Start Match"), button:has-text("Start")');
  
  if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await startButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Select a move in the match
 */
export async function selectMove(page: Page, move: string): Promise<void> {
  // Look for move buttons (Rock, Paper, Scissors, etc.)
  const moveButton = page.locator(`button:has-text("${move}"), button[data-move="${move}"]`);
  
  if (await moveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await moveButton.click();
    await page.waitForTimeout(500);
  } else {
    throw new Error(`Move button for "${move}" not found`);
  }
}

/**
 * Submit the selected move
 */
export async function submitMove(page: Page): Promise<void> {
  const submitButton = page.locator('button:has-text("Submit"), button:has-text("Play"), button[type="submit"]');
  
  if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Wait for round result to appear
 */
export async function waitForRoundResult(page: Page, timeout: number = 10000): Promise<void> {
  // Wait for round result animation or result text
  await page.waitForSelector(
    'text=/won|lost|tie|round/i, [data-testid="round-result"], .round-result',
    { timeout }
  );
}

/**
 * Wait for match completion
 */
export async function waitForMatchCompletion(page: Page, timeout: number = 30000): Promise<void> {
  // Wait for match completion message or confetti
  await page.waitForSelector(
    'text=/match complete|winner|congratulations/i, [data-testid="match-complete"], .confetti',
    { timeout }
  );
}

/**
 * Get current match score
 */
export async function getMatchScore(page: Page): Promise<{ player1: number; player2: number } | null> {
  const scoreText = await page.locator('text=/\\d+.*\\d+/').first().textContent().catch(() => null);
  
  if (scoreText) {
    const match = scoreText.match(/(\d+).*?(\d+)/);
    if (match) {
      return {
        player1: parseInt(match[1]),
        player2: parseInt(match[2]),
      };
    }
  }
  
  return null;
}

/**
 * Check if match is in progress
 */
export async function isMatchInProgress(page: Page): Promise<boolean> {
  const inProgressText = page.locator('text=/in progress|playing/i');
  return await inProgressText.isVisible({ timeout: 2000 }).catch(() => false);
}

/**
 * Get match status
 */
export async function getMatchStatus(page: Page): Promise<string | null> {
  const statusElements = page.locator('text=/pending|in progress|completed|cancelled/i');
  const count = await statusElements.count();
  
  if (count > 0) {
    return await statusElements.first().textContent();
  }
  
  return null;
}

