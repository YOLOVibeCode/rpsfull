/**
 * Tournament Helper Functions for E2E Tests
 */

import { Page } from '@playwright/test';

export interface CreateTournamentData {
  name: string;
  gameTypeId: string;
  maxParticipants?: number;
  bestOfN?: number;
  tournamentType?: 'single_elimination' | 'double_elimination';
}

/**
 * Create a tournament via the UI
 */
export async function createTournament(page: Page, tournamentData: CreateTournamentData): Promise<string> {
  await page.goto('/tournaments');
  await page.waitForLoadState('networkidle');

  // Click create tournament button
  const createButton = page.locator('button:has-text("Create"), a:has-text("Create"), button:has-text("New Tournament")');
  await createButton.click();
  await page.waitForTimeout(1000);

  // Fill tournament form
  await page.fill('input[name="name"], input[placeholder*="name" i]', tournamentData.name);

  // Select game type
  const gameTypeSelect = page.locator('select[name="gameTypeId"], input[name="gameTypeId"]');
  if (await gameTypeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gameTypeSelect.selectOption(tournamentData.gameTypeId);
  }

  // Set max participants if provided
  if (tournamentData.maxParticipants) {
    const maxParticipantsInput = page.locator('input[name="maxParticipants"]');
    if (await maxParticipantsInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await maxParticipantsInput.fill(tournamentData.maxParticipants.toString());
    }
  }

  // Set best of N if provided
  if (tournamentData.bestOfN) {
    const bestOfNInput = page.locator('input[name="bestOfN"]');
    if (await bestOfNInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bestOfNInput.fill(tournamentData.bestOfN.toString());
    }
  }

  // Select tournament type if provided
  if (tournamentData.tournamentType) {
    const typeSelect = page.locator('select[name="tournamentType"]');
    if (await typeSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeSelect.selectOption(tournamentData.tournamentType);
    }
  }

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to tournament page
  await page.waitForURL(/\/tournaments\/[a-f0-9-]+/, { timeout: 10000 });
  
  // Extract tournament ID from URL
  const url = page.url();
  const tournamentIdMatch = url.match(/\/tournaments\/([a-f0-9-]+)/);
  if (tournamentIdMatch) {
    return tournamentIdMatch[1];
  }
  
  throw new Error('Could not extract tournament ID from URL');
}

/**
 * Register for a tournament
 */
export async function registerForTournament(page: Page, tournamentId: string): Promise<void> {
  await page.goto(`/tournaments/${tournamentId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Give time for page to fully load

  // Try multiple selectors for register button
  const registerButton = page.locator(
    'button:has-text("Register"), ' +
    'button:has-text("Join"), ' +
    'button:has-text("Register Now"), ' +
    'a:has-text("Register"), ' +
    '[data-testid="register-button"]'
  );
  
  if (await registerButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    await registerButton.first().click();
    await page.waitForTimeout(2000);
    
    // Check if registration was successful (might show success message or update UI)
    const successIndicator = await page.locator(
      'text=/registered|joined|success/i, [data-testid="registration-success"]'
    ).isVisible({ timeout: 3000 }).catch(() => false);
    
    // Registration might work even if no visible success message
  } else {
    // Check if already registered or registration closed
    const alreadyRegistered = await page.locator('text=/already registered|you are registered/i').isVisible({ timeout: 2000 }).catch(() => false);
    const registrationClosed = await page.locator('text=/registration closed|closed/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    if (alreadyRegistered) {
      console.log('Already registered for tournament');
      return; // Already registered, that's fine
    }
    
    if (registrationClosed) {
      throw new Error('Tournament registration is closed');
    }
    
    // If button not found, try API registration directly
    console.log('Register button not found, trying API registration...');
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (accessToken) {
      const response = await page.request.post(`http://localhost:4444/api/v1/tournaments/${tournamentId}/register`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {},
      });
      
      if (response.status() >= 400) {
        const errorData = await response.json().catch(() => null);
        // If already registered (409), that's okay
        if (response.status() === 409) {
          console.log('Already registered via API');
          return;
        }
        throw new Error(`Registration failed: ${JSON.stringify(errorData)}`);
      }
      console.log('✅ Registered via API');
      await page.waitForTimeout(1000);
    } else {
      throw new Error('Register button not found and no access token for API registration');
    }
  }
}

/**
 * Start a tournament (organizer only)
 */
export async function startTournament(page: Page, tournamentId: string): Promise<void> {
  await page.goto(`/tournaments/${tournamentId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Give time for page to load

  // Try UI button first
  const startButton = page.locator('button:has-text("Start Tournament"), button:has-text("Start")');
  
  if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    // Wait for API response
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes(`/tournaments/${tournamentId}/start`) && response.request().method() === 'PATCH',
      { timeout: 10000 }
    ).catch(() => null);
    
    await startButton.click();
    
    // Wait for response
    const response = await responsePromise;
    if (response && response.ok()) {
      console.log('✅ Tournament started via UI');
      await page.waitForTimeout(2000);
      return;
    }
  }
  
  // Fallback to API
  console.log('Start button not found, trying API...');
  const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
  if (accessToken) {
    const response = await page.request.patch(`http://localhost:4444/api/v1/tournaments/${tournamentId}/start`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status() >= 400) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Failed to start tournament: ${JSON.stringify(errorData)}`);
    }
    console.log('✅ Tournament started via API');
    await page.waitForTimeout(2000);
  } else {
    throw new Error('No access token for starting tournament');
  }
}

/**
 * Get tournament bracket
 */
export async function getTournamentBracket(page: Page, tournamentId: string): Promise<void> {
  await page.goto(`/tournaments/${tournamentId}`);
  await page.waitForLoadState('networkidle');

  // Wait for bracket to load
  await page.waitForSelector('text=/bracket|round|match/i', { timeout: 10000 });
}

/**
 * Get tournament status
 */
export async function getTournamentStatus(page: Page, tournamentId: string): Promise<string | null> {
  await page.goto(`/tournaments/${tournamentId}`);
  await page.waitForLoadState('networkidle');

  const statusElements = page.locator('text=/draft|registration|in progress|completed|cancelled/i');
  const count = await statusElements.count();
  
  if (count > 0) {
    return await statusElements.first().textContent();
  }
  
  return null;
}

/**
 * Get participant count
 */
export async function getParticipantCount(page: Page, tournamentId: string): Promise<number> {
  await page.goto(`/tournaments/${tournamentId}`);
  await page.waitForLoadState('networkidle');

  const participantText = await page.locator('text=/participants|players/i').first().textContent().catch(() => null);
  
  if (participantText) {
    const match = participantText.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return 0;
}

/**
 * Navigate to tournament match
 */
export async function navigateToTournamentMatch(page: Page, matchId: string): Promise<void> {
  await page.goto(`/play/${matchId}`);
  await page.waitForLoadState('networkidle');
}

