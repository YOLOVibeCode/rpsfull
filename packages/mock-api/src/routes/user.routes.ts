/**
 * User Routes
 * 
 * User endpoints for Mock API
 */

import { Router, Response } from 'express';
import { MockDataService } from '../services/data.service';
import { mockAuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

export function setupUserRoutes(db: MockDataService): Router {
  const router = Router();

  /**
   * GET /api/v1/users/me
   * Get current user
   */
  router.get('/me', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RES_001',
          message: 'User not found',
        },
      });
    }

    const player = db.getPlayerByUserId(user.id);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        player: player
          ? {
              id: player.id,
              name: player.name,
              displayName: player.displayName,
              level: player.level,
              ranking: player.ranking,
            }
          : null,
      },
    });
  });

  /**
   * PATCH /api/v1/users/me
   * Update current user
   */
  router.patch('/me', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const updates = req.body;
    const updated = db.updateUser(req.user!.id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RES_001',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        isEmailVerified: updated.isEmailVerified,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  });

  return router;
}

