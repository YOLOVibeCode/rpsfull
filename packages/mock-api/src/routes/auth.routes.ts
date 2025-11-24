/**
 * Auth Routes
 * 
 * Authentication endpoints for Mock API
 */

import { Router, Response } from 'express';
import { MockDataService } from '../services/data.service';
import { mockAuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@rpsfull-platform/contracts';

export function setupAuthRoutes(db: MockDataService): Router {
  const router = Router();

  /**
   * POST /api/v1/auth/register/email
   * Register with email (magic link)
   */
  router.post('/register/email', (req, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: 'Email is required',
        },
      });
    }

    // Mock: Generate token and return immediately (for dev)
    const token = uuidv4();

    res.json({
      success: true,
      message: 'Magic link sent to your email',
      data: {
        email,
        expiresIn: 900,
        // In dev, return token directly
        token: process.env.NODE_ENV === 'development' ? token : undefined,
      },
    });
  });

  /**
   * GET /api/v1/auth/verify/email?token={token}
   * Verify email with magic link token
   */
  router.get('/verify/email', (req, res: Response) => {
    const { token } = req.query;

    if (!token) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: 'Token is required',
        },
      });
    }

    // Mock: Create user if doesn't exist
    const email = `user${Date.now()}@example.com`;
    const user = db.createUser({
      email,
      passwordHash: 'mock_hash',
      role: UserRole.PLAYER,
    });

    // Create player
    const player = db.createPlayer({
      userId: user.id,
      name: email.split('@')[0],
      email: user.email,
    });

    // Mock tokens
    const accessToken = `user-${user.id}`;
    const refreshToken = `refresh-${uuidv4()}`;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  });

  /**
   * POST /api/v1/auth/login
   * Login with email and password
   */
  router.post('/login', (req, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: 'Email and password are required',
        },
      });
    }

    // Mock: Find or create user
    let user = db.getUserByEmail(email);
    if (!user) {
      user = db.createUser({
        email,
        passwordHash: 'mock_hash',
        role: UserRole.PLAYER,
      });
      db.createPlayer({
        userId: user.id,
        name: email.split('@')[0],
        email: user.email,
      });
    }

    const accessToken = `user-${user.id}`;
    const refreshToken = `refresh-${uuidv4()}`;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  });

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  router.post('/refresh', (req, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: 'Refresh token is required',
        },
      });
    }

    // Mock: Generate new tokens
    const newAccessToken = `user-0`;
    const newRefreshToken = `refresh-${uuidv4()}`;

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  });

  /**
   * POST /api/v1/auth/logout
   * Logout (invalidate tokens)
   */
  router.post('/logout', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  return router;
}

