/**
 * Player Routes
 * 
 * Player endpoints
 */

import { Router, Response } from 'express';
import { playerRepository } from '../config/services';

export function setupPlayerRoutes(): Router {
  const router = Router();

  /**
   * GET /api/v1/players
   * Get players list
   */
  router.get('/', async (req, res: Response) => {
    try {
      const { search, limit = 20, page = 1 } = req.query;

      let players;
      if (search && typeof search === 'string') {
        players = await playerRepository.searchByName(search, Number(limit));
      } else {
        const offset = (Number(page) - 1) * Number(limit);
        players = await playerRepository.findAll(Number(limit), offset);
      }

      res.json({
        success: true,
        data: players,
        meta: {
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: players.length,
            totalPages: Math.ceil(players.length / Number(limit)),
          },
        },
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
   * GET /api/v1/players/:id
   * Get player by ID
   */
  router.get('/:id', async (req, res: Response) => {
    try {
      const playerId = req.params['id'];
      if (!playerId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Player ID is required' },
        });
      }
      const player = await playerRepository.findById(playerId);

      if (!player) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RES_001',
            message: 'Player not found',
          },
        });
      }

      return res.json({
        success: true,
        data: player,
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
   * GET /api/v1/players/leaderboard
   * Get leaderboard
   */
  router.get('/leaderboard', async (req, res: Response) => {
    try {
      const { gameTypeId, limit = 100 } = req.query;

      // Mock implementation - would query statistics
      res.json({
        success: true,
        data: [],
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

