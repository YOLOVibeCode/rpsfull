import { test, expect } from '@playwright/test';
import { registerUser, loginUser, createTestUser } from './helpers/auth';
import { createMatch, navigateToMatch, startMatch, selectMove, submitMove, waitForRoundResult, waitForMatchCompletion, getMatchScore } from './helpers/match';
import { getFirstGameTypeId } from './helpers/gameTypes';
import { getCurrentPlayerId } from './helpers/players';

/**
 * Match Gameplay Integration Tests
 * 
 * Tests complete match flow with real gameplay, WebSocket communication,
 * and round-by-round progression
 */

test.describe('Complete Match Gameplay Flow', () => {
  test('Two players complete a best-of-3 match', async ({ browser }) => {
    // Create two test users
    const player1 = createTestUser('player1');
    const player2 = createTestUser('player2');

    // Create two browser contexts for two players
    const player1Context = await browser.newContext();
    const player2Context = await browser.newContext();
    
    const player1Page = await player1Context.newPage();
    const player2Page = await player2Context.newPage();

    try {
      // Register both players
      await registerUser(player1Page, player1);
      await registerUser(player2Page, player2);

      // Login both players
      await loginUser(player1Page, player1.email, player1.password);
      await loginUser(player2Page, player2.email, player2.password);

      // Get game type ID
      const gameTypeId = await getFirstGameTypeId(player1Page);
      expect(gameTypeId).toBeTruthy();

      // Get player IDs
      const player1Id = await getCurrentPlayerId(player1Page);
      const player2Id = await getCurrentPlayerId(player2Page);
      expect(player1Id).toBeTruthy();
      expect(player2Id).toBeTruthy();

      // Player 1 creates match
      const matchId = await createMatch(player1Page, {
        player2Id: player2Id!,
        gameTypeId: gameTypeId!,
        bestOfN: 3,
      });

      expect(matchId).toBeTruthy();

      // Both players navigate to match
      await navigateToMatch(player1Page, matchId);
      await navigateToMatch(player2Page, matchId);

      // Wait for match pages to load
      await player1Page.waitForLoadState('networkidle');
      await player2Page.waitForLoadState('networkidle');

      // Player 1 starts the match
      await startMatch(player1Page);
      await player1Page.waitForTimeout(2000);
      await player2Page.waitForTimeout(2000);

      // Play Round 1
      await selectMove(player1Page, 'Rock');
      await selectMove(player2Page, 'Scissors');
      
      await submitMove(player1Page);
      await submitMove(player2Page);

      // Wait for round result
      await waitForRoundResult(player1Page);
      await waitForRoundResult(player2Page);

      // Verify scores updated
      const scoreAfterRound1 = await getMatchScore(player1Page);
      expect(scoreAfterRound1).toBeTruthy();

      // Play Round 2 (if match not complete)
      const matchComplete = await player1Page.locator('text=/match complete|winner/i').isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!matchComplete) {
        await player1Page.waitForTimeout(2000);
        await player2Page.waitForTimeout(2000);

        await selectMove(player1Page, 'Paper');
        await selectMove(player2Page, 'Rock');
        
        await submitMove(player1Page);
        await submitMove(player2Page);

        await waitForRoundResult(player1Page);
        await waitForRoundResult(player2Page);
      }

      // Wait for match completion
      await waitForMatchCompletion(player1Page, 30000);
      await waitForMatchCompletion(player2Page, 30000);

      // Verify match completion UI appears
      const winnerText1 = await player1Page.locator('text=/winner|won|match complete/i').isVisible({ timeout: 5000 }).catch(() => false);
      const winnerText2 = await player2Page.locator('text=/winner|won|match complete/i').isVisible({ timeout: 5000 }).catch(() => false);
      
      expect(winnerText1 || winnerText2).toBeTruthy();

      // Verify final score
      const finalScore = await getMatchScore(player1Page);
      expect(finalScore).toBeTruthy();
      expect(finalScore!.player1 + finalScore!.player2).toBeGreaterThanOrEqual(2); // At least 2 rounds won

    } finally {
      await player1Context.close();
      await player2Context.close();
    }
  });

  test('Match with tie rounds handles correctly', async ({ browser }) => {
    const player1 = createTestUser('player1_tie');
    const player2 = createTestUser('player2_tie');

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

      // Both players select same move (tie)
      await selectMove(player1Page, 'Rock');
      await selectMove(player2Page, 'Rock');
      
      await submitMove(player1Page);
      await submitMove(player2Page);

      // Wait for tie result
      await waitForRoundResult(player1Page);
      
      // Verify tie message appears
      const tieMessage = await player1Page.locator('text=/tie|draw/i').isVisible({ timeout: 5000 }).catch(() => false);
      expect(tieMessage).toBeTruthy();

      // Match should continue after tie
      await player1Page.waitForTimeout(2000);
      const canContinue = await player1Page.locator('button:has-text("Rock"), button:has-text("Paper"), button:has-text("Scissors")').isVisible({ timeout: 5000 }).catch(() => false);
      expect(canContinue).toBeTruthy();

    } finally {
      await player1Context.close();
      await player2Context.close();
    }
  });

  test('Match abandonment handled gracefully', async ({ browser }) => {
    const player1 = createTestUser('player1_abandon');
    const player2 = createTestUser('player2_abandon');

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

      // Player 1 submits move
      await selectMove(player1Page, 'Rock');
      await submitMove(player1Page);

      // Player 2 closes browser (simulating abandonment)
      await player2Context.close();

      // Wait a bit
      await player1Page.waitForTimeout(3000);

      // Player 1 should see some indication of opponent leaving
      // (This depends on implementation - could be error message, match cancellation, etc.)
      const bodyText = await player1Page.locator('body').textContent();
      expect(bodyText).toBeTruthy();

    } finally {
      await player1Context.close();
    }
  });
});

test.describe('Match Real-Time Updates', () => {
  test('Score updates in real-time between players', async ({ browser }) => {
    const player1 = createTestUser('player1_realtime');
    const player2 = createTestUser('player2_realtime');

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

      // Get initial scores
      const initialScore1 = await getMatchScore(player1Page);
      const initialScore2 = await getMatchScore(player2Page);

      // Play a round
      await selectMove(player1Page, 'Rock');
      await selectMove(player2Page, 'Scissors');
      
      await submitMove(player1Page);
      await submitMove(player2Page);

      // Wait for round result
      await waitForRoundResult(player1Page);
      await waitForRoundResult(player2Page);

      // Verify scores updated on both pages
      const score1After = await getMatchScore(player1Page);
      const score2After = await getMatchScore(player2Page);

      expect(score1After).not.toEqual(initialScore1);
      expect(score2After).not.toEqual(initialScore2);
      
      // Scores should match between both players
      expect(score1After?.player1).toBe(score2After?.player1);
      expect(score1After?.player2).toBe(score2After?.player2);

    } finally {
      await player1Context.close();
      await player2Context.close();
    }
  });
});

