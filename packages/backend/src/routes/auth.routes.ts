/**
 * Auth Routes
 * 
 * Authentication endpoints
 */

import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  registerSchema,
  registerEmailSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  checkUsernameSchema,
  checkEmailSchema,
  IUsernameAvailabilityDto,
  IEmailAvailabilityDto,
} from '@rpsfull-platform/contracts';
import { authService } from '../config/services';

export function setupAuthRoutes(): Router {
  const router = Router();

  /**
   * POST /api/v1/auth/register
   * Register with email and password
   */
  router.post('/register', validateBody(registerSchema), async (req, res: Response) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/auth/register/email
   * Register with email only (magic link)
   */
  router.post(
    '/register/email',
    validateBody(registerEmailSchema),
    async (req, res: Response) => {
      try {
        const result = await authService.registerWithEmail(req.body);
        res.json({
          success: true,
          message: 'Magic link sent to your email',
          data: result,
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_001',
            message: error.message,
          },
        });
      }
    }
  );

  /**
   * GET /api/v1/auth/verify/email?token={token}
   * Verify email with magic link token
   */
  router.get('/verify/email', async (req, res: Response) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VAL_003',
            message: 'Token is required',
          },
        });
      }

      const result = await authService.verifyEmail(token);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_004',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/auth/login
   * Login with email and password
   */
  router.post('/login', validateBody(loginSchema), async (req, res: Response) => {
    try {
      const result = await authService.login(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: error.message || 'Invalid credentials',
        },
      });
    }
  });

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  router.post('/refresh', validateBody(refreshTokenSchema), async (req, res: Response) => {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: error.message || 'Invalid refresh token',
        },
      });
    }
  });

  /**
   * POST /api/v1/auth/logout
   * Logout (invalidate tokens)
   */
  router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await authService.logout(req.user!.id, req.body.refreshToken || '');
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/auth/check-username?username={username}
   * Check username availability (real-time validation)
   */
  router.get('/check-username', async (req, res: Response) => {
    try {
      const { username } = req.query;
      if (!username || typeof username !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_005',
            message: 'Username is required',
          },
        });
      }

      // Validate username format
      const validation = checkUsernameSchema.safeParse({ username });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_005',
            message: validation.error.errors[0].message,
          },
        });
      }

      const exists = await authService.checkUsernameAvailability(validation.data.username);
      
      res.json({
        success: true,
        data: {
          available: !exists,
          message: exists ? 'Username already taken' : 'Username available',
        } as IUsernameAvailabilityDto,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_005',
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/auth/check-email?email={email}
   * Check email availability (real-time validation)
   * If email exists, indicates user can sign in
   */
  router.get('/check-email', async (req, res: Response) => {
    try {
      const { email } = req.query;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_006',
            message: 'Email is required',
          },
        });
      }

      // Validate email format
      const validation = checkEmailSchema.safeParse({ email });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AUTH_006',
            message: validation.error.errors[0].message,
          },
        });
      }

      const exists = await authService.checkEmailAvailability(validation.data.email);
      
      res.json({
        success: true,
        data: {
          available: !exists,
          exists: exists,
          message: exists ? 'Email already registered - you can sign in' : 'Email available',
        } as IEmailAvailabilityDto,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUTH_006',
          message: error.message,
        },
      });
    }
  });

  return router;
}

