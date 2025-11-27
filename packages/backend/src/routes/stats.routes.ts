/**
 * Statistics Routes
 * 
 * Statistics endpoints
 */

import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  statisticsService,
  playerRepository,
} from '../config/services';

export function setupStatsRoutes(): Router {
  const router = Router();

  /**
   * GET /api/v1/users/me/stats
   * Get current user's statistics
   */
  router.get('/users/me/stats', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { gameTypeId } = req.query;

      // Get player ID from user
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_001', message: 'Not authenticated' },
        });
      }
      const player = await playerRepository.findByUserId(req.user['id']);
      if (!player) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RES_001',
            message: 'Player profile not found',
          },
        });
      }

      const result = await statisticsService.getPlayerStatistics(
        player.id,
        gameTypeId as string | undefined
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/stats/head-to-head
   * Get head-to-head statistics
   */
  router.get('/head-to-head', async (req, res: Response): Promise<void> => {
    try {
      const { player1Id, player2Id, gameTypeId } = req.query;

      if (!player1Id || !player2Id) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VAL_003',
            message: 'player1Id and player2Id are required',
          },
        });
      }

      const result = await statisticsService.getHeadToHeadStats(
        player1Id as string,
        player2Id as string,
        gameTypeId as string | undefined
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/stats/global
   * Get global statistics
   */
  router.get('/global', async (req, res: Response) => {
    try {
      const { gameTypeId } = req.query;
      const result = await statisticsService.getGlobalStats(gameTypeId as string | undefined);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  return router;
}

