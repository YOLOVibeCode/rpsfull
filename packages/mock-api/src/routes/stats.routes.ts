/**
 * Statistics Routes
 * 
 * Statistics endpoints for Mock API
 */

import { Router, Response } from 'express';
import { MockDataService } from '../services/data.service';
import { mockAuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

export function setupStatsRoutes(db: MockDataService): Router {
  const router = Router();

  /**
   * GET /api/v1/users/me/stats
   * Get current user's statistics
   */
  router.get('/users/me/stats', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { gameTypeId } = req.query;

    // Mock: Return empty statistics
    res.json({
      success: true,
      data: {
        statistics: {
          id: 'stats-1',
          playerId: req.user!.id,
          gameTypeId: (gameTypeId as string) || 'default',
          totalMatches: 0,
          matchesWon: 0,
          matchesLost: 0,
          matchesTied: 0,
          winRate: 0,
          totalRounds: 0,
          roundsWon: 0,
          roundsLost: 0,
          roundsTied: 0,
          longestWinStreak: 0,
          currentWinStreak: 0,
          longestLossStreak: 0,
          currentLossStreak: 0,
          averageMatchDuration: 0,
          updatedAt: new Date(),
        },
      },
    });
  });

  /**
   * GET /api/v1/stats/head-to-head
   * Get head-to-head statistics
   */
  router.get('/head-to-head', (req, res: Response) => {
    const { player1Id, player2Id } = req.query;

    if (!player1Id || !player2Id) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: 'player1Id and player2Id are required',
        },
      });
    }

    // Mock: Return empty head-to-head stats
    res.json({
      success: true,
      data: {
        player1Id: player1Id as string,
        player2Id: player2Id as string,
        totalMatches: 0,
        player1Wins: 0,
        player2Wins: 0,
        ties: 0,
        player1WinRate: 0,
        player2WinRate: 0,
      },
    });
  });

  /**
   * GET /api/v1/stats/global
   * Get global statistics
   */
  router.get('/global', (req, res: Response) => {
    // Mock: Return empty global stats
    res.json({
      success: true,
      data: {
        totalPlayers: 0,
        totalMatches: 0,
        totalTournaments: 0,
        activeTournaments: 0,
        averageMatchesPerPlayer: 0,
      },
    });
  });

  return router;
}

