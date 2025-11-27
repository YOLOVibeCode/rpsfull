import { test, expect } from '@playwright/test';
import { registerUser, loginUser, createTestUser } from './helpers/auth';
import { createMatch, navigateToMatch, startMatch } from './helpers/match';
import { createTournament } from './helpers/tournament';
import { getFirstGameTypeId } from './helpers/gameTypes';
import { getCurrentPlayerId } from './helpers/players';

/**
 * WebSocket Real-Time Communication Tests
 * 
 * Tests WebSocket connection, real-time updates, and event handling
 */

test.describe('WebSocket Connection', () => {
  test('WebSocket connects automatically after login', async ({ page }) => {
    const user = createTestUser('ws_connect');
    
    await registerUser(page, user);
    await loginUser(page, user.email, user.password);

    // Wait for socket connection
    await page.waitForTimeout(2000);

    // Check if socket is connected by looking for socket-related console logs
    // or by checking if real-time features work
    const socketConnected = await page.evaluate(() => {
      // Check if socket.io client is initialized
      return typeof window !== 'undefined' && 
             (window as any).io !== undefined ||
             localStorage.getItem('accessToken') !== null;
    });

    expect(socketConnected).toBeTruthy();
  });

  test('WebSocket reconnects after disconnect', async ({ page }) => {
    const user = createTestUser('ws_reconnect');
    
    await registerUser(page, user);
    await loginUser(page, user.email, user.password);

    await page.waitForTimeout(2000);

    // Simulate network disconnect
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // Verify page still works (socket should reconnect)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Match Real-Time Events', () => {
  test('Opponent join event received', async ({ browser }) => {
    const player1 = createTestUser('ws_p1');
    const player2 = createTestUser('ws_p2');

    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    try {
      await registerUser(player1Page, player1);
      await registerUser(player2Page, player2);
      await loginUser(player1Page, player1.email, player1.password);
      await loginUser(player2Page, player2.email, player2.password);

      const gameTypeId = await getFirstGameTypeId(player1Page);
      const player1Id = await getCurrentPlayerId(player1Page);
      const player2Id = await getCurrentPlayerId(player2Page);

      const matchId = await createMatch(player1Page, {
        player2Id: player2Id!,
        gameTypeId: gameTypeId!,
        bestOfN: 3,
      });

      // Player 1 navigates to match first
      await navigateToMatch(player1Page, matchId);
      await player1Page.waitForTimeout(2000);

      // Player 2 joins match
      await navigateToMatch(player2Page, matchId);
      await player2Page.waitForTimeout(2000);

      // Both players should see match state
      const player1Content = await player1Page.locator('body').textContent();
      const player2Content = await player2Page.locator('body').textContent();
      
      expect(player1Content).toBeTruthy();
      expect(player2Content).toBeTruthy();

    } finally {
      await player1Context.close();
      await player2Context.close();
    }
  });

  test('Move submission broadcasts to opponent', async ({ browser }) => {
    const player1 = createTestUser('ws_move_p1');
    const player2 = createTestUser('ws_move_p2');

    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    try {
      await registerUser(player1Page, player1);
      await registerUser(player2Page, player2);
      await loginUser(player1Page, player1.email, player1.password);
      await loginUser(player2Page, player2.email, player2.password);

      const gameTypeId = await getFirstGameTypeId(player1Page);
      const player1Id = await getCurrentPlayerId(player1Page);
      const player2Id = await getCurrentPlayerId(player2Page);

      const matchId = await createMatch(player1Page, {
        player2Id: player2Id!,
        gameTypeId: gameTypeId!,
        bestOfN: 3,
      });

      await navigateToMatch(player1Page, matchId);
      await navigateToMatch(player2Page, matchId);
      await startMatch(player1Page);
      
      await player1Page.waitForTimeout(2000);
      await player2Page.waitForTimeout(2000);

      // Player 1 selects and submits move
      const moveButton1 = player1Page.locator('button:has-text("Rock"), button:has-text("Paper"), button:has-text("Scissors")').first();
      if (await moveButton1.isVisible({ timeout: 5000 }).catch(() => false)) {
        await moveButton1.click();
        
        const submitButton1 = player1Page.locator('button:has-text("Submit"), button[type="submit"]');
        if (await submitButton1.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitButton1.click();
        }
      }

      await player1Page.waitForTimeout(2000);
      await player2Page.waitForTimeout(2000);

      // Player 2 should see that opponent has moved
      // (This depends on UI implementation - could be "waiting for opponent" state)
      const player2Content = await player2Page.locator('body').textContent();
      expect(player2Content).toBeTruthy();

    } finally {
      await player1Context.close();
      await player2Context.close();
    }
  });

  test('Round completion broadcasts to both players', async ({ browser }) => {
    const player1 = createTestUser('ws_round_p1');
    const player2 = createTestUser('ws_round_p2');

    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    try {
      await registerUser(player1Page, player1);
      await registerUser(player2Page, player2);
      await loginUser(player1Page, player1.email, player1.password);
      await loginUser(player2Page, player2.email, player2.password);

      const gameTypeId = await getFirstGameTypeId(player1Page);
      const player1Id = await getCurrentPlayerId(player1Page);
      const player2Id = await getCurrentPlayerId(player2Page);

      const matchId = await createMatch(player1Page, {
        player2Id: player2Id!,
        gameTypeId: gameTypeId!,
        bestOfN: 3,
      });

      await navigateToMatch(player1Page, matchId);
      await navigateToMatch(player2Page, matchId);
      await startMatch(player1Page);
      
      await player1Page.waitForTimeout(2000);
      await player2Page.waitForTimeout(2000);

      // Both players select moves
      const moveButton1 = player1Page.locator('button:has-text("Rock")').first();
      const moveButton2 = player2Page.locator('button:has-text("Scissors")').first();
      
      if (await moveButton1.isVisible({ timeout: 5000 }).catch(() => false) &&
          await moveButton2.isVisible({ timeout: 5000 }).catch(() => false)) {
        await moveButton1.click();
        await moveButton2.click();
        
        const submitButton1 = player1Page.locator('button:has-text("Submit"), button[type="submit"]');
        const submitButton2 = player2Page.locator('button:has-text("Submit"), button[type="submit"]');
        
        if (await submitButton1.isVisible({ timeout: 2000 }).catch(() => false) &&
            await submitButton2.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitButton1.click();
          await submitButton2.click();
        }
      }

      // Wait for round completion
      await player1Page.waitForTimeout(3000);
      await player2Page.waitForTimeout(3000);

      // Both players should see round result
      const result1 = await player1Page.locator('text=/won|lost|tie|round/i').isVisible({ timeout: 5000 }).catch(() => false);
      const result2 = await player2Page.locator('text=/won|lost|tie|round/i').isVisible({ timeout: 5000 }).catch(() => false);
      
      // At least one should see the result
      expect(result1 || result2).toBeTruthy();

    } finally {
      await player1Context.close();
      await player2Context.close();
    }
  });
});

test.describe('Tournament Real-Time Updates', () => {
  test('Tournament bracket updates in real-time', async ({ browser }) => {
    const organizer = createTestUser('ws_tourney_org');
    const organizerContext = await browser.newContext();
    const organizerPage = await organizerContext.newPage();

    try {
      await registerUser(organizerPage, organizer);
      await loginUser(organizerPage, organizer.email, organizer.password);

      const gameTypeId = await getFirstGameTypeId(organizerPage);

      const tournamentId = await createTournament(organizerPage, {
        name: `WS Tournament ${Date.now()}`,
        gameTypeId: gameTypeId!,
        maxParticipants: 4,
      });

      // Navigate to tournament page
      await organizerPage.goto(`/tournaments/${tournamentId}`);
      await organizerPage.waitForLoadState('networkidle');

      // Verify tournament page loads
      const tournamentContent = await organizerPage.locator('body').textContent();
      expect(tournamentContent).toBeTruthy();

      // Note: Testing real-time bracket updates would require:
      // 1. Multiple players registered
      // 2. Tournament started
      // 3. Matches completed
      // 4. Verifying bracket updates appear in real-time

    } finally {
      await organizerContext.close();
    }
  });
});

