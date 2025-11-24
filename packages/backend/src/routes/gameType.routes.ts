/**
 * Game Type Routes
 * 
 * Game type endpoints
 */

import { Router, Response } from 'express';
import { gameTypeRepository } from '../config/services';

export function setupGameTypeRoutes(): Router {
  const router = Router();

  /**
   * GET /api/v1/game-types
   * Get game types list
   */
  router.get('/', async (req, res: Response) => {
    try {
      const { active } = req.query;

      let gameTypes;
      if (active === 'true') {
        gameTypes = await gameTypeRepository.findActive();
      } else {
        gameTypes = await gameTypeRepository.findAll();
      }

      res.json({
        success: true,
        data: gameTypes,
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
   * GET /api/v1/game-types/:id
   * Get game type by ID
   */
  router.get('/:id', async (req, res: Response) => {
    try {
      const gameType = await gameTypeRepository.findById(req.params.id);

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

