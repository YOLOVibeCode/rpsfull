/**
 * User Routes
 * 
 * User endpoints
 */

import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { authService } from '../config/services';

export function setupUserRoutes(): Router {
  const router = Router();

  /**
   * GET /api/v1/users/me
   * Get current user
   */
  router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'RES_001',
          message: error.message,
        },
      });
    }
  });

  return router;
}

