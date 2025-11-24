/**
 * Game Type Routes
 * 
 * Game type endpoints for Mock API
 */

import { Router, Response } from 'express';
import { MockDataService } from '../services/data.service';

export function setupGameTypeRoutes(db: MockDataService): Router {
  const router = Router();

  /**
   * GET /api/v1/game-types
   * Get game types list
   */
  router.get('/', (req, res: Response) => {
    const { active } = req.query;

    let gameTypes = db.getGameTypes();

    if (active === 'true') {
      gameTypes = gameTypes.filter(gt => gt.isActive);
    }

    res.json({
      success: true,
      data: gameTypes,
    });
  });

  /**
   * GET /api/v1/game-types/:id
   * Get game type by ID
   */
  router.get('/:id', (req, res: Response) => {
    const gameType = db.getGameTypeById(req.params.id);

    if (!gameType) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RES_001',
          message: 'Game type not found',
        },
      });
    }

    res.json({
      success: true,
      data: gameType,
    });
  });

  return router;
}

