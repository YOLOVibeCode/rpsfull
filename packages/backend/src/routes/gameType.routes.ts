/**
 * Game Type Routes
 * 
 * Game type endpoints
 */

import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { gameTypeRepository } from '../config/services';
import { IGameTypeCreate, IGameTypeUpdate } from '@rpsfull-platform/contracts';

export function setupGameTypeRoutes(): Router {
  const router = Router();

  /**
   * GET /api/v1/game-types
   * Get game types list
   * Query params:
   *   - active: 'true' to filter only active games
   *   - search: search term to filter by name
   */
  router.get('/', async (req, res: Response) => {
    try {
      const { active, search } = req.query;

      let gameTypes;
      
      // If search query provided, use search
      if (search && typeof search === 'string' && search.trim().length > 0) {
        gameTypes = await gameTypeRepository.searchByName(search.trim());
      } else if (active === 'true') {
        gameTypes = await gameTypeRepository.findActive();
      } else {
        gameTypes = await gameTypeRepository.findAll();
      }

      return res.json({
        success: true,
        data: gameTypes,
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
   * POST /api/v1/game-types
   * Create a new game type (authenticated users only)
   */
  router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data: IGameTypeCreate & { createdBy?: string } = {
        name: req.body.name,
        description: req.body.description,
        symbols: req.body.symbols,
        winMatrix: req.body.winMatrix,
        tieRules: req.body.tieRules,
        scoringMethod: req.body.scoringMethod,
        createdBy: req.user!.id,
      };

      const gameType = await gameTypeRepository.create(data);

      return res.status(201).json({
        success: true,
        data: gameType,
      });
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'GAME_001',
            message: 'A game type with this name already exists',
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'GAME_001',
          message: error.message || 'Failed to create game type',
        },
      });
    }
  });

  /**
   * GET /api/v1/game-types/my
   * Get current user's created game types
   */
  router.get('/my', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_001', message: 'Not authenticated' },
        });
      }
      const gameTypes = await gameTypeRepository.findByCreator(req.user['id']);
      return res.json({
        success: true,
        data: gameTypes,
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

      return res.json({
        success: true,
        data: gameType,
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
   * PATCH /api/v1/game-types/:id
   * Update game type (authenticated users only, creator only)
   */
  router.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameTypeId = req.params['id'];
      if (!gameTypeId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Game type ID is required' },
        });
      }
      const gameType = await gameTypeRepository.findById(gameTypeId);

      if (!gameType) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RES_001',
            message: 'Game type not found',
          },
        });
      }

      // Check if user is the creator (if createdBy exists)
      if (gameType.createdBy && gameType.createdBy !== req.user!.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'GAME_002',
            message: 'You can only edit your own game types',
          },
        });
      }

      const updateData: IGameTypeUpdate = {
        name: req.body.name,
        description: req.body.description,
        symbols: req.body.symbols,
        winMatrix: req.body.winMatrix,
        tieRules: req.body.tieRules,
        scoringMethod: req.body.scoringMethod,
        isActive: req.body.isActive,
      };

      // Calculate symbolCount if symbols are provided
      if (updateData.symbols) {
        (updateData as any).symbolCount = updateData.symbols.length;
      }

      const updated = await gameTypeRepository.update(gameTypeId, updateData);

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'GAME_001',
            message: 'A game type with this name already exists',
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'GAME_002',
          message: error.message || 'Failed to update game type',
        },
      });
    }
  });

  /**
   * DELETE /api/v1/game-types/:id
   * Delete game type (authenticated users only, creator only)
   */
  router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameTypeId = req.params['id'];
      if (!gameTypeId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Game type ID is required' },
        });
      }
      const gameType = await gameTypeRepository.findById(gameTypeId);

      if (!gameType) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'RES_001',
            message: 'Game type not found',
          },
        });
      }

      // Check if user is the creator (if createdBy exists)
      if (gameType.createdBy && gameType.createdBy !== req.user!.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'GAME_003',
            message: 'You can only delete your own game types',
          },
        });
      }

      // Prevent deletion of default games
      if (gameType.isDefault) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'GAME_003',
            message: 'Cannot delete default game types',
          },
        });
      }

      await gameTypeRepository.delete(gameTypeId);

      return res.json({
        success: true,
        message: 'Game type deleted successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'GAME_003',
          message: error.message || 'Failed to delete game type',
        },
      });
    }
  });

  return router;
}

