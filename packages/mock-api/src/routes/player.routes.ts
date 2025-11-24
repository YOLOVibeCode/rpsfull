/**
 * Player Routes
 * 
 * Player endpoints for Mock API
 */

import { Router, Response } from 'express';
import { MockDataService } from '../services/data.service';

export function setupPlayerRoutes(db: MockDataService): Router {
  const router = Router();

  /**
   * GET /api/v1/players
   * Get players list
   */
  router.get('/', (req, res: Response) => {
    const { search, limit = 20, page = 1 } = req.query;

    let players = Array.from(db['data'].players.values());

    if (search) {
      players = db.searchPlayers(search as string, Number(limit));
    }

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = players.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: players.length,
          totalPages: Math.ceil(players.length / Number(limit)),
        },
      },
    });
  });

  /**
   * GET /api/v1/players/:id
   * Get player by ID
   */
  router.get('/:id', (req, res: Response) => {
    const player = db.getPlayerById(req.params.id);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RES_001',
          message: 'Player not found',
        },
      });
    }

    res.json({
      success: true,
      data: player,
    });
  });

  /**
   * GET /api/v1/players/leaderboard
   * Get leaderboard
   */
  router.get('/leaderboard', (req, res: Response) => {
    const { gameTypeId, limit = 100 } = req.query;

    // Mock: Return empty leaderboard for now
    res.json({
      success: true,
      data: [],
    });
  });

  return router;
}

